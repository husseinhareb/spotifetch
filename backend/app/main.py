import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from flask import Flask, request, redirect, session, url_for, jsonify

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Used to secure session
app.config['SESSION_COOKIE_NAME'] = 'spotify-login-session'

# Spotify API credentials from environment variables
client_id = os.getenv('SPOTIPY_CLIENT_ID')
client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
redirect_uri = os.getenv('SPOTIPY_REDIRECT_URI')

# Spotify OAuth object
sp_oauth = SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope='user-read-private')

@app.route('/')
def index():
    # Redirect user to Spotify login page
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/callback')
def callback():
    # Get the authorization code from the callback URL
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)

    # Save the token info in the session
    session['token_info'] = token_info
    return redirect(url_for('welcome'))

def get_token():
    token_info = session.get('token_info', None)
    if not token_info:
        return None

    # Check if token is expired and refresh if needed
    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        session['token_info'] = token_info

    return token_info

@app.route('/welcome')
def welcome():
    # Get token info from session
    token_info = get_token()
    if not token_info:
        return redirect('/')

    # Create Spotify client using the user's access token
    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Get current user's information
    user_info = sp.current_user()
    username = user_info['display_name']

    return f'Welcome, {username}!'

@app.route('/user_info')
def user_info():
    # Get token info from session
    token_info = get_token()
    if not token_info:
        return redirect('/')

    # Create Spotify client using the user's access token
    sp = spotipy.Spotify(auth=token_info['access_token'])

    # Get current user's information
    user_info = sp.current_user()
    return jsonify(user_info)

if __name__ == '__main__':
    app.run(port=5173, debug=True)
