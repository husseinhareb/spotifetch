# app/routers/auth.py

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
import spotipy
from datetime import datetime

from ..services.spotify_services import sp_oauth
from ..db.database import users_collection

router = APIRouter()

def get_token(request: Request):
    token_info = request.session.get("token_info")
    if not token_info:
        return None

    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])
        request.session["token_info"] = token_info

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

    token_info = sp_oauth.get_access_token(code, check_cache=False)
    if not token_info:
        raise HTTPException(status_code=400, detail="Failed to obtain access token")

    request.session["token_info"] = token_info

    sp = spotipy.Spotify(auth=token_info["access_token"])
    user_info = sp.current_user()
    user_id = user_info["id"]

    user_data = {
        "user_id": user_id,
        "username": user_info.get("display_name"),
        "email": user_info.get("email"),
        "profile_image": user_info["images"][0]["url"] if user_info.get("images") else None,
        "country": user_info.get("country"),
        "product": user_info.get("product"),
        "created_at": datetime.utcnow().isoformat(),
    }

    if not users_collection.find_one({"user_id": user_id}):
        users_collection.insert_one(user_data)

    return RedirectResponse(url="/auth/welcome")

@router.get("/welcome")
async def welcome(request: Request):
    token_info = get_token(request)
    if not token_info:
        return RedirectResponse(url="/")

    sp = spotipy.Spotify(auth=token_info["access_token"])
    user_info = sp.current_user()

    # now include `id` in the query string
    redirect_url = (
        "http://localhost:3000/"
        f"?id={user_info['id']}"
        f"&username={user_info.get('display_name','')}"
        f"&email={user_info.get('email','')}"
    )
    return RedirectResponse(url=redirect_url)

@router.get("/logout")
async def logout(request: Request):
    request.session.pop("token_info", None)
    return RedirectResponse(url="/")

@router.get("/user_info")
async def user_info(request: Request):
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Not authenticated")

    sp = spotipy.Spotify(auth=token_info["access_token"])
    profile = sp.current_user()

    # return just the fields your front-end `UserInfo` expects
    return JSONResponse({
        "id": profile["id"],
        "display_name": profile.get("display_name"),
        "email": profile.get("email"),
        "images": profile.get("images", []),
        "country": profile.get("country"),
        "product": profile.get("product"),
    })
