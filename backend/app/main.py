import os
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from spotipy import Spotify, SpotifyOAuth
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SPOTIPY_CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
SPOTIPY_CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")
SPOTIPY_REDIRECT_URI = "http://localhost:5173/callback"


if not SPOTIPY_CLIENT_ID or not SPOTIPY_CLIENT_SECRET:
    raise ValueError("Spotify client ID and secret must be set")

oauth = SpotifyOAuth(client_id=SPOTIPY_CLIENT_ID,
                     client_secret=SPOTIPY_CLIENT_SECRET,
                     redirect_uri=SPOTIPY_REDIRECT_URI,
                     scope="user-library-read user-top-read")

@app.get("/login")
def login():
    auth_url = oauth.get_authorize_url()
    return RedirectResponse(auth_url)

@app.get("/callback")
async def callback(request: Request):
    code = request.query_params.get("code")
    token_info = oauth.get_access_token(code)
    return RedirectResponse(f"http://localhost:5173/callback?token={token_info['access_token']}")

@app.get("/profile")
async def get_profile(token: str):
    sp = Spotify(auth=token)
    user = sp.current_user()
    return {
        "display_name": user["display_name"],
        "followers": user["followers"]["total"],
        "profile_url": user["external_urls"]["spotify"]
    }
