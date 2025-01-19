# app/routers/tracks.py

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
import spotipy

from ..services.spotify_services import sp_oauth
from ..db.database import songs_collection
from .auth import get_token

router = APIRouter()

@router.get("/user/{username}/library/recently_played")
async def recently_played(request: Request, username: str, limit: int = 30):
    """
    Retrieves recently played tracks from Spotify directly (live).
    The `username` parameter can be used if you want to differentiate
    or validate which user is making the request.
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

@router.get("/user/{username}/library/recently_played_db")
async def recently_played_db(username: str, skip: int = 0, limit: int = 30):
    """
    Retrieves recently played tracks from the database for a given user, 
    with an option to fetch/insert new tracks if skip=0.
    """
    try:
        # If skip=0, attempt to fetch new data from Spotify first
        if skip == 0:
            token_info = sp_oauth.get_cached_token()
            if not token_info:
                raise HTTPException(status_code=401, detail="Token not found or expired")

            sp = spotipy.Spotify(auth=token_info["access_token"])
            recent_tracks_data = sp.current_user_recently_played(limit=50)

            latest_saved = songs_collection.find_one(sort=[("played_at", -1)])
            latest_saved_time = latest_saved["played_at"] if latest_saved else None

            for item in recent_tracks_data["items"]:
                track = item["track"]
                played_at = item["played_at"]

                # Only insert if more recent
                if not latest_saved_time or played_at > latest_saved_time:
                    track_info = {
                        "track_id": track["id"],
                        "track_name": track["name"],
                        "artist_name": ", ".join([artist["name"] for artist in track["artists"]]),
                        "album_name": track["album"]["name"],
                        "album_image": track["album"]["images"][0]["url"] if track["album"]["images"] else None,
                        "played_at": played_at,
                        # Optional: store the username here if you want to filter by user in the DB
                        "username": username,
                    }
                    songs_collection.insert_one(track_info)

        # Query songs from DB
        recent_tracks = list(
            songs_collection.find(
                {
                    # If you are storing "username" in your document, you can filter by username:
                    # "username": username
                }, 
                {"_id": 0}
            )
            .sort("played_at", -1)
            .skip(skip)
            .limit(limit)
        )

        return {"recent_tracks": recent_tracks}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

@router.get("/songs_most_played")
def songs_most_played():
    """
    Aggregates the songs in the DB by track_id,
    calculates how many times each song was played,
    and returns them sorted from most played to least played.
    """
    pipeline = [
        {
            "$group": {
                "_id": "$track_id",
                "doc": {"$first": "$$ROOT"},  # store first doc to get track details
                "play_count": {"$sum": 1}
            }
        },
        {"$sort": {"play_count": -1}}
    ]

    try:
        results = list(songs_collection.aggregate(pipeline))

        # Convert aggregated results into a list of songs
        songs = []
        for r in results:
            doc = r["doc"]
            doc["play_count"] = r["play_count"]
            songs.append(doc)

        return {"songs": songs}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
        
router.get("/currently_playing")
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
