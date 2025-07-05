# app/routers/artist.py

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import spotipy

from ..services.spotify_services import sp_oauth
from ..crud.artist import (
    fetch_top_artists,
    fetch_artist_info,
    fetch_artist_images,
)

router = APIRouter()

def require_spotify_client(request: Request) -> spotipy.Spotify:
    token = request.session.get("token_info")
    if not token or sp_oauth.is_token_expired(token):
        raise HTTPException(401, "Token not found or expired")
    return spotipy.Spotify(auth=token["access_token"])

@router.get("/top_artists")
async def top_artists(request: Request, time_range: str = "medium_term", limit: int = 10):
    client = require_spotify_client(request)
    data = fetch_top_artists(client, time_range=time_range, limit=limit)
    return JSONResponse({"top_artists": data})

@router.get("/artist_info/{artist_id}")
async def artist_info(request: Request, artist_id: str):
    client = require_spotify_client(request)
    try:
        data = fetch_artist_info(client, artist_id)
        return JSONResponse(data)
    except spotipy.SpotifyException as e:
        raise HTTPException(400, f"Spotify error: {e}")

@router.get("/artist_images/{artist_name}")
async def artist_images(artist_name: str):
    urls = fetch_artist_images(artist_name)
    return JSONResponse({"images": urls})
