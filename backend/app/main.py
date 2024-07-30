import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses.RedirectResponse
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
SPOTIPY_REDIRECT_URI = os.getenv("SPOTIPY_REDIRECT_URI", "http://localhost:5173/callback")

if not SPOTIPY_CLIENT_ID or not SPOTIPY_CLIENT_SECRET:
    raise ValueError("Spotify client ID and secret must be set")

oauth = SpotifyOAuth(
    client_id=SPOTIPY_CLIENT_ID,
    client_secret=SPOTIPY_CLIENT_SECRET,
    redirect_uri=SPOTIPY_REDIRECT_URI,
    scope="user-library-read user-top-read"
)

@app.get("/login")
def login():
    auth_url = oauth.get_authorize_url()
    print(f"Authorization URL: {auth_url}")  # Print the authorization URL
    return RedirectResponse(auth_url)

@app.get("/callback")
async def callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Code not provided")
    
    token_info = oauth.get_access_token(code)
    if not token_info:
        raise HTTPException(status_code=400, detail="Unable to get token")
    
    return RedirectResponse(f"http://localhost:5173/callback?token={token_info['access_token']}")

@app.get("/profile")
async def get_profile(token: str):
    sp = Spotify(auth=token)
    try:
        user = sp.current_user()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching profile: {e}")
    
    return {
        "display_name": user.get("display_name"),
        "followers": user.get("followers", {}).get("total", 0),
        "profile_url": user.get("external_urls", {}).get("spotify")
    }
