from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Return the current logged-in user's profile including saved preferences."""
    return current_user
