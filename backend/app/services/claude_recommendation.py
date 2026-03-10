from anthropic import Anthropic

from app.core.config import settings
from app.schemas.events import EventRequest, Event
from .recommendation_service import EventRecommendationService, EVENTS_TOOL


class ClaudeRecommendationService(EventRecommendationService):

    def __init__(self):
        super().__init__()
        self._client = Anthropic(api_key=settings.claude_api_key)

    def get_recommendations(self, request: EventRequest) -> list[Event]:
        user_message = self._build_user_message(request)

        response = self._client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=16000,
            system=self._system_prompt,
            tools=[
                {"type": "web_search_20250305", "name": "web_search", "max_uses": 10},
                EVENTS_TOOL,
            ],
            tool_choice={"type": "auto"},
            messages=[
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
        )
        events = self._extract_tool_events(response)
        if not events:
            # Fallback: parse text if model didn't use the tool
            text = ""
            for block in response.content:
                if block.type == "text":
                    text = block.text
            events = self._parse_events(text)
        events = self._validate_events(events, request)
        events = self._filter_by_time(events, request)
        return self._sort(events)

    @staticmethod
    def _extract_tool_events(response) -> list[Event]:
        """Extract events from a tool_use response block."""
        for block in response.content:
            if block.type == "tool_use" and block.name == "submit_events":
                return [Event(**e) for e in block.input["events"]]
        return []
