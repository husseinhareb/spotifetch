# app/routers/history.py

from fastapi import APIRouter, Request, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import spotipy

from fastapi.encoders import jsonable_encoder

from ..services.spotify_services import sp_oauth
from ..schemas.history import HistoryCreate, HistoryOut, TopTrackOut, TopArtistOut, TopAlbumOut
from ..crud.history import save_history, get_user_history,get_top_tracks,get_top_artists, get_top_albums

router = APIRouter(
    prefix="/user/{user_id}/history",
    tags=["history"],
)

def require_spotify_client(request: Request) -> spotipy.Spotify:
    token = request.session.get("token_info")
    if not token or sp_oauth.is_token_expired(token):
        raise HTTPException(status_code=401, detail="Not authenticated")
    return spotipy.Spotify(auth=token["access_token"])

@router.post(
    "/",
    response_model=HistoryOut,
    summary="Record the currently playing track to history"
)
async def record_history(request: Request, user_id: str):
    sp = require_spotify_client(request)
    playback = sp.current_playback()
    if not playback or not playback.get("is_playing"):
        raise HTTPException(status_code=404, detail="No track currently playing")

    item = playback["item"]
    entry = HistoryCreate(
        user_id=user_id,
        track_id=item["id"],
        track_name=item["name"],
        artist_name=", ".join(a["name"] for a in item["artists"]),
        album_name=item["album"]["name"],
        album_image=(item["album"]["images"][0]["url"] if item["album"]["images"] else None),
        played_at=datetime.utcnow()
    )

    saved = save_history(entry)
    # ensure ObjectIds or datetimes are encoded properly
    return jsonable_encoder(saved)

@router.get(
    "/",
    response_model=List[HistoryOut],
    summary="Get a user's listening history"
)
async def read_history(
    request: Request,
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    since: Optional[datetime] = Query(None)
):
    require_spotify_client(request)
    return get_user_history(user_id=user_id, skip=skip, limit=limit, since=since)

@router.get(
    "/top",
    response_model=List[TopTrackOut],
    summary="Get a user's most-played tracks"
)
async def read_top_tracks(
    request: Request,
    user_id: str,
    limit: int = Query(10, ge=1, le=100),
    since: Optional[datetime] = Query(None)
):
    # ensure they’re authenticated
    token = request.session.get("token_info")
    if not token or sp_oauth.is_token_expired(token):
        raise HTTPException(status_code=401, detail="Not authenticated")

    return get_top_tracks(user_id=user_id, limit=limit, since=since)

@router.get(
    "/top-artists",
    response_model=List[TopArtistOut],
    summary="Get a user's most-played artists"
)
async def read_top_artists(
    request: Request,
    user_id: str,
    limit: int = Query(10, ge=1, le=100),
    since: Optional[datetime] = Query(None)
):
    # authenticate
    token = request.session.get("token_info")
    if not token or sp_oauth.is_token_expired(token):
        raise HTTPException(status_code=401, detail="Not authenticated")

    return get_top_artists(user_id=user_id, limit=limit, since=since)

@router.get("/top-albums", response_model=List[TopAlbumOut])
async def read_top_albums(
    request: Request,
    user_id: str,
    limit: int = Query(10, ge=1, le=100),
    since: Optional[datetime] = Query(None),
):
    """
    Get a user's most-played albums.
    """
    require_spotify_client(request)
    return get_top_albums(user_id, limit, since)

