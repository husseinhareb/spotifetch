from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class UserProfileSchema(BaseModel):
    display_name: str
    followers: int
    profile_url: Optional[str] = None

@router.get("/profile", response_model=UserProfileSchema)
async def get_profile():
    return {
        "display_name": "John Doe",
        "followers": 123,
        "profile_url": "https://spotify.com/user/johndoe"
    }

@router.get("/recommend")
async def get_recommendations():

    return ["song1", "song2", "song3"]
