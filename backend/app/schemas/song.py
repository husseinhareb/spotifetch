from pydantic import BaseModel, HttpUrl
from typing import Optional

class SongBase(BaseModel):
    track_id: str
    track_name: str
    artist_name: str
    album_name: str
    album_image: Optional[HttpUrl]
    played_at: str

class SongInDB(SongBase):
    duration_ms: int
    popularity: int
    explicit: bool
    track_url: HttpUrl

class SongOut(SongBase):
    pass
