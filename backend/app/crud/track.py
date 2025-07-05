# app/crud/track.py

from typing import List, Dict, Any, Optional
from datetime import datetime
import spotipy
from ..db.database import songs_collection

def fetch_recently_played_spotify(
    spotify_client: spotipy.Spotify,
    limit: int = 30
) -> List[Dict[str, Any]]:
    data = spotify_client.current_user_recently_played(limit=limit).get("items", [])
    return [
        {
            "track_id": item["track"]["id"],
            "track_name": item["track"]["name"],
            "artist_name": ", ".join(a["name"] for a in item["track"]["artists"]),
            "album_name": item["track"]["album"]["name"],
            "album_image": (
                item["track"]["album"]["images"][0]["url"]
                if item["track"]["album"]["images"] else None
            ),
            "played_at": item["played_at"],
        }
        for item in data
    ]

def sync_recently_played_db(
    spotify_client: spotipy.Spotify,
    username: str,
    limit: int = 50
) -> None:
    items = spotify_client.current_user_recently_played(limit=limit).get("items", [])
    latest = songs_collection.find_one(
        {"username": username},
        sort=[("played_at", -1)]
    )
    latest_time = latest["played_at"] if latest else None

    for item in items:
        played_at = item["played_at"]
        if not latest_time or played_at > latest_time:
            track = item["track"]
            doc = {
                "track_id":    track["id"],
                "track_name":  track["name"],
                "artist_name": ", ".join(a["name"] for a in track["artists"]),
                "album_name":  track["album"]["name"],
                "album_image": (
                    track["album"]["images"][0]["url"]
                    if track["album"]["images"] else None
                ),
                "played_at":   played_at,
                "username":    username,
            }
            songs_collection.insert_one(doc)

def get_recently_played_db(
    username: str,
    skip: int = 0,
    limit: int = 30
) -> List[Dict[str, Any]]:
    cursor = (
        songs_collection
        .find({"username": username}, {"_id": 0})
        .sort("played_at", -1)
        .skip(skip)
        .limit(limit)
    )
    return list(cursor)

def get_songs_most_played() -> List[Dict[str, Any]]:
    pipeline = [
        {
            "$group": {
                "_id": "$track_id",
                "doc": {"$first": "$$ROOT"},
                "play_count": {"$sum": 1},
            }
        },
        {"$sort": {"play_count": -1}}
    ]
    results = list(songs_collection.aggregate(pipeline))

    songs = []
    for r in results:
        doc = r["doc"]
        doc["play_count"] = r["play_count"]
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        songs.append(doc)
    return songs

def sync_currently_playing(
    spotify_client: spotipy.Spotify
) -> Optional[Dict[str, Any]]:
    playback = spotify_client.current_playback()
    if not playback or not playback.get("is_playing"):
        return None

    user = spotify_client.current_user()
    user_id = user["id"]
    item = playback["item"]
    info = {
        "user_id":     user_id,
        "track_id":    item["id"],
        "track_name":  item["name"],
        "artist_name": ", ".join(a["name"] for a in item["artists"]),
        "album_name":  item["album"]["name"],
        "album_image": (
            item["album"]["images"][0]["url"]
            if item["album"]["images"] else None
        ),
        "is_playing":  playback["is_playing"],
        "progress_ms": playback["progress_ms"],
        "duration_ms": item["duration_ms"],
        "played_at":   datetime.utcnow().isoformat(),
    }

    exists = songs_collection.find_one({
        "user_id":  user_id,
        "track_id": info["track_id"],
    })
    if not exists:
        songs_collection.insert_one(info)

    return info
