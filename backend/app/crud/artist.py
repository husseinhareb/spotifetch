# app/crud/artist.py

import asyncio
import logging
import httpx
import re
import spotipy
from typing import List, Optional
from urllib.parse import quote

logger = logging.getLogger(__name__)

# Shared async HTTP client for connection pooling
_http_client: Optional[httpx.AsyncClient] = None
_http_client_lock: asyncio.Lock = asyncio.Lock()


async def get_http_client() -> httpx.AsyncClient:
    """Get or create a shared async HTTP client with thread-safe initialization."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        async with _http_client_lock:
            # Double-check after acquiring lock
            if _http_client is None or _http_client.is_closed:
                _http_client = httpx.AsyncClient(
                    timeout=httpx.Timeout(10.0),
                    follow_redirects=True
                )
    return _http_client


async def close_http_client() -> None:
    """Close the shared HTTP client. Call during application shutdown."""
    global _http_client
    if _http_client is not None and not _http_client.is_closed:
        await _http_client.aclose()
        _http_client = None
        logger.info("HTTP client closed")


def _get_settings():
    """Lazily import settings to avoid requiring pydantic at module import time.
    Returns the settings object or a simple namespace with no attributes.
    """
    try:
        from ..config import settings
        return settings
    except Exception:
        # return a dummy object with attribute access returning None
        class _S:
            def __getattr__(self, name):
                return None

        return _S()


async def get_artist_description(artist_name: str) -> Optional[str]:
    """
    Fetch the first two sentences of the artist bio from Last.fm.
    """
    settings = _get_settings()
    if not settings.LASTFM_KEY:
        return None
        
    # URL-encode artist name to handle special characters
    encoded_name = quote(artist_name, safe='')
    url = (
        f"http://ws.audioscrobbler.com/2.0/"
        f"?method=artist.getinfo&artist={encoded_name}"
        f"&api_key={settings.LASTFM_KEY}&format=json"
    )
    try:
        client = await get_http_client()
        r = await client.get(url)
    except httpx.RequestError as e:
        # Network error / timeout / DNS failure
        logger.debug(f"Failed to fetch Last.fm bio for {artist_name}: {e}")
        return None
    if r.status_code != 200:
        return None
    try:
        data = r.json().get("artist", {})
    except ValueError:
        # Last.fm returned non-JSON or empty body; ignore description
        return None
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
    Note: This is sync because it's called from async context but uses sync Spotify client.
    Description fetching is moved to a separate async endpoint if needed.
    """
    items = spotify_client.current_user_top_artists(
        time_range=time_range, limit=limit
    ).get("items", [])
    result = []
    for art in items:
        images = art.get("images", [])
        result.append({
            "artist_id":    art["id"],
            "artist_name":  art["name"],
            "genres":       art.get("genres", []),
            "popularity":   art.get("popularity", 0),
            "image_url":    images[0]["url"] if images and len(images) > 0 else None,
            "description":  None,  # Fetch async separately if needed
        })
    return result


def fetch_artist_info(
    spotify_client: spotipy.Spotify,
    artist_id: str,
    country: str = "US"
) -> dict:
    """
    Return detailed artist info + their top tracks.
    Bio is fetched separately to keep this sync.
    """
    details = spotify_client.artist(artist_id)
    top_tracks = spotify_client.artist_top_tracks(artist_id, country=country).get("tracks", [])

    # Get artist images from Spotify
    spotify_images = [img["url"] for img in details.get("images", []) if img.get("url")]

    # Safely build track_images list
    track_images = []
    for t in top_tracks[:5]:
        album = t.get("album", {})
        album_images = album.get("images", [])
        if album_images and len(album_images) > 0:
            track_images.append(album_images[0].get("url"))
    track_images = [img for img in track_images if img]  # Filter out None values

    artist_info = {
        "artist_name": details.get("name", "Unknown Artist"),
        "genres":      details.get("genres", []),
        "popularity":  details.get("popularity", 0),
        "images":      spotify_images,
        "description": None,  # Will be fetched async
        "track_images": track_images,
    }

    tracks = []
    for t in top_tracks:
        album = t.get("album", {})
        album_images = album.get("images", [])
        external_urls = t.get("external_urls", {})
        tracks.append({
            "track_name":   t.get("name", "Unknown Track"),
            "album_name":   album.get("name", "Unknown Album"),
            "album_image":  album_images[0]["url"] if album_images and len(album_images) > 0 else None,
            "duration_ms":  t.get("duration_ms", 0),
            "popularity":   t.get("popularity", 0),
            "external_url": external_urls.get("spotify", ""),
        })

    return {"artist_info": artist_info, "top_tracks": tracks}


async def fetch_theaudiodb_images(artist_name: str, limit: int = 10) -> List[str]:
    """
    Fetch artist images from TheAudioDB (free API, no key required for basic access).
    Returns various artist images including fanart, thumbs, logos, etc.
    """
    try:
        # TheAudioDB free API endpoint
        encoded_name = quote(artist_name, safe='')
        url = f"https://www.theaudiodb.com/api/v1/json/2/search.php?s={encoded_name}"
        
        client = await get_http_client()
        r = await client.get(url)
        
        if r.status_code == 200:
            try:
                data = r.json()
            except ValueError:
                return []
            
            artists = data.get("artists") or []
            if not artists:
                return []
            
            artist = artists[0]  # Take first match
            images = []
            
            # Collect all available image types
            image_keys = [
                "strArtistThumb",
                "strArtistFanart", "strArtistFanart2", "strArtistFanart3", "strArtistFanart4",
                "strArtistWideThumb",
                "strArtistCutout",
                "strArtistClearart",
                "strArtistBanner",
            ]
            
            for key in image_keys:
                img_url = artist.get(key)
                if img_url and img_url.strip():
                    images.append(img_url.strip())
            
            # Remove duplicates while preserving order
            return list(dict.fromkeys(images))[:limit]
            
    except httpx.RequestError as e:
        logger.debug(f"TheAudioDB fetch error for {artist_name}: {e}")
    
    return []


async def fetch_deezer_artist_images(artist_name: str, limit: int = 10) -> List[str]:
    """
    Fetch artist images from Deezer API (free, no key required).
    """
    try:
        encoded_name = quote(artist_name, safe='')
        url = f"https://api.deezer.com/search/artist?q={encoded_name}&limit=1"
        
        client = await get_http_client()
        r = await client.get(url)
        
        if r.status_code == 200:
            try:
                data = r.json()
            except ValueError:
                return []
            
            artists = data.get("data") or []
            if not artists:
                return []
            
            artist = artists[0]
            images = []
            
            # Deezer provides multiple image sizes
            for key in ["picture_xl", "picture_big", "picture_medium", "picture"]:
                img_url = artist.get(key)
                if img_url and img_url.strip():
                    images.append(img_url.strip())
                    break  # Just get the best quality one
            
            return images[:limit]
            
    except httpx.RequestError as e:
        logger.debug(f"Deezer fetch error for {artist_name}: {e}")
    
    return []


async def fetch_artist_images(artist_name: str, limit: int = 10) -> List[str]:
    """
    Return up to `limit` real artist image URLs.
    Tries multiple free sources: TheAudioDB, Deezer, then Last.fm as fallback.
    """
    settings = _get_settings()
    
    # Primary: Try TheAudioDB (free, has good artist images)
    audiodb_images = await fetch_theaudiodb_images(artist_name, limit=limit)
    if audiodb_images:
        return audiodb_images
    
    # Secondary: Try Deezer (free, no API key needed)
    deezer_images = await fetch_deezer_artist_images(artist_name, limit=limit)
    if deezer_images:
        return deezer_images
    
    # Tertiary: Try Last.fm (mostly returns placeholders now, but worth trying)
    try:
        url = "http://ws.audioscrobbler.com/2.0/"
        params = {
            "method":  "artist.getInfo",
            "artist":  artist_name,
            "api_key": getattr(settings, 'LASTFM_KEY', None),
            "format":  "json",
        }
        PLACEHOLDER_SIGNATURE = "2a96cbd8b46e442fc41c2b86b821562f"
        
        client = await get_http_client()
        r = await client.get(url, params=params)
        
        if r.status_code == 200:
            try:
                data = r.json()
            except ValueError:
                data = {}
            imgs = data.get("artist", {}).get("image", [])
            raw_urls = [i.get("#text", "").strip() for i in imgs if i.get("#text")]
            # Filter out placeholders and empty strings
            filtered = [u for u in raw_urls if u and PLACEHOLDER_SIGNATURE not in u]
            if filtered:
                return list(dict.fromkeys(filtered))[:limit]

    except httpx.RequestError as e:
        logger.debug(f"Error fetching Last.fm images for {artist_name}: {e}")

    # Final fallback: return empty list and let frontend handle placeholders
    return []


async def fetch_unsplash_images(artist_name: str, limit: int = 10) -> List[str]:
    """
    Fetch images from Unsplash using the UNSPLASH_KEY in settings.
    Returns a list of image URLs (may be empty).
    """
    settings = _get_settings()
    key = getattr(settings, "UNSPLASH_KEY", None) or getattr(settings, "UNSPLASH_ACCESS_KEY", None)
    if not key:
        return []

    url = "https://api.unsplash.com/search/photos"
    params = {"query": artist_name, "per_page": min(limit, 30)}
    headers = {"Authorization": f"Client-ID {key}"}

    try:
        client = await get_http_client()
        r = await client.get(url, params=params, headers=headers)
        if r.status_code == 200:
            data = r.json()
            results = data.get("results", [])
            urls = [item.get("urls", {}).get("regular") for item in results if item.get("urls")]
            return [u for u in urls if u][:limit]
    except httpx.RequestError as e:
        logger.debug(f"Unsplash fetch error for {artist_name}: {e}")

    return []


async def fetch_pixabay_images(artist_name: str, limit: int = 10) -> List[str]:
    """
    Fetch images from Pixabay using the PIXABAY_KEY in settings.
    Returns a list of image URLs (may be empty).
    """
    settings = _get_settings()
    key = getattr(settings, "PIXABAY_KEY", None) or getattr(settings, "PIXABAY_API_KEY", None)
    if not key:
        return []

    url = "https://pixabay.com/api/"
    params = {"key": key, "q": artist_name, "image_type": "photo", "per_page": limit}

    try:
        client = await get_http_client()
        r = await client.get(url, params=params)
        if r.status_code == 200:
            data = r.json()
            hits = data.get("hits", [])
            urls = [h.get("webformatURL") or h.get("largeImageURL") for h in hits if h]
            return [u for u in urls if u][:limit]
    except httpx.RequestError as e:
        logger.debug(f"Pixabay fetch error for {artist_name}: {e}")

    return []


async def fetch_artist_images_web_scraping(artist_name: str, limit: int = 12) -> List[str]:
    """
    Orchestrator that tries multiple sources to gather artist images.
    Preference order: TheAudioDB, Deezer, Unsplash, Pixabay.
    Returns up to `limit` unique URLs.
    """
    all_images: List[str] = []
    
    # Primary: TheAudioDB (free, best for artist-specific images)
    audiodb = await fetch_theaudiodb_images(artist_name, limit=limit)
    all_images.extend(audiodb)
    
    # If we have enough, return early
    if len(all_images) >= limit:
        return list(dict.fromkeys(all_images))[:limit]
    
    # Secondary: Deezer
    deezer = await fetch_deezer_artist_images(artist_name, limit=limit)
    all_images.extend(deezer)
    
    if len(all_images) >= limit:
        return list(dict.fromkeys(all_images))[:limit]
    
    # Tertiary: Unsplash (requires API key)
    unsplash = await fetch_unsplash_images(artist_name, limit=limit)
    all_images.extend(unsplash)
    
    if len(all_images) >= limit:
        return list(dict.fromkeys(all_images))[:limit]

    # Quaternary: Pixabay (requires API key)
    pixabay = await fetch_pixabay_images(artist_name, limit=limit)
    all_images.extend(pixabay)
    
    # Remove duplicates and return
    return list(dict.fromkeys(all_images))[:limit]
