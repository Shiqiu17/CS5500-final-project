import logging

from openai import OpenAI

from app.core.config import settings
from app.schemas.events import EventRequest, Event
from .recommendation_service import EventRecommendationService

logger = logging.getLogger(__name__)


class OpenAIRecommendationService(EventRecommendationService):

    def __init__(self):
        super().__init__()
        self._client = OpenAI(api_key=settings.openai_api_key)
        logger.info("OpenAIRecommendationService initialized")

    def get_recommendations(self, request: EventRequest) -> list[Event]:
        logger.info(
            "OpenAI get_recommendations called city=%s interests=%s budget=%s date_range=%s start=%s end=%s",
            request.city,
            request.interests,
            request.budget,
            request.date_range,
            request.day_start_time,
            request.day_end_time,
        )

        user_message = self._build_user_message(request)

        logger.info("Calling OpenAI responses.create")
        response = self._client.responses.create(
            model="gpt-4o",
            tools=[{"type": "web_search_preview"}],
            instructions=self._system_prompt,
            input=user_message,
            temperature=0.2,
        )
        logger.info("OpenAI responses.create returned")

        text = ""
        for item in response.output:
            if item.type == "message":
                for block in item.content:
                    if block.type == "output_text":
                        text = block.text

        logger.info("OpenAI output text preview=%s", text[:1000] if text else "")

        events = self._parse_events(text)
        logger.info("OpenAI parsed events count=%s", len(events))

        # events = self._validate_events(events, request)
        events = self._filter_by_time(events, request)
        logger.info("OpenAI filtered events count=%s", len(events))

        result = self._sort(events)
        logger.info("OpenAI final sorted events count=%s", len(result))
        return result