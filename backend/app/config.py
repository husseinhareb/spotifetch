from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    MONGO_URI: str
    MONGO_DB_NAME: str
    SPOTIPY_CLIENT_ID: str
    SPOTIPY_CLIENT_SECRET: str
    SPOTIPY_REDIRECT_URI: str
    LASTFM_KEY: str
    SESSION_SECRET: str = "change-me-in-production-use-a-strong-secret"

    model_config = SettingsConfigDict(env_file=Path(__file__).parent.parent / ".env")

settings = Settings()
