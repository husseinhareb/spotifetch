# app/routers/auth.py

import logging
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
import spotipy
from spotipy.oauth2 import SpotifyOauthError
from datetime import datetime, timezone

from ..services.spotify_services import sp_oauth
from ..db.database import get_users_collection
from ..config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


def get_token(request: Request):
    """
    Retrieve and refresh (if needed) the Spotify OAuth token from the session.
    Returns None if no token or refresh fails.
    """
    token_info = request.session.get("token_info")
    if not token_info:
        return None

    if sp_oauth.is_token_expired(token_info):
        try:
            token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])
            request.session["token_info"] = token_info
        except SpotifyOauthError as e:
            logger.warning(f"Failed to refresh token: {e}")
            request.session.pop("token_info", None)
            return None
        except Exception as e:
            logger.error(f"Unexpected error refreshing token: {e}")
            request.session.pop("token_info", None)
            return None

    return token_info


@router.get("/login")
async def login():
    auth_url = sp_oauth.get_authorize_url()
    return JSONResponse({"auth_url": auth_url})


@router.get("/callback")
async def callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")

    try:
        token_info = sp_oauth.get_access_token(code, check_cache=False)
    except SpotifyOauthError as e:
        logger.error(f"OAuth error getting access token: {e}")
        raise HTTPException(status_code=400, detail="Failed to obtain access token")
    
    if not token_info:
        raise HTTPException(status_code=400, detail="Failed to obtain access token")

    request.session["token_info"] = token_info

    try:
        sp = spotipy.Spotify(auth=token_info["access_token"])
        user_info = sp.current_user()
    except spotipy.SpotifyException as e:
        logger.error(f"Spotify API error fetching user info: {e}")
        raise HTTPException(status_code=400, detail="Failed to fetch user info from Spotify")

    # Safely extract user_id with validation
    user_id = user_info.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid user data received from Spotify")

    # Safely extract profile image
    images = user_info.get("images") or []
    profile_image = images[0].get("url") if images and len(images) > 0 else None

    user_data = {
        "user_id": user_id,
        "username": user_info.get("display_name"),
        "email": user_info.get("email"),
        "profile_image": profile_image,
        "country": user_info.get("country"),
        "product": user_info.get("product"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Upsert user to avoid race conditions
    get_users_collection().update_one(
        {"user_id": user_id},
        {"$setOnInsert": user_data},
        upsert=True
    )

    return RedirectResponse(url="/auth/welcome")


@router.get("/welcome")
async def welcome(request: Request):
    token_info = get_token(request)
    if not token_info:
        # Redirect to frontend with auth_required flag
        return RedirectResponse(url=f"{settings.CORS_ORIGINS.split(',')[0]}/?auth_required=true")

    try:
        sp = spotipy.Spotify(auth=token_info["access_token"])
        user_info = sp.current_user()
    except spotipy.SpotifyException as e:
        logger.error(f"Spotify API error in welcome: {e}")
        return RedirectResponse(url=f"{settings.CORS_ORIGINS.split(',')[0]}/?error=spotify_api_error")

    user_id = user_info.get("id", "")
    
    # Only pass non-sensitive user_id - frontend will fetch full profile via /auth/user_info
    frontend_url = settings.CORS_ORIGINS.split(",")[0].strip()
    redirect_url = f"{frontend_url}/?authenticated=true"
    return RedirectResponse(url=redirect_url)

@router.get("/logout")
async def logout(request: Request):
    request.session.pop("token_info", None)
    frontend_url = settings.CORS_ORIGINS.split(",")[0].strip()
    return RedirectResponse(url=frontend_url)


@router.get("/user_info")
async def user_info(request: Request):
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        sp = spotipy.Spotify(auth=token_info["access_token"])
        profile = sp.current_user()
    except spotipy.SpotifyException as e:
        logger.error(f"Spotify API error fetching user info: {e}")
        raise HTTPException(status_code=503, detail="Failed to fetch user info from Spotify")

    # return just the fields your front-end `UserInfo` expects
    return JSONResponse({
        "id": profile.get("id"),
        "display_name": profile.get("display_name"),
        "email": profile.get("email"),
        "images": profile.get("images", []),
        "country": profile.get("country"),
        "product": profile.get("product"),
    })
