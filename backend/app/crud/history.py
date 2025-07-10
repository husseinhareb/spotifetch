# app/crud/history.py

from typing import List, Optional
from datetime import datetime
from ..db.database import history_collection
from ..schemas.history import HistoryCreate, HistoryOut

def save_history(entry: HistoryCreate) -> HistoryOut:
    """
    Insert the play event if it's not already recorded,
    then return the cleaned-up record.
    """
    # Build a pure-Python dict, converting any HttpUrl → str
    doc = entry.dict()
    if doc.get("album_image") is not None:
        doc["album_image"] = str(doc["album_image"])

    # Avoid duplicates
    exists = history_collection.find_one({
        "user_id": entry.user_id,
        "track_id": entry.track_id,
        "played_at": entry.played_at,
    })
    if not exists:
        history_collection.insert_one(doc)

    # Fetch back without any internal fields
    raw = history_collection.find_one(
        {
            "user_id": entry.user_id,
            "track_id": entry.track_id,
            "played_at": entry.played_at,
        },
        {"_id": 0, "user_id": 0}
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
