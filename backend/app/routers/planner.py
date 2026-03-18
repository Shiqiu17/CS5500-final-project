"""Router for planner endpoint,
providing event recommendations based on user preferences.
"""
from typing import Literal
from fastapi import APIRouter, HTTPException, Query
from app.schemas.planner import PlannerRequest, PlannerResponse
from app.services.planner_service import PlannerRecommendationService

router = APIRouter()


@router.post("/planner", response_model=PlannerResponse)
def recommend_events(
    request: PlannerRequest,
    provider: Literal["openai", "claude"] = Query(
        "claude", description="Choose the recommendation provider"),
):
    """Generate event recommendations using OpenAI or Claude.
    Request:
        {
        "location": "San Francisco",
        "date": "2026-03-14",
        "timeRange": "10:00 AM - 8:00 PM",
        "budget": 80,
        "preference": "Outdoor",
        "interests": ["food", "art", "nature"]
        }

    Response:
        {
        "title": "Saturday Plan in San Francisco",
        "date": "2026-03-14",
        "city": "San Francisco",
        "summary": "A day plan based on outdoor preferences, moderate budget, and food interests.",
        "activities": [{
        "id": "1",
        "time": "10:00 AM",
        "location": "Blue Bottle Coffee, Hayes Valley",
        "activity": "Coffee and breakfast",
        "activityType": "Food",
        "price": 18,
        "info": "Popular cafe with light breakfast options and short wait times in the morning.",
        "website": "https://example.com/blue-bottle"
        }] 
        }
    """
    service = PlannerRecommendationService(provider)
    try:
        return service.get_recommendations(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
