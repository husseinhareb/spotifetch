# app/routers/auth.py

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
import spotipy

from ..services.spotify_services import sp_oauth
from ..config import settings

router = APIRouter()

def get_token(request: Request):
    """
    Helper function to get token from session and refresh if needed.
    """
    token_info = request.session.get("token_info", None)
    if not token_info:
        return None

    # Refresh if expired
    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])
        request.session["token_info"] = token_info

    return token_info

@router.get("/login")
async def login():
    """
    Generates the Spotify authorization URL and returns it.
    """
    auth_url = sp_oauth.get_authorize_url()
    return JSONResponse({"auth_url": auth_url})

@router.get("/callback")
async def callback(request: Request):
    """
    Callback endpoint that Spotify redirects to after user authorizes.
    Exchanges the 'code' for an access token.
    """
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")

    token_info = sp_oauth.get_access_token(code, check_cache=False)
    if not token_info:
        raise HTTPException(status_code=400, detail="Failed to obtain access token")

    # Save token info in session
    request.session["token_info"] = token_info

    return RedirectResponse(url="/auth/welcome")

@router.get("/welcome")
async def welcome(request: Request):
    """
    After successful Spotify auth, redirect the user to your frontend.
    """
    token_info = get_token(request)
    if not token_info:
        return RedirectResponse(url="/")

    sp = spotipy.Spotify(auth=token_info["access_token"])
    user_info = sp.current_user()

    redirect_url = f"http://localhost:3000/?username={user_info['display_name']}&email={user_info.get('email', 'Not provided')}"
    return RedirectResponse(url=redirect_url)

@router.get("/logout")
async def logout(request: Request):
    """
    Logs user out by removing token from session.
    """
    request.session.pop("token_info", None)
    return RedirectResponse(url="/")

@router.get("/user_info")
async def user_info(request: Request):
    """
    Returns the current authenticated user's Spotify profile info.
    """
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")

    sp = spotipy.Spotify(auth=token_info["access_token"])
    profile = sp.current_user()

    return JSONResponse(profile)
