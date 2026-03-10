from pydantic import BaseModel, Field


class EventRequest(BaseModel):
    city: str = Field(..., description="City to search events in")
    interests: str = Field(..., description="User interests or event type")
    budget: float | None = Field(None, description="Max budget in USD per person")
    date_range: str | None = Field(None, description="Preferred date range, e.g. '2026-03-15 to 2026-03-20'")

class Event(BaseModel):
    name: str
    description: str
    location: str
    category: str
    estimated_cost: float
    duration_minutes: int
    indoor: bool
    tags: list[str]
    source: str
    event_url: str
    start_time: str
    end_time: str
    verified: bool
