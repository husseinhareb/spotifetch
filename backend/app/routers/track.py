# app/routers/tracks.py

from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import JSONResponse
import spotipy

from ..services.spotify_services import sp_oauth
from ..crud.track import (
    fetch_recently_played_spotify,
    sync_recently_played_db,
    get_recently_played_db,
    get_songs_most_played,
    sync_currently_playing,
)

router = APIRouter()


def require_spotify_client(request: Request) -> spotipy.Spotify:
    token = request.session.get("token_info")
    if not token or sp_oauth.is_token_expired(token):
        raise HTTPException(status_code=401, detail="Token not found or expired")
    return spotipy.Spotify(auth=token["access_token"])


@router.get("/user/{username}/library/recently_played")
async def recently_played(
    request: Request,
    username: str,
    limit: int = Query(30, ge=1)
):
    client = require_spotify_client(request)
    tracks = fetch_recently_played_spotify(client, limit=limit)
    return {"recent_tracks": tracks}


@router.get("/user/{username}/library/recently_played_db")
async def recently_played_db(
    request: Request,
    username: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1)
):
    client = require_spotify_client(request)
    # on first page, sync Spotify → Mongo
    if skip == 0:
        sync_recently_played_db(client, username)
    tracks = get_recently_played_db(username, skip=skip, limit=limit)
    return {"recent_tracks": tracks}


@router.get("/songs_most_played")
async def songs_most_played():
    songs = get_songs_most_played()
    return {"songs": songs}


@router.get("/currently_playing")
async def currently_playing(request: Request):
    client = require_spotify_client(request)
    info = sync_currently_playing(client)

    if not info:
        # 204 No Content is semantically appropriate when nothing is playing
        return JSONResponse(status_code=204, content=None)

    # info is already a plain dict of str/int/bool
    return JSONResponse(content=info)
