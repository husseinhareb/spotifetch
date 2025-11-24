# app/crud/history.py

import logging
from typing import List, Optional
from datetime import datetime
from pymongo.errors import DuplicateKeyError
from ..db.database import history_collection
from ..schemas.history import HistoryCreate, HistoryOut, TopTrackOut, TopArtistOut, TopAlbumOut

logger = logging.getLogger(__name__)


def save_history(entry: HistoryCreate) -> HistoryOut:
    """
    Insert the play event if it's not already recorded,
    using upsert to prevent race conditions.
    Returns the cleaned-up record.
    """
    # Build a pure-Python dict, converting any HttpUrl → str
    doc = entry.model_dump()
    if doc.get("album_image") is not None:
        doc["album_image"] = str(doc["album_image"])

    # Use upsert to atomically insert if not exists (prevents race conditions)
    # The unique compound index on (user_id, track_id, played_at) ensures no duplicates
    try:
        history_collection.update_one(
            {
                "user_id": entry.user_id,
                "track_id": entry.track_id,
                "played_at": entry.played_at,
            },
            {"$setOnInsert": doc},
            upsert=True
        )
    except DuplicateKeyError:
        # Already exists - this is fine, just log it
        logger.debug(f"Duplicate history entry ignored: {entry.user_id}/{entry.track_id}")

    # Fetch back without any internal fields
    raw = history_collection.find_one(
        {
            "user_id": entry.user_id,
            "track_id": entry.track_id,
            "played_at": entry.played_at,
        },
        {"_id": 0, "user_id": 0}
    )
    
    if raw is None:
        # Fallback: construct from input if query fails
        return HistoryOut(
            track_id=entry.track_id,
            track_name=entry.track_name,
            artist_name=entry.artist_name,
            album_name=entry.album_name,
            album_image=entry.album_image,
            played_at=entry.played_at
        )
    
    return HistoryOut(**raw)


def get_user_history(
    user_id: str,
    skip: int = 0,
    limit: int = 50,
    since: Optional[datetime] = None
) -> List[HistoryOut]:
    """
    Return a paginated, optionally time-filtered list of plays for one user.
    """
    query: dict = {"user_id": user_id}
    if since:
        query["played_at"] = {"$gte": since}

    cursor = (
        history_collection
        .find(query, {"_id": 0, "user_id": 0})
        .sort("played_at", -1)
        .skip(skip)
        .limit(limit)
    )
    return [HistoryOut(**doc) for doc in cursor]

def get_top_tracks(
    user_id: str,
    limit: int = 10,
    since: Optional[datetime] = None
) -> List[TopTrackOut]:
    """
    Return the user's most-played tracks, sorted by play_count desc.
    """
    match_stage = { "user_id": user_id }
    if since:
        match_stage["played_at"] = { "$gte": since }

    pipeline = [
        { "$match": match_stage },
        { 
          "$group": {
            "_id": "$track_id",
            "play_count": { "$sum": 1 },
            "track_name": { "$first": "$track_name" },
            "artist_name": { "$first": "$artist_name" },
            "album_name": { "$first": "$album_name" },
            "album_image": { "$first": "$album_image" }
          }
        },
        { "$sort": { "play_count": -1 } },
        { "$limit": limit },
        { 
          "$project": {
            "_id": 0,
            "track_id": "$_id",
            "track_name": 1,
            "artist_name": 1,
            "album_name": 1,
            "album_image": 1,
            "play_count": 1
          }
        }
    ]

    results = history_collection.aggregate(pipeline)
    return [TopTrackOut(**doc) for doc in results]

def get_top_artists(
    user_id: str,
    limit: int = 10,
    since: Optional[datetime] = None
) -> List[TopArtistOut]:
    """
    Return the user's most‐played artists, sorted by play_count desc.
    """
    match_stage = {"user_id": user_id}
    if since:
        match_stage["played_at"] = {"$gte": since}

    pipeline = [
        {"$match": match_stage},
        {
            "$group": {
                "_id": "$artist_name",
                "play_count": {"$sum": 1},
                "artist_image": {"$first": "$album_image"}
            }
        },
        {"$sort": {"play_count": -1}},
        {"$limit": limit},
        {
            "$project": {
                "_id": 0,
                "artist_name": "$_id",
                "play_count": 1,
                "artist_image": 1
            }
        }
    ]

    results = history_collection.aggregate(pipeline)
    return [TopArtistOut(**doc) for doc in results]


def get_top_albums(
    user_id: str,
    limit: int = 10,
    since: Optional[datetime] = None
) -> List[TopAlbumOut]:
    """
    Return the user's most‐played albums, sorted by play_count desc.
    """
    match_stage = {"user_id": user_id}
    if since:
        match_stage["played_at"] = {"$gte": since}

    pipeline = [
        {"$match": match_stage},
        {
            "$group": {
                "_id": "$album_name",
                "play_count": {"$sum": 1},
                "artist_name": {"$first": "$artist_name"},
                "album_image": {"$first": "$album_image"},
            }
        },
        {"$sort": {"play_count": -1}},
        {"$limit": limit},
        {
            "$project": {
                "_id":       0,
                "album_name":"$_id",
                "artist_name": 1,
                "album_image": 1,
                "play_count":  1,
            }
        }
    ]

    results = history_collection.aggregate(pipeline)
    return [TopAlbumOut(**doc) for doc in results]