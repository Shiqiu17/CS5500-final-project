from anthropic import Anthropic

from ..core.config import settings
from ..schemas.events import EventRequest, Event
from .recommendation_service import EventRecommendationService


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
            tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 10}],
            messages=[
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
        )
        text = ""
        for block in response.content:
            if block.type == "text":
                text = block.text
        return self._parse_events(text)
