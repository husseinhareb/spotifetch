# app/main.py

import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .config import settings
from .db.database import init_db, close_db, verify_connection
from .services.spotify_services import fetch_currently_playing
from .crud.artist import close_http_client
from .routers import artist, auth, track, history

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events.
    """
    # Startup
    logger.info("Starting Spotifetch API...")
    
    # Initialize database
    init_db()
    if not verify_connection():
        logger.error("Failed to connect to MongoDB!")
        raise RuntimeError("Database connection failed")
    
    # Start background task for tracking currently playing
    background_task = asyncio.create_task(fetch_currently_playing())
    logger.info("Background task started")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Spotifetch API...")
    
    # Cancel background task
    background_task.cancel()
    try:
        await background_task
    except asyncio.CancelledError:
        logger.info("Background task cancelled")
    
    # Close HTTP client used for external API calls
    await close_http_client()
    
    # Close database connection
    close_db()
    logger.info("Shutdown complete")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Spotifetch API",
        description="Spotify listening history tracker",
        version="1.0.0",
        lifespan=lifespan
    )

    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # CORS middleware - use configured origins
    allowed_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Session middleware
    app.add_middleware(SessionMiddleware, secret_key=settings.SESSION_SECRET)

    # Include routers
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(track.router, prefix="/tracks", tags=["tracks"])
    app.include_router(artist.router, prefix="/artists", tags=["artists"])
    app.include_router(history.router, tags=["history"])

    @app.get("/")
    async def index():
        return {"message": "Welcome to Spotifetch"}

    @app.get("/health")
    async def health_check():
        """Health check endpoint for monitoring."""
        db_healthy = verify_connection()
        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "database": "connected" if db_healthy else "disconnected"
        }

    return app


app = create_app()
