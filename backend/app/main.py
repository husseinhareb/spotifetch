from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import re
import requests
from pymongo import MongoClient
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Match your frontend origin exactly
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
last_fm_api_key = os.getenv("LASTFM_KEY")

# MongoDB configuration
mongo_uri = os.getenv('MONGO_URI')
mongo_db_name = os.getenv('MONGO_DB_NAME')
client = MongoClient(mongo_uri)
db = client[mongo_db_name]
songs_collection = db['songs']

# Spotify OAuth object with required scopes
sp_oauth = SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope='user-read-private user-top-read user-read-playback-state user-read-currently-playing user-read-email user-read-recently-played'
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

    # Exchange the code for an access token for the specific user
    token_info = sp_oauth.get_access_token(code, check_cache=False)

    if not token_info:
        raise HTTPException(status_code=400, detail="Failed to obtain access token")

    # Save the token info in the session. Each user's token info is different.
    request.session['token_info'] = token_info

    return RedirectResponse(url='/welcome')

def get_token(request: Request):
    token_info = request.session.get('token_info', None)

    if not token_info:
        return None

    # Check if token is expired and refresh it if needed
    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        request.session['token_info'] = token_info

    return token_info

@app.get('/welcome')
async def welcome(request: Request):
    # Get token info from the session
    token_info = get_token(request)

    if not token_info:
        return RedirectResponse(url='/')

    # Create a Spotify client using the specific user's access token
    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Get current user's information
    user_info = sp.current_user()

    # Redirect to the React frontend with a query parameter for the username
    redirect_url = f'http://localhost:3000/?username={user_info["display_name"]}&email={user_info.get("email", "Not provided")}'
    return RedirectResponse(url=redirect_url)

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
            "duration_ms": current_track['item']['duration_ms'],  # Total duration of the song
            "played_at": datetime.now()
        }

        # Save the currently playing song to MongoDB
        user_info = sp.current_user()
        track_info["user_id"] = user_info["id"]
        songs_collection.insert_one(track_info)

        return JSONResponse(track_info)
    else:
        return JSONResponse({"message": "No track currently playing"})

def get_artist_description(artist_name):
    url = f"http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist={artist_name}&api_key={last_fm_api_key}&format=json"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if 'artist' in data and 'bio' in data['artist']:
            summary = data['artist']['bio']['summary']
            sentences = re.split(r'\. ', summary)
            first_two_sentences = ". ".join(sentences[:2]) + "."
            return first_two_sentences
    return None

@app.get('/top_artists')
async def top_artists(request: Request, time_range: str = 'medium_term', limit: int = 10):
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")

    sp = spotipy.Spotify(auth=token_info['access_token'])
    top_artists_data = sp.current_user_top_artists(time_range=time_range, limit=limit)

    top_artists = []
    for artist in top_artists_data['items']:
        description = get_artist_description(artist['name'])
        artist_data = {
            "artist_id": artist['id'], 
            "artist_name": artist['name'],
            "genres": artist['genres'],
            "popularity": artist['popularity'],
            "image_url": artist['images'][0]['url'] if artist['images'] else None,
            "description": description
        }
        top_artists.append(artist_data)

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

@app.get('/artist_info/{artist_id}')
async def artist_info(request: Request, artist_id: str):
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")

    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Fetch artist details
    try:
        artist_details = sp.artist(artist_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching artist details: {str(e)}")

    # Fetch top tracks
    try:
        top_tracks_data = sp.artist_top_tracks(artist_id, country='US')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching top tracks: {str(e)}")

    # Get the artist's name for Last.fm description fetching
    artist_name = artist_details['name']
    description = get_artist_description(artist_name)  # Fetch description from Last.fm

    # Extract artist info and images
    artist_info = {
        "artist_name": artist_name,
        "genres": artist_details['genres'],
        "popularity": artist_details['popularity'],
        "images": [image['url'] for image in artist_details['images']],
        "description": description,  # Add the description
        "track_images": [
            track['album']['images'][0]['url'] 
            for track in top_tracks_data['tracks'] if track['album']['images']
        ][:5],  # Limit to 5 additional images
    }

    # Extract top tracks info
    top_tracks = [
        {
            "track_name": track['name'],
            "album_name": track['album']['name'],
            "album_image": track['album']['images'][0]['url'] if track['album']['images'] else None,
            "duration_ms": track['duration_ms'],
            "popularity": track['popularity'],
            "external_url": track['external_urls']['spotify'],
        }
        for track in top_tracks_data['tracks']
    ]

    return JSONResponse({"artist_info": artist_info, "top_tracks": top_tracks})

@app.get('/artist_images/{artist_name}')
async def get_artist_images(artist_name: str):
    url = "http://ws.audioscrobbler.com/2.0/"
    params = {
        "method": "artist.getInfo",
        "artist": artist_name,
        "api_key": last_fm_api_key,
        "format": "json"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        # Extract multiple images
        image_urls = []
        if "artist" in data and "image" in data["artist"]:
            image_urls = [
                img["#text"]
                for img in data["artist"]["image"]
                if img["#text"] and "2a96cbd8b46e442fc41c2b86b821562f" not in img["#text"]
            ][:10]  # Limit to first 10 valid images

        # Return images or fallback if empty
        if not image_urls:
            return JSONResponse({"images": ["https://via.placeholder.com/150"] * 10})
        return JSONResponse({"images": image_urls})

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail="Error fetching images from Last.fm")

@app.get('/api/recently_played_db')
async def recently_played_db():
    try:
        songs = list(songs_collection.find({}, {"_id": 0}).sort("played_at", -1).limit(30))
        return {"recent_tracks": songs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")
