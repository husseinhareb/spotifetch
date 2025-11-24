# app/crud/track.py

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import spotipy

from ..db.database import get_songs_collection

def fetch_recently_played_spotify(
    spotify_client: spotipy.Spotify,
    limit: int = 30
) -> List[Dict[str, Any]]:
    """
    Fetch the user's recently played tracks directly from Spotify.
    """
    data = spotify_client.current_user_recently_played(limit=limit).get("items", [])
    result = []
    for item in data:
        track = item.get("track", {})
        if not track:
            continue
        album = track.get("album", {})
        album_images = album.get("images", [])
        result.append({
            "track_id":    track.get("id"),
            "track_name":  track.get("name", "Unknown Track"),
            "artist_name": ", ".join(a.get("name", "Unknown") for a in track.get("artists", [])),
            "album_name":  album.get("name", "Unknown Album"),
            "album_image": album_images[0]["url"] if album_images and len(album_images) > 0 else None,
            "played_at":   item.get("played_at"),
        })
    return result


def sync_recently_played_db(
    spotify_client: spotipy.Spotify,
    username: str,
    limit: int = 50
) -> None:
    """
    Pull down the user's latest plays from Spotify and append any new ones
    to the songs_collection under the given username.
    """
    items = spotify_client.current_user_recently_played(limit=limit).get("items", [])
    latest = get_songs_collection().find_one(
        {"username": username},
        sort=[("played_at", -1)]
    )
    latest_time = latest["played_at"] if latest else None

    for item in items:
        played_at = item.get("played_at")
        if not played_at:
            continue
        if not latest_time or played_at > latest_time:
            track = item.get("track", {})
            if not track:
                continue
            album = track.get("album", {})
            album_images = album.get("images", [])
            doc = {
                "username":    username,
                "track_id":    track.get("id"),
                "track_name":  track.get("name", "Unknown Track"),
                "artist_name": ", ".join(a.get("name", "Unknown") for a in track.get("artists", [])),
                "album_name":  album.get("name", "Unknown Album"),
                "album_image": album_images[0]["url"] if album_images and len(album_images) > 0 else None,
                "played_at":   played_at,
            }
            get_songs_collection().insert_one(doc)


def get_recently_played_db(
    username: str,
    skip: int = 0,
    limit: int = 30
) -> List[Dict[str, Any]]:
    """
    Return a page of the plays we've stored for this username.
    """
    cursor = (
        get_songs_collection()
        .find({"username": username}, {"_id": 0})
        .sort("played_at", -1)
        .skip(skip)
        .limit(limit)
    )
    return list(cursor)


def get_songs_most_played() -> List[Dict[str, Any]]:
    """
    Aggregate songs_collection to find the most-played tracks,
    returning clean, JSON-serializable documents including play_count.
    """
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
    results = list(get_songs_collection().aggregate(pipeline))
    output: List[Dict[str, Any]] = []

    for r in results:
        doc = r["doc"]
        # Convert any HttpUrl or other objects to str
        if doc.get("album_image") is not None:
            doc["album_image"] = str(doc["album_image"])
        # Convert ObjectId to str (if still present)
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        # Attach our computed play_count
        doc["play_count"] = r["play_count"]
        output.append(doc)

    return output


def sync_currently_playing(
    spotify_client: spotipy.Spotify
) -> Optional[Dict[str, Any]]:
    """
    Fetch the user's current playback, upsert it into songs_collection,
    and return a plain-Python dict safe for JSON serialization.
    """
    playback = spotify_client.current_playback()
    if not playback or not playback.get("is_playing"):
        return None

    item = playback.get("item")
    if not item:
        # Can happen with podcasts, local files, or ads
        return None

    user = spotify_client.current_user()
    user_id = user["id"]

    # Safely access nested fields
    album = item.get("album", {})
    album_images = album.get("images", [])
    
    info: Dict[str, Any] = {
        "user_id":     user_id,
        "track_id":    item.get("id"),
        "track_name":  item.get("name", "Unknown Track"),
        "artist_name": ", ".join(a.get("name", "Unknown") for a in item.get("artists", [])),
        "album_name":  album.get("name", "Unknown Album"),
        "album_image": album_images[0]["url"] if album_images and len(album_images) > 0 else None,
        "is_playing":  playback.get("is_playing", False),
        "progress_ms": playback.get("progress_ms", 0),
        "duration_ms": item.get("duration_ms", 0),
        # Use ISO string only—no datetime objects
        "played_at":   datetime.now(timezone.utc).isoformat(),
    }

    # Only upsert if we have a valid track_id
    if info["track_id"]:
        get_songs_collection().update_one(
            {
                "user_id":   user_id,
                "track_id":  info["track_id"],
                "played_at": info["played_at"],
            },
            {"$setOnInsert": info},
            upsert=True,
        )

    # Ensure album_image is a plain string
    if info.get("album_image") is not None:
        info["album_image"] = str(info["album_image"])

    return info
