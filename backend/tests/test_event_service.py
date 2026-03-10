"""Tests for the EventRecommendationService base class."""

import json
from unittest.mock import patch
from datetime import date

import pytest

from app.schemas.events import EventRequest, Event
from app.services.recommendation_service import EventRecommendationService


SAMPLE_EVENT = {
    "name": "Jazz Night at Blue Note",
    "description": "Live jazz performance featuring local artists.",
    "location": "Blue Note, 131 W 3rd St, New York, NY 10012",
    "category": "entertainment",
    "estimated_cost": 25.0,
    "duration_minutes": 120,
    "indoor": True,
    "tags": ["live-music", "jazz"],
    "source": "Eventbrite",
    "event_url": "https://eventbrite.com/e/jazz-night-123",
    "start_time": "2026-04-15T20:00:00",
    "start_time_as_ampm": "8:00 PM",
    "end_time": "2026-04-15T22:00:00",
    "end_time_as_ampm": "10:00 PM",
    "verified": True,
}


class ConcreteService(EventRecommendationService):
    """Concrete subclass for testing the abstract base class."""

    def get_recommendations(self, request: EventRequest) -> list[Event]:
        return []


@pytest.fixture
def service():
    with patch.object(EventRecommendationService, "__init__", lambda self: None):
        svc = ConcreteService()
        svc._system_prompt = "test prompt"
        svc._validation_prompt = "validation prompt"
        return svc


class TestBuildUserMessage:
    """Tests for _build_user_message."""

    def test_required_fields_only(self, service):
        request = EventRequest(city="Boston", interests="live music")
        msg = service._build_user_message(request)
        assert "Boston" in msg
        assert "live music" in msg
        assert f"Today's date is {date.today().isoformat()}" in msg
        assert "budget" not in msg.lower()

    def test_all_optional_fields(self, service):
        request = EventRequest(
            city="NYC",
            interests="food",
            budget=50.0,
            date_range="2026-03-15 to 2026-03-20",
        )
        msg = service._build_user_message(request)
        assert "$50.0" in msg
        assert "2026-03-15 to 2026-03-20" in msg

    def test_time_prefs_not_in_prompt(self, service):
        """Time prefs are handled by _filter_by_time, not sent to the LLM."""
        request = EventRequest(city="NYC", interests="music", day_start_time="9AM", day_end_time="9PM")
        msg = service._build_user_message(request)
        assert "9AM" not in msg
        assert "9PM" not in msg


class TestParseEvents:
    """Tests for _parse_events."""

    def test_parse_valid_json_array(self, service):
        content = json.dumps([SAMPLE_EVENT])
        events = service._parse_events(content)
        assert len(events) == 1
        assert events[0].name == "Jazz Night at Blue Note"
        assert isinstance(events[0], Event)

    def test_parse_multiple_events(self, service):
        second = {**SAMPLE_EVENT, "name": "Art Walk"}
        content = json.dumps([SAMPLE_EVENT, second])
        events = service._parse_events(content)
        assert len(events) == 2

    def test_strips_markdown_fences(self, service):
        content = f"```json\n{json.dumps([SAMPLE_EVENT])}\n```"
        events = service._parse_events(content)
        assert len(events) == 1

    def test_invalid_json_raises(self, service):
        with pytest.raises(json.JSONDecodeError):
            service._parse_events("not json at all")

    def test_missing_event_field_raises(self, service):
        incomplete = {k: v for k, v in SAMPLE_EVENT.items() if k != "name"}
        with pytest.raises(Exception):
            service._parse_events(json.dumps([incomplete]))


class TestSort:
    """Tests for _sort."""

    def test_sorts_by_start_time(self, service):
        late = Event(**{**SAMPLE_EVENT, "name": "Late", "start_time": "2026-04-15T22:00:00"})
        early = Event(**{**SAMPLE_EVENT, "name": "Early", "start_time": "2026-04-15T10:00:00"})
        mid = Event(**{**SAMPLE_EVENT, "name": "Mid", "start_time": "2026-04-15T15:00:00"})
        result = service._sort([late, early, mid])
        assert [e.name for e in result] == ["Early", "Mid", "Late"]


class TestParseTime:
    """Tests for _parse_time."""

    def test_24h_format(self, service):
        t = service._parse_time("14:00")
        assert t is not None
        assert t.hour == 14 and t.minute == 0

    def test_12h_am(self, service):
        t = service._parse_time("9AM")
        assert t is not None
        assert t.hour == 9

    def test_12h_pm_with_minutes(self, service):
        t = service._parse_time("9:30pm")
        assert t is not None
        assert t.hour == 21 and t.minute == 30

    def test_unparseable_returns_none(self, service):
        assert service._parse_time("evening") is None


class TestFilterByTime:
    """Tests for _filter_by_time."""

    def _make_event(self, start, end, duration=120, name="Test Event"):
        return Event(**{**SAMPLE_EVENT, "name": name, "start_time": start, "end_time": end, "duration_minutes": duration})

    def test_no_time_prefs_returns_all(self, service):
        events = [self._make_event("2026-04-15T10:00:00", "2026-04-15T12:00:00")]
        request = EventRequest(city="NYC", interests="music")
        result = service._filter_by_time(events, request)
        assert len(result) == 1

    def test_removes_event_starting_after_end_bound(self, service):
        events = [self._make_event("2026-04-15T23:00:00", "2026-04-16T01:00:00")]
        request = EventRequest(city="NYC", interests="music", day_end_time="21:00")
        result = service._filter_by_time(events, request)
        assert len(result) == 0

    def test_removes_event_ending_before_start_bound(self, service):
        events = [self._make_event("2026-04-15T07:00:00", "2026-04-15T08:00:00")]
        request = EventRequest(city="NYC", interests="music", day_start_time="9AM")
        result = service._filter_by_time(events, request)
        assert len(result) == 0

    def test_clips_start_time_forward(self, service):
        events = [self._make_event("2026-04-15T07:00:00", "2026-04-15T12:00:00", duration=300)]
        request = EventRequest(city="NYC", interests="music", day_start_time="09:00")
        result = service._filter_by_time(events, request)
        assert len(result) == 1
        assert result[0].start_time == "2026-04-15T09:00:00"
        assert result[0].duration_minutes == 180

    def test_clips_end_time_back(self, service):
        events = [self._make_event("2026-04-15T18:00:00", "2026-04-15T23:00:00", duration=300)]
        request = EventRequest(city="NYC", interests="music", day_end_time="21:00")
        result = service._filter_by_time(events, request)
        assert len(result) == 1
        assert result[0].end_time == "2026-04-15T21:00:00"
        assert result[0].duration_minutes == 180
