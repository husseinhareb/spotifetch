import os
import json
import time
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

SPOTIPY_CLIENT_ID = os.getenv('SPOTIPY_CLIENT_ID')
SPOTIPY_CLIENT_SECRET = os.getenv('SPOTIPY_CLIENT_SECRET')
SPOTIPY_REDIRECT_URI = os.getenv('SPOTIPY_REDIRECT_URI')
TOKEN_FILE = 'token.json'
SCOPE = 'user-read-private user-read-email'

def get_spotify_client():
    # Check if the token file exists
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'r') as file:
            token_info = json.load(file)
        
        # Check if the token has expired
        if 'expires_at' in token_info and token_info['expires_at'] < int(time.time()):
            sp_oauth = SpotifyOAuth(
                client_id=SPOTIPY_CLIENT_ID,
                client_secret=SPOTIPY_CLIENT_SECRET,
                redirect_uri=SPOTIPY_REDIRECT_URI,
                scope=SCOPE
            )
            token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
            with open(TOKEN_FILE, 'w') as file:
                json.dump(token_info, file)

    else:
        sp_oauth = SpotifyOAuth(
            client_id=SPOTIPY_CLIENT_ID,
            client_secret=SPOTIPY_CLIENT_SECRET,
            redirect_uri=SPOTIPY_REDIRECT_URI,
            scope=SCOPE
        )
        token_info = sp_oauth.get_access_token(as_dict=False)
        with open(TOKEN_FILE, 'w') as file:
            json.dump(token_info, file)

    # Create Spotify client with the access token
    sp = spotipy.Spotify(auth=token_info['access_token'])
    return sp

def main():
    sp = get_spotify_client()
    user_info = sp.current_user()

    print("User Information:")
    print(f"Display Name: {user_info['display_name']}")
    print(f"User ID: {user_info['id']}")
    print(f"Email: {user_info['email']}")
    print(f"Country: {user_info['country']}")
    print(f"Product: {user_info['product']}")

if __name__ == "__main__":
    main()
