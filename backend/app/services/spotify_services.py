# app/services/spotify_service.py

import asyncio
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from ..config import settings
from ..db.database import songs_collection

# Spotify OAuth setup
sp_oauth = SpotifyOAuth(
    client_id=settings.SPOTIPY_CLIENT_ID,
    client_secret=settings.SPOTIPY_CLIENT_SECRET,
    redirect_uri=settings.SPOTIPY_REDIRECT_URI,
    scope="user-read-private user-top-read user-read-playback-state user-read-currently-playing user-read-email user-read-recently-played",
)

async def fetch_currently_playing():
    """
    Background task that periodically checks
    for the user's most recent played track and saves it to DB.
    """
    while True:
        try:
            token_info = sp_oauth.get_cached_token()
            if not token_info:
                print("No token found. User authentication is required.")
                await asyncio.sleep(30)
                continue

            # Refresh if expired
            if sp_oauth.is_token_expired(token_info):
                token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])

            # Create Spotipy client
            sp = spotipy.Spotify(auth=token_info["access_token"])

            # Get the most recent track
            recent_tracks_data = sp.current_user_recently_played(limit=1)

            if recent_tracks_data["items"]:
                recent_track = recent_tracks_data["items"][0]
                track_info = {
                    "track_id": recent_track["track"]["id"],
                    "track_name": recent_track["track"]["name"],
                    "artist_name": ", ".join([artist["name"] for artist in recent_track["track"]["artists"]]),
                    "album_name": recent_track["track"]["album"]["name"],
                    "album_image": recent_track["track"]["album"]["images"][0]["url"] if recent_track["track"]["album"]["images"] else None,
                    "duration_ms": recent_track["track"]["duration_ms"],
                    "played_at": recent_track["played_at"],
                    "popularity": recent_track["track"].get("popularity", 0),
                    "explicit": recent_track["track"]["explicit"],
                    "track_url": recent_track["track"]["external_urls"]["spotify"],
                }

                # Check for duplicates
                exists = songs_collection.find_one({
                    "track_id": track_info["track_id"],
                    "played_at": track_info["played_at"]
                })
                if exists:
                    print(f"Duplicate song: {track_info['track_name']} at {track_info['played_at']} - Skipping insertion.")
                else:
                    songs_collection.insert_one(track_info)
                    print(f"Saved song: {track_info['track_name']} at {track_info['played_at']}")
            else:
                print("No recently played tracks found.")

        except Exception as e:
            print(f"Error fetching currently played song: {str(e)}")

        await asyncio.sleep(30)
