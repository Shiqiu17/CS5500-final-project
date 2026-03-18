"""Schemas for planner endpoint."""
from pydantic import BaseModel
from .events import  EventResponse

class PlannerRequest(BaseModel):
    """Request schema for planner endpoint."""
    location: str
    date: str
    timeRange: str
    budget: float | None = None
    preference: str | None = None
    interests: list[str]


class PlannerResponse(BaseModel):
    """Response schema for planner endpoint."""
    title: str
    date: str
    city: str
    summary: str
    activities: list[EventResponse]
