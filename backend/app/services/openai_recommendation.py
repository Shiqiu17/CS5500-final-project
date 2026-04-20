from openai import OpenAI

from app.core.config import settings
from app.schemas.events import EventRequest, Event
from .recommendation_service import EventRecommendationService


class OpenAIRecommendationService(EventRecommendationService):

    def __init__(self):
        super().__init__()
        self._client = OpenAI(api_key=settings.openai_api_key)
        print("OpenAIRecommendationService initialized")

    def get_recommendations(self, request: EventRequest) -> list[Event]:
        print(
            "OpenAI get_recommendations called",
            {
                "city": request.city,
                "interests": request.interests,
                "budget": request.budget,
                "date_range": request.date_range,
                "day_start_time": request.day_start_time,
                "day_end_time": request.day_end_time,
            },
        )

        user_message = self._build_user_message(request)

        print("Calling OpenAI responses.create")
        response = self._client.responses.create(
            model="gpt-4o",
            tools=[{"type": "web_search_preview"}],
            instructions=self._system_prompt,
            input=user_message,
            temperature=0.2,
        )
        print("OpenAI responses.create returned")

        text = ""
        for item in response.output:
            if item.type == "message":
                for block in item.content:
                    if block.type == "output_text":
                        text = block.text

        print("OpenAI output text preview=", text[:1000] if text else "")

        events = self._parse_events(text)
        print("OpenAI parsed events count=", len(events))

        # events = self._validate_events(events, request)
        events = self._filter_by_time(events, request)
        print("OpenAI filtered events count=", len(events))

        result = self._sort(events)
        print("OpenAI final sorted events count=", len(result))
        return result