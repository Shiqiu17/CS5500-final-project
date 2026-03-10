import json
from pathlib import Path
from datetime import date
from abc import ABC, abstractmethod

from ..core.config import settings, BACKEND_DIR
from ..schemas.events import EventRequest, Event

PROMPT_PATH = BACKEND_DIR / "prompts" / "prompt.txt"


class EventRecommendationService(ABC):

    def __init__(self):
        self._system_prompt = PROMPT_PATH.read_text(encoding="utf-8")

    def _build_user_message(self, request: EventRequest) -> str:
        parts = [
            f"Find real upcoming events in {request.city} related to: {request.interests}.",
            f"Today's date is {date.today().isoformat()}.",
        ]
        if request.budget is not None:
            parts.append(f"My budget is ${request.budget} per person.")
        if request.date_range:
            parts.append(f"Preferred dates: {request.date_range}.")
        return " ".join(parts)
    def _parse_events(self, content: str) -> list[Event]:
        return NotImplementedError("Subclasses must implement _parse_events")
    @abstractmethod
    def get_recommendations(self, request: EventRequest) -> list[Event]:
        pass
