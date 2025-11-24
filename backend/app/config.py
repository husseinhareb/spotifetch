from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from pathlib import Path

class Settings(BaseSettings):
    MONGO_URI: str
    MONGO_DB_NAME: str
    SPOTIPY_CLIENT_ID: str
    SPOTIPY_CLIENT_SECRET: str
    SPOTIPY_REDIRECT_URI: str
    LASTFM_KEY: str
    SESSION_SECRET: str = Field(..., description="Required secret key for session encryption. Must be set in .env")
    CORS_ORIGINS: str = Field(default="http://localhost:3000", description="Comma-separated list of allowed CORS origins")
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, description="API rate limit per minute per IP")

    model_config = SettingsConfigDict(env_file=Path(__file__).parent.parent / ".env")

settings = Settings()
