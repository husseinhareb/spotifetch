import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Configure CORS (adjust the origin for your frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Secret key for session management
app.add_middleware(SessionMiddleware, secret_key=os.urandom(24))

# Spotify API credentials from environment variables
client_id = os.getenv('SPOTIPY_CLIENT_ID')
client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
redirect_uri = os.getenv('SPOTIPY_REDIRECT_URI')

# Spotify OAuth object
sp_oauth = SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope='user-read-private')

templates = Jinja2Templates(directory="templates")

@app.get('/')
async def index():
    # Redirect user to Spotify login page
    auth_url = sp_oauth.get_authorize_url()
    return RedirectResponse(auth_url)

@app.get('/callback')
async def callback(request: Request):
    # Get the authorization code from the callback URL
    code = request.query_params.get('code')
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")

    token_info = sp_oauth.get_access_token(code)

    # Save the token info in the session
    request.session['token_info'] = token_info
    return RedirectResponse(url='/welcome')

def get_token(request: Request):
    token_info = request.session.get('token_info', None)
    if not token_info:
        return None

    # Check if token is expired and refresh if needed
    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        request.session['token_info'] = token_info

    return token_info

@app.get('/welcome')
async def welcome(request: Request):
    # Get token info from session
    token_info = get_token(request)
    if not token_info:
        return RedirectResponse(url='/')

    # Create Spotify client using the user's access token
    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Get current user's information
    user_info = sp.current_user()
    username = user_info['display_name']

    return templates.TemplateResponse("welcome.html", {"request": request, "username": username})

@app.get('/user_info')
async def user_info(request: Request):
    # Get token info from session
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")

    # Create Spotify client using the user's access token
    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Get current user's information
    user_info = sp.current_user()
    return JSONResponse(user_info)

@app.get('/logout')
async def logout(request: Request):
    request.session.pop('token_info', None)
    return RedirectResponse(url='/')
