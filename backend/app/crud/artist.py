# app/crud/artist.py

import requests
import re
import spotipy
from typing import List, Optional
from ..config import settings

# New implementation: Fetch real artist images using multiple sources
def fetch_unsplash_images(artist_name: str, limit: int = 8) -> List[str]:
    """
    Fetch artist images from Unsplash (free API, no key required for basic access)
    """
    try:
        # Unsplash public API endpoint
        url = "https://api.unsplash.com/search/photos"
        params = {
            "query": f"{artist_name} musician artist singer",
            "per_page": min(limit, 10),
            "orientation": "portrait"
        }
        headers = {
            "Accept-Version": "v1",
            "User-Agent": "Spotifetch/1.0"
        }
        
        r = requests.get(url, params=params, headers=headers, timeout=10)
        if r.status_code == 200:
            data = r.json()
            images = []
            for photo in data.get("results", []):
                # Get medium-sized image URL
                img_url = photo.get("urls", {}).get("regular")
                if img_url:
                    images.append(img_url)
            return images[:limit]
    except Exception as e:
        print(f"Unsplash fetch error for {artist_name}: {e}")
    return []

def fetch_pixabay_images(artist_name: str, limit: int = 8) -> List[str]:
    """
    Fetch images from Pixabay (free API, no key required)
    """
    try:
        url = "https://pixabay.com/api/"
        params = {
            "q": f"{artist_name} musician",
            "image_type": "photo",
            "category": "people",
            "per_page": min(limit, 20),
            "safesearch": "true"
        }
        
        r = requests.get(url, params=params, timeout=10)
        if r.status_code == 200:
            data = r.json()
            images = []
            for hit in data.get("hits", []):
                # Get web-formatted image URL
                img_url = hit.get("webformatURL")
                if img_url:
                    images.append(img_url)
            return images[:limit]
    except Exception as e:
        print(f"Pixabay fetch error for {artist_name}: {e}")
    return []

def fetch_artist_images_web_scraping(artist_name: str, limit: int = 12) -> List[str]:
    """
    Scrape artist images using a simple web search approach
    """
    try:
        import urllib.parse
        # Use DuckDuckGo images (doesn't require API key)
        search_query = urllib.parse.quote(f"{artist_name} musician artist photos")
        # This is a simplified approach - in production, you'd want to use proper scraping
        # For now, we'll combine multiple free sources
        
        images = []
        
        # Try Unsplash first
        unsplash_imgs = fetch_unsplash_images(artist_name, limit//2)
        images.extend(unsplash_imgs)
        
        # Try Pixabay as backup
        if len(images) < limit:
            pixabay_imgs = fetch_pixabay_images(artist_name, limit - len(images))
            images.extend(pixabay_imgs)
        
        # Dedupe and return
        seen = set()
        unique_images = []
        for img in images:
            if img not in seen:
                seen.add(img)
                unique_images.append(img)
        
        return unique_images[:limit]
        
    except Exception as e:
        print(f"Web scraping error for {artist_name}: {e}")
        return []

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

# Remove old Wikipedia implementation - replaced with better image sources

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

    # Get artist images - prefer Spotify, fallback to web scraping
    spotify_images = [img["url"] for img in details.get("images", [])]
    if not spotify_images:
        spotify_images = fetch_artist_images_web_scraping(details["name"], limit=3)

    artist_info = {
        "artist_name": details["name"],
        "genres":      details["genres"],
        "popularity":  details["popularity"],
        "images":      spotify_images,
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
    Return up to `limit` real artist image URLs using web scraping and free APIs
    """
    try:
        # Primary: Use web scraping approach
        images = fetch_artist_images_web_scraping(artist_name, limit)
        if images:
            return images
        
        # Fallback: Try Last.fm but filter out placeholders
        url = "http://ws.audioscrobbler.com/2.0/"
        params = {
            "method":  "artist.getInfo",
            "artist":  artist_name,
            "api_key": settings.LASTFM_KEY,
            "format":  "json",
        }
        PLACEHOLDER_SIGNATURE = "2a96cbd8b46e442fc41c2b86b821562f"
        
        r = requests.get(url, params=params, timeout=10)
        r.raise_for_status()
        imgs = r.json().get("artist", {}).get("image", [])
        raw_urls = [i["#text"].strip() for i in imgs if i.get("#text")]
        
        # Filter out placeholders
        filtered = [u for u in raw_urls if u and PLACEHOLDER_SIGNATURE not in u]
        if filtered:
            return list(dict.fromkeys(filtered))[:limit]
            
    except Exception as e:
        print(f"Error fetching images for {artist_name}: {e}")
    
    # Final fallback: return placeholder
    return ["https://via.placeholder.com/300x400/cccccc/666666?text=Artist+Photo"] * min(limit, 6)
