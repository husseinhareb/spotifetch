from pydantic import BaseModel

class UserProfileSchema(BaseModel):
    display_name: str
    followers: int
    profile_url: str
