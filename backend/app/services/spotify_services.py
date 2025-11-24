# app/services/spotify_services.py

import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Dict
import spotipy
from spotipy.oauth2 import SpotifyOAuth, SpotifyOauthError
from spotipy.exceptions import SpotifyException

from ..config import settings
from ..crud.history import save_history
from ..schemas.history import HistoryCreate

# Set up logging
logger = logging.getLogger(__name__)


class LastSavedTracker:
    """
    Thread-safe tracker for last saved tracks per user with TTL-based cleanup.
    Prevents memory leaks from accumulating stale user entries.
    """
    def __init__(self, ttl_seconds: int = 3600):  # 1 hour TTL
        self._data: Dict[str, Dict[str, any]] = {}
        self._ttl = ttl_seconds

    def get(self, user_id: str) -> str | None:
        entry = self._data.get(user_id)
        if entry is None:
            return None
        # Check TTL
        if time.time() - entry["timestamp"] > self._ttl:
            self._data.pop(user_id, None)
            return None
        return entry["track_id"]

    def set(self, user_id: str, track_id: str) -> None:
        self._data[user_id] = {
            "track_id": track_id,
            "timestamp": time.time()
        }

    def remove(self, user_id: str) -> None:
        self._data.pop(user_id, None)

    def cleanup_expired(self) -> int:
        """Remove all expired entries. Returns count of removed entries."""
        now = time.time()
        expired = [
            uid for uid, entry in self._data.items()
            if now - entry["timestamp"] > self._ttl
        ]
        for uid in expired:
            self._data.pop(uid, None)
        return len(expired)


# Use TTL-based tracker instead of plain dict
_last_saved = LastSavedTracker(ttl_seconds=3600)

sp_oauth = SpotifyOAuth(
    client_id=settings.SPOTIPY_CLIENT_ID,
    client_secret=settings.SPOTIPY_CLIENT_SECRET,
    redirect_uri=settings.SPOTIPY_REDIRECT_URI,
    scope=(
        "user-read-private user-top-read "
        "user-read-playback-state user-read-currently-playing "
        "user-read-email user-read-recently-played"
    ),
)

async def fetch_currently_playing():
    """
    Every 10s: poll current_playback(), and if the user's track_id
    differs from what we last recorded, save it once.
    
    Uses exponential backoff on errors, capped at 5 minutes.
    Includes periodic cleanup of stale entries to prevent memory leaks.
    """
    backoff_seconds = 10
    max_backoff = 300  # 5 minutes
    cleanup_counter = 0
    cleanup_interval = 360  # Cleanup every ~1 hour (360 * 10 seconds)
    
    while True:
        try:
            # Periodic cleanup of expired entries
            cleanup_counter += 1
            if cleanup_counter >= cleanup_interval:
                removed = _last_saved.cleanup_expired()
                if removed > 0:
                    logger.debug(f"Cleaned up {removed} expired last_saved entries")
                cleanup_counter = 0

            token_info = sp_oauth.get_cached_token()
            if not token_info:
                logger.info("No token cached; waiting for user login...")
                await asyncio.sleep(30)
                continue

            if sp_oauth.is_token_expired(token_info):
                logger.debug("Token expired, refreshing...")
                try:
                    token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])
                except SpotifyOauthError as e:
                    logger.error(f"OAuth error refreshing token: {e}")
                    # Token is invalid, wait for user to re-authenticate
                    await asyncio.sleep(60)
                    continue

            sp = spotipy.Spotify(auth=token_info["access_token"])
            user = sp.current_user()
            user_id = user.get("id")
            
            if not user_id:
                logger.warning("Could not get user ID from Spotify")
                await asyncio.sleep(backoff_seconds)
                continue

            playback = sp.current_playback()
            if playback and playback.get("is_playing"):
                item = playback.get("item")
                if item is None:
                    # Can happen with podcasts or local files
                    logger.debug("Playback active but no track item (possibly podcast/local file)")
                    await asyncio.sleep(backoff_seconds)
                    continue
                    
                track_id = item.get("id")
                if track_id is None:
                    # Local files don't have IDs
                    logger.debug("Track has no ID (likely local file)")
                    await asyncio.sleep(backoff_seconds)
                    continue

                # only save if it's a different song than last time
                if _last_saved.get(user_id) != track_id:
                    # Spotify gives you ms-precision timestamp
                    ts_ms = playback.get("timestamp", 0)
                    played_at = datetime.fromtimestamp(ts_ms / 1_000, tz=timezone.utc)

                    album = item.get("album", {})
                    album_images = album.get("images", [])
                    entry = HistoryCreate(
                        user_id=user_id,
                        track_id=track_id,
                        track_name=item.get("name", "Unknown Track"),
                        artist_name=", ".join(a.get("name", "Unknown") for a in item.get("artists", [])),
                        album_name=album.get("name", "Unknown Album"),
                        album_image=(album_images[0]["url"] if album_images else None),
                        played_at=played_at,
                    )
                    save_history(entry)
                    _last_saved.set(user_id, track_id)
                    logger.info(f"[History] {user_id} -> {item.get('name')} @ {played_at.isoformat()}")

            else:
                # playback paused or stopped: clear so a restart
                # of the same track still counts as "new."
                if _last_saved.get(user_id):
                    _last_saved.remove(user_id)
                    logger.debug(f"Playback stopped for user {user_id}, cleared last saved")

            # Reset backoff on success
            backoff_seconds = 10

        except SpotifyOauthError as e:
            logger.error(f"OAuth error in fetch_currently_playing: {e}")
            # OAuth errors need longer backoff - user may need to re-auth
            backoff_seconds = min(backoff_seconds * 2, max_backoff)
            logger.info(f"Backing off for {backoff_seconds}s due to OAuth error")

        except SpotifyException as e:
            logger.error(f"Spotify API error in fetch_currently_playing: {e}")
            # Apply exponential backoff for Spotify errors
            backoff_seconds = min(backoff_seconds * 2, max_backoff)
            logger.info(f"Backing off for {backoff_seconds}s")
            
        except KeyError as e:
            logger.error(f"Missing expected key in Spotify response: {e}")
            # Don't increase backoff for data issues
            
        except Exception as e:
            logger.exception(f"Unexpected error in fetch_currently_playing: {e}")
            # Apply backoff for unexpected errors
            backoff_seconds = min(backoff_seconds * 2, max_backoff)

        await asyncio.sleep(backoff_seconds)

