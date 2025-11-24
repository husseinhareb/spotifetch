# app/services/spotify_services.py

import asyncio
import logging
from datetime import datetime, timezone
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.exceptions import SpotifyException

from ..config import settings
from ..crud.history import save_history
from ..schemas.history import HistoryCreate

# Set up logging
logger = logging.getLogger(__name__)

# keep track of what we last saved, per user
# NOTE: In multi-worker deployments, consider using Redis or DB for this
_last_saved: dict[str, str] = {}

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
    """
    backoff_seconds = 10
    max_backoff = 300  # 5 minutes
    
    while True:
        try:
            token_info = sp_oauth.get_cached_token()
            if not token_info:
                logger.info("No token cached; waiting for user login...")
                await asyncio.sleep(30)
                continue

            if sp_oauth.is_token_expired(token_info):
                logger.debug("Token expired, refreshing...")
                token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])

            sp = spotipy.Spotify(auth=token_info["access_token"])
            user = sp.current_user()
            user_id = user["id"]

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

                    album_images = item.get("album", {}).get("images", [])
                    entry = HistoryCreate(
                        user_id=user_id,
                        track_id=track_id,
                        track_name=item.get("name", "Unknown Track"),
                        artist_name=", ".join(a.get("name", "Unknown") for a in item.get("artists", [])),
                        album_name=item.get("album", {}).get("name", "Unknown Album"),
                        album_image=(album_images[0]["url"] if album_images else None),
                        played_at=played_at,
                    )
                    save_history(entry)
                    _last_saved[user_id] = track_id
                    logger.info(f"[History] {user_id} -> {item.get('name')} @ {played_at.isoformat()}")

            else:
                # playback paused or stopped: clear so a restart
                # of the same track still counts as "new."
                if user_id in _last_saved:
                    _last_saved.pop(user_id, None)
                    logger.debug(f"Playback stopped for user {user_id}, cleared last saved")

            # Reset backoff on success
            backoff_seconds = 10

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

