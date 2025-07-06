# app/schemas/history.py

from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional

class HistoryCreate(BaseModel):
    user_id: str
    track_id: str
    track_name: str
    artist_name: str
    album_name: str
    album_image: Optional[HttpUrl]
    played_at: datetime

class HistoryOut(BaseModel):
    track_id: str
    track_name: str
    artist_name: str
    album_name: str
    album_image: Optional[HttpUrl]
    played_at: datetime
