from openai import OpenAI

from app.core.config import settings
from app.schemas.events import EventRequest, Event
from .recommendation_service import EventRecommendationService


class OpenAIRecommendationService(EventRecommendationService):

    def __init__(self):
        super().__init__()
        self._client = OpenAI(api_key=settings.openai_api_key)

    def get_recommendations(self, request: EventRequest) -> list[Event]:
        user_message = self._build_user_message(request)

        response = self._client.responses.create(
            model="gpt-4o",
            tools=[{"type": "web_search_preview"}],
            instructions=self._system_prompt,
            input=user_message,
            temperature=0.2,
        )
        text = ""
        for item in response.output:
            if item.type == "message":
                for block in item.content:
                    if block.type == "output_text":
                        text = block.text                      
        events = self._parse_events(text)
        # events = self._validate_events(events, request)
        events = self._filter_by_time(events, request)
        return self._sort(events)
