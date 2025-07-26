# app/services/spotify_services.py

import asyncio
from datetime import datetime, timezone
import spotipy
from spotipy.oauth2 import SpotifyOAuth

from ..config import settings
from ..crud.history import save_history
from ..schemas.history import HistoryCreate

# keep track of what we last saved, per user
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
    Every 30s: poll current_playback(), and if the user’s track_id
    differs from what we last recorded, save it once.
    """
    while True:
        try:
            token_info = sp_oauth.get_cached_token()
            if not token_info:
                print("No token; waiting for login…")
                await asyncio.sleep(30)
                continue

            if sp_oauth.is_token_expired(token_info):
                token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])

            sp = spotipy.Spotify(auth=token_info["access_token"])
            user = sp.current_user()
            user_id = user["id"]

            playback = sp.current_playback()
            if playback and playback.get("is_playing"):
                item = playback["item"]
                track_id = item["id"]

                # only save if it’s a different song than last time
                if _last_saved.get(user_id) != track_id:
                    # Spotify gives you ms-precision timestamp
                    ts_ms = playback["timestamp"]
                    played_at = datetime.fromtimestamp(ts_ms / 1_000, tz=timezone.utc)

                    entry = HistoryCreate(
                        user_id=user_id,
                        track_id=track_id,
                        track_name=item["name"],
                        artist_name=", ".join(a["name"] for a in item["artists"]),
                        album_name=item["album"]["name"],
                        album_image=(item["album"]["images"][0]["url"]
                                     if item["album"]["images"] else None),
                        played_at=played_at,
                    )
                    save_history(entry)
                    _last_saved[user_id] = track_id
                    print(f"[History] {user_id} → {item['name']} @ {played_at.isoformat()}")

            else:
                # playback paused or stopped: clear so a restart
                # of the same track still counts as “new.”
                _last_saved.pop(user_id, None)

        except Exception as e:
            print("Error in fetch_currently_playing:", e)

        await asyncio.sleep(10)
