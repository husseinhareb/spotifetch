from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    user_id: str
    username: str
    email: Optional[EmailStr]
    profile_image: Optional[str]
    country: Optional[str]
    product: Optional[str]

class UserInDB(UserCreate):
    created_at: str

class UserOut(BaseModel):
    user_id: str
    username: str
    email: Optional[EmailStr]
    profile_image: Optional[str]
