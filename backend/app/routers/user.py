from fastapi import APIRouter, HTTPException
from ..schemas import UserProfileSchema

router = APIRouter()

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
