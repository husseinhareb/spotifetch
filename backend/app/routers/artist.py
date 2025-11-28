# app/routers/artist.py

import re
from fastapi import APIRouter, Request, HTTPException, Query, Path
from fastapi.responses import JSONResponse
from typing import Annotated
import spotipy

from ..services.spotify_services import sp_oauth
from ..crud.artist import (
    fetch_top_artists,
    fetch_artist_info,
    fetch_artist_images,
    fetch_artist_images_web_scraping,
)

router = APIRouter()

# Spotify IDs are 22 characters, base62 encoded (alphanumeric)
SPOTIFY_ID_PATTERN = r'^[a-zA-Z0-9]{22}$'


def validate_spotify_id(artist_id: str) -> str:
    """Validate that artist_id is a valid Spotify ID format."""
    if not re.match(SPOTIFY_ID_PATTERN, artist_id):
        raise HTTPException(
            status_code=400, 
            detail="Invalid artist ID format. Must be a 22-character alphanumeric Spotify ID."
        )
    return artist_id


def validate_artist_name(name: str) -> str:
    """Validate and sanitize artist name."""
    # Remove any potentially dangerous characters but allow unicode for international names
    sanitized = name.strip()
    if not sanitized or len(sanitized) > 200:
        raise HTTPException(
            status_code=400,
            detail="Artist name must be between 1 and 200 characters."
        )
    return sanitized


def require_spotify_client(request: Request) -> spotipy.Spotify:
    token = request.session.get("token_info")
    if not token or sp_oauth.is_token_expired(token):
        raise HTTPException(401, "Token not found or expired")
    return spotipy.Spotify(auth=token["access_token"])


@router.get("/top_artists")
async def top_artists(
    request: Request, 
    time_range: Annotated[str, Query(pattern=r'^(short_term|medium_term|long_term)$')] = "medium_term",
    limit: Annotated[int, Query(ge=1, le=50)] = 10
):
    client = require_spotify_client(request)
    data = fetch_top_artists(client, time_range=time_range, limit=limit)
    return JSONResponse({"top_artists": data})


@router.get("/artist_info/{artist_id}")
async def artist_info(
    request: Request, 
    artist_id: Annotated[str, Path(pattern=SPOTIFY_ID_PATTERN, description="Spotify artist ID")]
):
    client = require_spotify_client(request)
    try:
        data = fetch_artist_info(client, artist_id)
        return JSONResponse(data)
    except spotipy.SpotifyException as e:
        raise HTTPException(400, f"Spotify error: {e}")


@router.get("/artist_images/{artist_name:path}")
async def artist_images(
    artist_name: Annotated[str, Path(min_length=1, max_length=200)]
):
    sanitized_name = validate_artist_name(artist_name)
    urls = await fetch_artist_images(sanitized_name)
    return JSONResponse({"images": urls})


@router.get("/artist_gallery/{artist_name:path}")
async def artist_gallery(
    artist_name: Annotated[str, Path(min_length=1, max_length=200)],
    limit: Annotated[int, Query(ge=1, le=50)] = 12
):
    sanitized_name = validate_artist_name(artist_name)
    urls = await fetch_artist_images_web_scraping(sanitized_name, limit=limit)
    return JSONResponse({"images": urls})


@router.get("/test_images/{artist_name:path}")
async def test_images(
    artist_name: Annotated[str, Path(min_length=1, max_length=200)]
):
    """Test endpoint to verify image fetching works"""
    from ..crud.artist import (
        fetch_unsplash_images, 
        fetch_pixabay_images,
        fetch_theaudiodb_images,
        fetch_deezer_artist_images
    )
    
    sanitized_name = validate_artist_name(artist_name)
    
    audiodb = await fetch_theaudiodb_images(sanitized_name, 5)
    deezer = await fetch_deezer_artist_images(sanitized_name, 5)
    unsplash = await fetch_unsplash_images(sanitized_name, 5)
    pixabay = await fetch_pixabay_images(sanitized_name, 5)
    
    return JSONResponse({
        "artist": sanitized_name,
        "theaudiodb_count": len(audiodb),
        "theaudiodb_samples": audiodb[:3],
        "deezer_count": len(deezer),
        "deezer_samples": deezer[:3],
        "unsplash_count": len(unsplash),
        "unsplash_samples": unsplash[:2],
        "pixabay_count": len(pixabay), 
        "pixabay_samples": pixabay[:2]
    })
