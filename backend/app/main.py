from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime,timedelta
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
import asyncio
import requests
import re

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Middleware for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for session management
app.add_middleware(SessionMiddleware, secret_key=os.urandom(24))

# MongoDB setup
mongo_uri = os.getenv("MONGO_URI")
mongo_db_name = os.getenv("MONGO_DB_NAME")
client = MongoClient(mongo_uri)
db = client[mongo_db_name]
songs_collection = db["songs"]

# Spotify API credentials
client_id = os.getenv("SPOTIPY_CLIENT_ID")
client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
redirect_uri = os.getenv("SPOTIPY_REDIRECT_URI")

#LASTFM API cerdentials
last_fm_api_key = os.getenv("LASTFM_KEY")

# Spotify OAuth setup
sp_oauth = SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope="user-read-private user-top-read user-read-playback-state user-read-currently-playing user-read-email user-read-recently-played",
)

async def fetch_currently_playing():
    while True:
        try:
            token_info = sp_oauth.get_cached_token()
            if not token_info:
                print("No token found. User authentication is required.")
                await asyncio.sleep(30)
                continue

            if sp_oauth.is_token_expired(token_info):
                token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])

            sp = spotipy.Spotify(auth=token_info["access_token"])
            recent_tracks_data = sp.current_user_recently_played(limit=1)

            if recent_tracks_data["items"]:
                recent_track = recent_tracks_data["items"][0]
                track_info = {
                    "track_id": recent_track["track"]["id"],
                    "track_name": recent_track["track"]["name"],
                    "artist_name": ", ".join([artist["name"] for artist in recent_track["track"]["artists"]]),
                    "album_name": recent_track["track"]["album"]["name"],
                    "album_image": recent_track["track"]["album"]["images"][0]["url"] if recent_track["track"]["album"]["images"] else None,
                    "duration_ms": recent_track["track"]["duration_ms"],
                    "played_at": recent_track["played_at"],  # Timestamp from Spotify API
                    "popularity": recent_track["track"].get("popularity", 0),
                    "explicit": recent_track["track"]["explicit"],
                    "track_url": recent_track["track"]["external_urls"]["spotify"],
                }

                if songs_collection.find_one({"track_id": track_info["track_id"], "played_at": track_info["played_at"]}):
                    print(f"Duplicate song: {track_info['track_name']} at {track_info['played_at']} - Skipping insertion.")
                else:
                    songs_collection.insert_one(track_info)
                    print(f"Saved song: {track_info['track_name']} at {track_info['played_at']}")
            else:
                print("No recently played tracks found.")
        except Exception as e:
            print(f"Error fetching currently played song: {str(e)}")

        await asyncio.sleep(30)

@app.on_event("startup")
async def startup_event():
    # Start the background task to fetch currently playing song every 30 seconds
    asyncio.create_task(fetch_currently_playing())

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
async def recently_played_db(skip: int = 0, limit: int = 30):
    try:
        # Step 1: If skip = 0, we attempt to fetch new data from Spotify first.
        if skip == 0:
            token_info = sp_oauth.get_cached_token()
            if not token_info:
                raise HTTPException(status_code=401, detail="Token not found or expired")

            sp = spotipy.Spotify(auth=token_info["access_token"])
            recent_tracks_data = sp.current_user_recently_played(limit=50)

            # Find the latest saved track in the database
            latest_saved = songs_collection.find_one(sort=[("played_at", -1)])
            latest_saved_time = latest_saved["played_at"] if latest_saved else None

            for item in recent_tracks_data['items']:
                track = item['track']
                played_at = item['played_at']

                # Only insert if more recent than the latest saved track
                if not latest_saved_time or played_at > latest_saved_time:
                    track_info = {
                        "track_id": track["id"],
                        "track_name": track["name"],
                        "artist_name": ", ".join([artist["name"] for artist in track["artists"]]),
                        "album_name": track["album"]["name"],
                        "album_image": track["album"]["images"][0]["url"] if track["album"]["images"] else None,
                        "played_at": played_at,
                    }
                    songs_collection.insert_one(track_info)

        # Step 2: Query songs from the DB using skip & limit, sorted by played_at descending
        recent_tracks = list(
            songs_collection.find({}, {"_id": 0})
            .sort("played_at", -1)
            .skip(skip)
            .limit(limit)
        )

        return {"recent_tracks": recent_tracks}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

@app.get("/currently_playing")
async def currently_playing(request: Request):
    token_info = get_token(request)
    if not token_info:
        raise HTTPException(status_code=401, detail="Token not found or expired")
    sp = spotipy.Spotify(auth=token_info["access_token"])
    current_track = sp.current_playback()
    if current_track and current_track["is_playing"]:
        track_info = {
            "track_id": current_track["item"]["id"],
            "track_name": current_track["item"]["name"],
            "artist_name": ", ".join(
                [artist["name"] for artist in current_track["item"]["artists"]]
            ),
            "album_name": current_track["item"]["album"]["name"],
            "album_image": current_track["item"]["album"]["images"][0]["url"]
            if current_track["item"]["album"]["images"]
            else None,
            "is_playing": current_track["is_playing"],
            "progress_ms": current_track["progress_ms"],
            "duration_ms": current_track["item"]["duration_ms"],
            "played_at": datetime.now().isoformat(),  # Convert datetime to string
        }

        user_info = sp.current_user()
        track_info["user_id"] = user_info["id"]
        existing_song = songs_collection.find_one(
            {"track_id": track_info["track_id"], "user_id": user_info["id"]}
        )
        if not existing_song:
            songs_collection.insert_one(track_info)
        return JSONResponse(track_info)
    else:
        return JSONResponse({"message": "No track currently playing"})

