from typing import Literal

from fastapi import APIRouter, Depends,HTTPException, Query
from sqlalchemy.orm import Session 
from app.db.database import get_db 
from app.middleware.auth import get_optional_current_user
from app.models.user import User

from app.schemas.events import EventRequest, Event
from app.services.openai_recommendation import OpenAIRecommendationService
from app.services.claude_recommendation import ClaudeRecommendationService

router = APIRouter()

openai_service = OpenAIRecommendationService()
claude_service = ClaudeRecommendationService()


@router.post("/events/recommendations", response_model=list[Event])
def recommend_events(
    request: EventRequest,
    provider: Literal["openai", "claude"] = Query("claude", description="Choose the recommendation provider"),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
): 
    """Generate event recommendations using OpenAI or Claude."""
    if current_user and not request.ignore_previous_preference:
        if not request.interests:
            request.interests = current_user.interests or ""
        if not request.preference:
            request.preference = current_user.environment_preference or ""
    service = openai_service if provider == "openai" else claude_service
    try:
        return service.get_recommendations(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
