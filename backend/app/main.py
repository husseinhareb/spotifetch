from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Match your frontend origin exactly
    allow_credentials=True,  # This must be True to allow cookies in requests
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
# Updated scope to include playback-related permissions
sp_oauth = SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope='user-read-private user-top-read user-read-playback-state user-read-currently-playing'
)

@app.get('/')
async def index():
    return {"message": "Welcome to Spotifetch"}

@app.get('/login')
async def login():
    # Generate Spotify authorization URL
    auth_url = sp_oauth.get_authorize_url()
    return JSONResponse({"auth_url": auth_url})

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
    # Redirect to the React frontend with a query parameter for the username
    return RedirectResponse(url=f'http://localhost:3000/?username={user_info["display_name"]}')

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

@app.get('/currently_playing')
async def currently_playing(request: Request):
    # Get token info from session
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")

    # Create Spotify client using the user's access token
    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Get the currently playing track
    current_track = sp.current_playback()

    if current_track and current_track['is_playing']:
        # Extract necessary information from the currently playing track
        track_info = {
            "track_name": current_track['item']['name'],
            "artist_name": ", ".join([artist['name'] for artist in current_track['item']['artists']]),
            "album_name": current_track['item']['album']['name'],
            "album_image": current_track['item']['album']['images'][0]['url'] if current_track['item']['album']['images'] else None,
            "is_playing": current_track['is_playing'],
            "progress_ms": current_track['progress_ms'],  # Current progress in the song
            "duration_ms": current_track['item']['duration_ms']  # Total duration of the song
        }
        return JSONResponse(track_info)
    else:
        return JSONResponse({"message": "No track currently playing"})

@app.get('/top_artists')
async def top_artists(request: Request, time_range: str = 'medium_term', limit: int = 10):
    """
    Fetch the top artists for the current user.
    `time_range` can be one of 'short_term', 'medium_term', or 'long_term'.
    `limit` specifies the number of top artists to retrieve (default is 10).
    """
    # Get token info from session
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")

    # Create Spotify client using the user's access token
    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Get the current user's top artists based on the specified time range
    top_artists_data = sp.current_user_top_artists(time_range=time_range, limit=limit)

    # Extract relevant information
    top_artists = [
        {
            "artist_name": artist['name'],
            "genres": artist['genres'],
            "popularity": artist['popularity'],
            "image_url": artist['images'][0]['url'] if artist['images'] else None
        }
        for artist in top_artists_data['items']
    ]

    return JSONResponse({"top_artists": top_artists})
@app.get('/recently_played')
async def recently_played(request: Request, limit: int = 30):
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")

    # Create Spotify client using the user's access token
    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Get the current user's recently played tracks
    recent_tracks_data = sp.current_user_recently_played(limit=limit)

    # Extract relevant information
    recent_tracks = [
        {
            "track_name": item['track']['name'],
            "artist_name": ", ".join([artist['name'] for artist in item['track']['artists']]),
            "album_name": item['track']['album']['name'],
            "album_image": item['track']['album']['images'][0]['url'] if item['track']['album']['images'] else None,
            "played_at": item['played_at'],
            "track_id": item['track']['id']
        }
        for item in recent_tracks_data['items']
    ]

    return JSONResponse({"recent_tracks": recent_tracks})
