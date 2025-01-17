# app/routers/tracks.py

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
import spotipy

from ..services.spotify_services import sp_oauth
from ..db.database import songs_collection
from .auth import get_token

router = APIRouter()

@router.get("/recently_played")
async def recently_played(request: Request, limit: int = 30):
    """
    Retrieves recently played tracks from Spotify directly (live).
    """
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")

    sp = spotipy.Spotify(auth=token_info["access_token"])
    recent_tracks_data = sp.current_user_recently_played(limit=limit)

    recent_tracks = [
        {
            "track_name": item["track"]["name"],
            "artist_name": ", ".join([artist["name"] for artist in item["track"]["artists"]]),
            "album_name": item["track"]["album"]["name"],
            "album_image": item["track"]["album"]["images"][0]["url"] if item["track"]["album"]["images"] else None,
            "played_at": item["played_at"],
            "track_id": item["track"]["id"],
        }
        for item in recent_tracks_data["items"]
    ]

    return JSONResponse({"recent_tracks": recent_tracks})

@router.get("/user/{username}/library/recently_played")
async def recently_played_db(request: Request, username: str, skip: int = 0, limit: int = 30):
    """
    Retrieves recently played tracks from the database for the specified username, with an option
    to fetch/insert new tracks if skip=0.
    """
    try:
        # Step 1: Authenticate user
        token_info = get_token(request)
        if not token_info:
            raise HTTPException(status_code=401, detail="Token not found or expired")

        sp = spotipy.Spotify(auth=token_info["access_token"])
        user_info = sp.current_user()

        # Ensure the logged-in user matches the username in the URL
        if user_info["display_name"] != username:
            raise HTTPException(status_code=403, detail="Access forbidden: username mismatch")

        user_id = user_info["id"]

        # Step 2: If skip=0, fetch new data from Spotify
        if skip == 0:
            recent_tracks_data = sp.current_user_recently_played(limit=50)

            for item in recent_tracks_data["items"]:
                track = item["track"]
                played_at = item["played_at"]

                track_info = {
                    "user_id": user_id,  # Associate the song with the user
                    "track_id": track["id"],
                    "track_name": track["name"],
                    "artist_name": ", ".join([artist["name"] for artist in track["artists"]]),
                    "album_name": track["album"]["name"],
                    "album_image": track["album"]["images"][0]["url"] if track["album"]["images"] else None,
                    "played_at": played_at,
                }

                # Only insert if the song does not already exist for this user
                existing_song = songs_collection.find_one({
                    "track_id": track_info["track_id"],
                    "user_id": user_id,
                    "played_at": track_info["played_at"],
                })
                if not existing_song:
                    songs_collection.insert_one(track_info)

        # Step 3: Query songs from the DB for this user
        recent_tracks = list(
            songs_collection.find({"user_id": user_id}, {"_id": 0})
            .sort("played_at", -1)
            .skip(skip)
            .limit(limit)
        )

        return {"recent_tracks": recent_tracks}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")


@router.get("/currently_playing")
async def currently_playing(request: Request):
    """
    Returns the currently playing track for the current user and inserts it into the DB if not already present.
    """
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")

    sp = spotipy.Spotify(auth=token_info["access_token"])
    current_track = sp.current_playback()

    if current_track and current_track["is_playing"]:
        user_info = sp.current_user()
        user_id = user_info["id"]

        track_info = {
            "user_id": user_id,
            "track_id": current_track["item"]["id"],
            "track_name": current_track["item"]["name"],
            "artist_name": ", ".join([artist["name"] for artist in current_track["item"]["artists"]]),
            "album_name": current_track["item"]["album"]["name"],
            "album_image": current_track["item"]["album"]["images"][0]["url"]
            if current_track["item"]["album"]["images"]
            else None,
            "is_playing": current_track["is_playing"],
            "progress_ms": current_track["progress_ms"],
            "duration_ms": current_track["item"]["duration_ms"],
            "played_at": datetime.now().isoformat(),
        }

        # Insert into the database if not already present for this user
        existing_song = songs_collection.find_one({
            "track_id": track_info["track_id"],
            "user_id": user_id,
        })
        if not existing_song:
            songs_collection.insert_one(track_info)

        return JSONResponse(track_info)
    else:
        return JSONResponse({"message": "No track currently playing"})
