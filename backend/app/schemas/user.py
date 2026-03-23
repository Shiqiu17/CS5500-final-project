from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


class UserPreferences(BaseModel):
    interests: List[str] = []
    environment: str = "mixed"
    dietary_restrictions: str = ""
    accessibility: str = ""
    other_restrictions: str = ""


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: Optional[str] = None
    preferences: Optional[UserPreferences] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    name: Optional[str]
    created_at: datetime
    preferences: Optional[dict] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
