# app/routers/artist.py

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import spotipy

from ..services.spotify_services import sp_oauth
from ..crud.artist import (
    fetch_top_artists,
    fetch_artist_info,
    fetch_artist_images,
    fetch_artist_images_web_scraping,
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

@router.get("/artist_gallery/{artist_name}")
async def artist_gallery(artist_name: str, limit: int = 12):
    urls = fetch_artist_images_web_scraping(artist_name, limit=limit)
    return JSONResponse({"images": urls})

@router.get("/test_images/{artist_name}")
async def test_images(artist_name: str):
    """Test endpoint to verify image fetching works"""
    from ..crud.artist import fetch_unsplash_images, fetch_pixabay_images
    
    unsplash = fetch_unsplash_images(artist_name, 5)
    pixabay = fetch_pixabay_images(artist_name, 5)
    
    return JSONResponse({
        "artist": artist_name,
        "unsplash_count": len(unsplash),
        "unsplash_samples": unsplash[:2],
        "pixabay_count": len(pixabay), 
        "pixabay_samples": pixabay[:2]
    })
