# app/crud/artist.py

import requests
import re
import spotipy
from typing import List, Optional
from ..config import settings

def get_artist_description(artist_name: str) -> Optional[str]:
    """
    Fetch the first two sentences of the artist bio from Last.fm.
    """
    url = (
        f"http://ws.audioscrobbler.com/2.0/"
        f"?method=artist.getinfo&artist={artist_name}"
        f"&api_key={settings.LASTFM_KEY}&format=json"
    )
    r = requests.get(url)
    if r.status_code != 200:
        return None
    data = r.json().get("artist", {})
    summary = data.get("bio", {}).get("summary", "")
    sentences = re.split(r'\.\s*', summary)
    if len(sentences) >= 2:
        return sentences[0] + ". " + sentences[1] + "."
    return summary or None

def fetch_top_artists(
    spotify_client: spotipy.Spotify,
    time_range: str = "medium_term",
    limit: int = 10
) -> List[dict]:
    """
    Return list of user's top artists with an optional Last.fm description.
    """
    items = spotify_client.current_user_top_artists(
        time_range=time_range, limit=limit
    ).get("items", [])
    result = []
    for art in items:
        desc = get_artist_description(art["name"])
        result.append({
            "artist_id":    art["id"],
            "artist_name":  art["name"],
            "genres":       art["genres"],
            "popularity":   art["popularity"],
            "image_url":    art["images"][0]["url"] if art["images"] else None,
            "description":  desc,
        })
    return result

def fetch_artist_info(
    spotify_client: spotipy.Spotify,
    artist_id: str,
    country: str = "US"
) -> dict:
    """
    Return detailed artist info + their top tracks + Last.fm bio.
    """
    details = spotify_client.artist(artist_id)
    top_tracks = spotify_client.artist_top_tracks(artist_id, country=country).get("tracks", [])
    desc = get_artist_description(details["name"])

    artist_info = {
        "artist_name": details["name"],
        "genres":      details["genres"],
        "popularity":  details["popularity"],
        "images":      [img["url"] for img in details.get("images", [])],
        "description": desc,
        "track_images": [
            t["album"]["images"][0]["url"]
            for t in top_tracks if t["album"].get("images")
        ][:5],
    }

    tracks = []
    for t in top_tracks:
        tracks.append({
            "track_name":   t["name"],
            "album_name":   t["album"]["name"],
            "album_image":  t["album"]["images"][0]["url"] if t["album"].get("images") else None,
            "duration_ms":  t["duration_ms"],
            "popularity":   t["popularity"],
            "external_url": t["external_urls"]["spotify"],
        })

    return {"artist_info": artist_info, "top_tracks": tracks}

def fetch_artist_images(artist_name: str, limit: int = 10) -> List[str]:
    """
    Return up to `limit` image URLs from Last.fm (or placeholders).
    """
    url = "http://ws.audioscrobbler.com/2.0/"
    params = {
        "method":  "artist.getInfo",
        "artist":  artist_name,
        "api_key": settings.LASTFM_KEY,
        "format":  "json",
    }
    try:
        r = requests.get(url, params=params)
        r.raise_for_status()
        imgs = r.json().get("artist", {}).get("image", [])
        urls = [i["#text"] for i in imgs if i["#text"]]
        if not urls:
            raise ValueError("No images")
        return urls[:limit]
    except Exception:
        return ["https://via.placeholder.com/150"] * limit
