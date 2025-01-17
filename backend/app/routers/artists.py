# app/routers/artists.py

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import spotipy
import requests
import re

from ..config import settings
from .auth import get_token

router = APIRouter()

def get_artist_description(artist_name: str):
    """
    Utility function: Fetch artist description from Last.fm.
    """
    url = f"http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist={artist_name}&api_key={settings.LASTFM_KEY}&format=json"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        if 'artist' in data and 'bio' in data['artist']:
            summary = data['artist']['bio']['summary']
            sentences = re.split(r'\. ', summary)
            first_two_sentences = ". ".join(sentences[:2]) + "."
            return first_two_sentences
    return None

@router.get("/top_artists")
async def top_artists(request: Request, time_range: str = 'medium_term', limit: int = 10):
    """
    Returns the user's top artists from Spotify, along with an optional description from Last.fm.
    """
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")

    sp = spotipy.Spotify(auth=token_info["access_token"])
    top_artists_data = sp.current_user_top_artists(time_range=time_range, limit=limit)

    top_artists = []
    for artist in top_artists_data['items']:
        description = get_artist_description(artist['name'])
        artist_data = {
            "artist_id": artist['id'], 
            "artist_name": artist['name'],
            "genres": artist['genres'],
            "popularity": artist['popularity'],
            "image_url": artist['images'][0]['url'] if artist['images'] else None,
            "description": description
        }
        top_artists.append(artist_data)

    return JSONResponse({"top_artists": top_artists})

@router.get("/artist_info/{artist_id}")
async def artist_info(request: Request, artist_id: str):
    """
    Fetches detailed info about a single artist from Spotify + top tracks + Last.fm description.
    """
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")

    sp = spotipy.Spotify(auth=token_info["access_token"])

    # Fetch artist details
    try:
        artist_details = sp.artist(artist_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching artist details: {str(e)}")

    # Fetch top tracks
    try:
        top_tracks_data = sp.artist_top_tracks(artist_id, country='US')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching top tracks: {str(e)}")

    # Get the artist's name for Last.fm
    artist_name = artist_details['name']
    description = get_artist_description(artist_name)

    # Extract artist info and images
    artist_info_data = {
        "artist_name": artist_name,
        "genres": artist_details['genres'],
        "popularity": artist_details['popularity'],
        "images": [image['url'] for image in artist_details['images']],
        "description": description,
        "track_images": [
            track['album']['images'][0]['url'] 
            for track in top_tracks_data['tracks'] if track['album']['images']
        ][:5],
    }

    # Extract top tracks
    top_tracks = [
        {
            "track_name": track['name'],
            "album_name": track['album']['name'],
            "album_image": track['album']['images'][0]['url'] if track['album']['images'] else None,
            "duration_ms": track['duration_ms'],
            "popularity": track['popularity'],
            "external_url": track['external_urls']['spotify'],
        }
        for track in top_tracks_data['tracks']
    ]

    return JSONResponse({"artist_info": artist_info_data, "top_tracks": top_tracks})

@router.get("/artist_images/{artist_name}")
async def get_artist_images(artist_name: str):
    """
    Fetch multiple images of an artist from Last.fm.
    """
    url = "http://ws.audioscrobbler.com/2.0/"
    params = {
        "method": "artist.getInfo",
        "artist": artist_name,
        "api_key": settings.LASTFM_KEY,
        "format": "json"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        image_urls = []
        if "artist" in data and "image" in data["artist"]:
            image_urls = [
                img["#text"]
                for img in data["artist"]["image"]
                if img["#text"] and "2a96cbd8b46e442fc41c2b86b821562f" not in img["#text"]
            ][:10]

        # Return placeholder images if none found
        if not image_urls:
            return JSONResponse({"images": ["https://via.placeholder.com/150"] * 10})

        return JSONResponse({"images": image_urls})

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail="Error fetching images from Last.fm")
