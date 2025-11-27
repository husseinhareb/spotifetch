# app/routers/history.py

from fastapi import APIRouter, Request, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
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

def verify_user_authorization(sp: spotipy.Spotify, user_id: str) -> None:
    """Verify that the authenticated user matches the requested user_id."""
    current_user = sp.current_user()
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied: You can only access your own data")

@router.post(
    "/",
    response_model=HistoryOut,
    summary="Record the currently playing track to history"
)
async def record_history(request: Request, user_id: str):
    sp = require_spotify_client(request)
    verify_user_authorization(sp, user_id)
    
    playback = sp.current_playback()
    if not playback or not playback.get("is_playing"):
        raise HTTPException(status_code=404, detail="No track currently playing")

    item = playback.get("item")
    if not item:
        raise HTTPException(status_code=404, detail="No track item in playback (possibly podcast or local file)")
    
    track_id = item.get("id")
    if not track_id:
        raise HTTPException(status_code=404, detail="Track has no ID (likely a local file)")
    
    artists = item.get("artists", [])
    album = item.get("album", {})
    album_images = album.get("images", [])
    
    entry = HistoryCreate(
        user_id=user_id,
        track_id=track_id,
        track_name=item.get("name", "Unknown Track"),
        artist_name=", ".join(a.get("name", "Unknown") for a in artists),
        album_name=album.get("name", "Unknown Album"),
        album_image=(album_images[0].get("url") if album_images else None),
        played_at=datetime.now(timezone.utc)
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
    sp = require_spotify_client(request)
    verify_user_authorization(sp, user_id)
    
    # Return listening history from our database (no Spotify API call required)
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
    sp = require_spotify_client(request)
    verify_user_authorization(sp, user_id)
    
    # Return most-played tracks computed from our DB
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
    sp = require_spotify_client(request)
    verify_user_authorization(sp, user_id)
    
    # Return most-played artists from our DB
    return get_top_artists(user_id=user_id, limit=limit, since=since)

@router.get("/top-albums", response_model=List[TopAlbumOut])
async def read_top_albums(
    request: Request,
    user_id: str,
    limit: int = Query(10, ge=1, le=100),
    since: Optional[datetime] = Query(None),
):
    """
    Get a user's most-played albums from our database.
    """
    sp = require_spotify_client(request)
    verify_user_authorization(sp, user_id)
    
    return get_top_albums(user_id, limit, since)

