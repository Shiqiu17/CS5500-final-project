"""Tests for the Claude recommendation service."""

import json
from unittest.mock import patch, MagicMock

import pytest

from app.schemas.events import EventRequest
from app.services.claude_recommendation import ClaudeRecommendationService


SAMPLE_EVENT = {
    "name": "Art Walk",
    "description": "Gallery tour downtown.",
    "location": "Art District, LA",
    "category": "arts",
    "estimated_cost": 0,
    "duration_minutes": 90,
    "indoor": False,
    "tags": ["free", "art"],
    "source": "Meetup",
    "event_url": "https://meetup.com/art-walk-456",
    "start_time": "2026-05-01T14:00:00",
    "start_time_as_ampm": "2:00 PM",
    "end_time": "2026-05-01T15:30:00",
    "end_time_as_ampm": "3:30 PM",
    "verified": True,
}


def _mock_response(events_json: str) -> MagicMock:
    """Build a mock Anthropic response with web search + text content blocks."""
    search_block = MagicMock()
    search_block.type = "web_search_tool_result"

    text_block = MagicMock()
    text_block.type = "text"
    text_block.text = events_json

    response = MagicMock()
    response.content = [search_block, text_block]
    return response


@pytest.fixture
def mock_anthropic_client():
    with patch(
        "app.services.claude_recommendation.Anthropic"
    ) as mock_cls, patch(
        "app.services.recommendation_service.Anthropic"
    ) as mock_val_cls, patch(
        "app.services.recommendation_service.PROMPT_PATH"
    ) as mock_path, patch(
        "app.services.recommendation_service.VALIDATION_PROMPT_PATH"
    ) as mock_val_path:
        mock_path.read_text.return_value = "system prompt"
        mock_val_path.read_text.return_value = "validation prompt"
        mock_client = MagicMock()
        mock_cls.return_value = mock_client
        mock_val_client = MagicMock()
        mock_val_cls.return_value = mock_val_client
        mock_val_text = MagicMock()
        mock_val_text.text = json.dumps([SAMPLE_EVENT])
        mock_val_response = MagicMock()
        mock_val_response.content = [mock_val_text]
        mock_val_client.messages.create.return_value = mock_val_response
        yield mock_client


class TestClaudeRecommendationService:
    """Tests for ClaudeRecommendationService."""

    def test_returns_parsed_events(self, mock_anthropic_client):
        mock_anthropic_client.messages.create.return_value = _mock_response(
            json.dumps([SAMPLE_EVENT])
        )
        service = ClaudeRecommendationService()
        events = service.get_recommendations(EventRequest(city="LA", interests="art"))
        assert len(events) == 1
        assert events[0].name == "Art Walk"

    def test_calls_anthropic_with_correct_model(self, mock_anthropic_client):
        mock_anthropic_client.messages.create.return_value = _mock_response(
            json.dumps([SAMPLE_EVENT])
        )
        service = ClaudeRecommendationService()
        service.get_recommendations(EventRequest(city="LA", interests="art"))
        call_kwargs = mock_anthropic_client.messages.create.call_args
        assert call_kwargs.kwargs["model"] == "claude-sonnet-4-20250514"

    def test_enables_web_search(self, mock_anthropic_client):
        mock_anthropic_client.messages.create.return_value = _mock_response(
            json.dumps([SAMPLE_EVENT])
        )
        service = ClaudeRecommendationService()
        service.get_recommendations(EventRequest(city="LA", interests="art"))
        call_kwargs = mock_anthropic_client.messages.create.call_args
        tools = call_kwargs.kwargs["tools"]
        assert any(t["type"] == "web_search_20250305" for t in tools)

    def test_api_error_propagates(self, mock_anthropic_client):
        mock_anthropic_client.messages.create.side_effect = Exception("rate limited")
        service = ClaudeRecommendationService()
        with pytest.raises(Exception, match="rate limited"):
            service.get_recommendations(EventRequest(city="LA", interests="art"))
