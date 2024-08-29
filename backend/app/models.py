from pydantic import BaseModel

class UserProfile(BaseModel):
    display_name: str
    followers: int
    profile_url: str
