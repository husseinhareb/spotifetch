# app/services/spotify_services.py

import asyncio
from datetime import datetime
import spotipy
from spotipy.oauth2 import SpotifyOAuth

from ..config import settings
from ..db.database import songs_collection
from ..crud.history import save_history
from ..schemas.history import HistoryCreate

# Spotify OAuth setup
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
    Background task that periodically checks for the user's most recent played track,
    saves it to the `songs` collection, and also records it in `history`.
    """
    while True:
        try:
            # 1) Get and refresh token as needed
            token_info = sp_oauth.get_cached_token()
            if not token_info:
                print("No token found. User authentication is required.")
                await asyncio.sleep(30)
                continue

            if sp_oauth.is_token_expired(token_info):
                token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])

            # 2) Build Spotify client and fetch user ID
            sp = spotipy.Spotify(auth=token_info["access_token"])
            user = sp.current_user()
            user_id = user["id"]

            # 3) Fetch the most recent track
            recent_data = sp.current_user_recently_played(limit=1).get("items", [])
            if not recent_data:
                print("No recently played tracks found.")
            else:
                item = recent_data[0]
                played_at_iso = item["played_at"]  # e.g. "2025-07-10T12:34:56.789Z"
                # normalize to a timezone‐aware ISO string
                played_at_dt = datetime.fromisoformat(played_at_iso.replace("Z", "+00:00"))

                track_info = {
                    "user_id":      user_id,
                    "track_id":     item["track"]["id"],
                    "track_name":   item["track"]["name"],
                    "artist_name":  ", ".join(a["name"] for a in item["track"]["artists"]),
                    "album_name":   item["track"]["album"]["name"],
                    "album_image":  item["track"]["album"]["images"][0]["url"] if item["track"]["album"]["images"] else None,
                    "duration_ms":  item["track"]["duration_ms"],
                    "played_at":    played_at_iso,
                    "popularity":   item["track"].get("popularity", 0),
                    "explicit":     item["track"]["explicit"],
                    "track_url":    item["track"]["external_urls"]["spotify"],
                }

                # 4) Avoid duplicates in songs_collection
                exists = songs_collection.find_one({
                    "user_id":   user_id,
                    "track_id":  track_info["track_id"],
                    "played_at": track_info["played_at"],
                })
                if exists:
                    print(f"Duplicate song: {track_info['track_name']} at {track_info['played_at']} - skipping.")
                else:
                    songs_collection.insert_one(track_info)
                    print(f"Saved song: {track_info['track_name']} at {track_info['played_at']}")

                    # 5) ALSO save to history_collection via our CRUD layer
                    history_entry = HistoryCreate(
                        user_id=user_id,
                        track_id=track_info["track_id"],
                        track_name=track_info["track_name"],
                        artist_name=track_info["artist_name"],
                        album_name=track_info["album_name"],
                        album_image=track_info["album_image"],
                        played_at=played_at_dt
                    )
                    save_history(history_entry)
                    print(f"Recorded history for: {track_info['track_name']} at {played_at_iso}")

        except Exception as e:
            print(f"Error fetching currently playing song: {e}")

        # 6) pause before next poll
        await asyncio.sleep(30)
