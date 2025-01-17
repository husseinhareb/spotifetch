# app/main.py

import os
import asyncio
from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .services.spotify_services import fetch_currently_playing
from .routers import auth, tracks, artists

def create_app() -> FastAPI:
    app = FastAPI()

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],  # Update with your frontend domain(s)
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Session middleware
    app.add_middleware(SessionMiddleware, secret_key=os.urandom(24))

    # Include routers
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(tracks.router, prefix="/tracks", tags=["tracks"])
    app.include_router(artists.router, prefix="/artists", tags=["artists"])

    @app.on_event("startup")
    async def startup_event():
        # Start background task
        asyncio.create_task(fetch_currently_playing())

    @app.get("/")
    async def index():
        return {"message": "Welcome to Spotifetch"}

    return app

app = create_app()
