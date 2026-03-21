"""Tests for planner router with DB persistence."""

from unittest.mock import MagicMock

import pytest

from app.models.planner import Planner
from app.models.saved_event import SavedEvent
from app.routers import planner as planner_module
from app.schemas.planner import PlannerResponse
from app.schemas.events import EventResponse

ROUTE = "/planner"

VALID_REQUEST = {
    "location": "San Francisco",
    "date": "2026-03-14",
    "timeRange": "10:00 AM - 8:00 PM",
    "budget": 80,
    "preference": "Outdoor",
    "interests": ["food", "art", "nature"],
}

SAMPLE_RESPONSE = PlannerResponse(
    title="Saturday Plan in San Francisco",
    date="2026-03-14",
    city="San Francisco",
    summary="A day plan based on outdoor preferences.",
    activities=[
        EventResponse(
            id="1", time="10:00 AM",
            location="Blue Bottle Coffee, Hayes Valley",
            activity="Coffee and breakfast",
            activityType="Food", price=18,
            info="Popular cafe.", website="https://example.com",
        ),
        EventResponse(
            id="2", time="2:00 PM",
            location="SFMOMA",
            activity="Museum visit",
            activityType="Art", price=25,
            info="Modern art museum.", website="https://example.com",
        ),
    ],
)


@pytest.fixture
def mock_planner_service():
    mock_service = MagicMock()
    mock_service.get_recommendations.return_value = SAMPLE_RESPONSE

    original = planner_module.PlannerRecommendationService
    planner_module.PlannerRecommendationService = lambda *args, **kwargs: mock_service
    yield mock_service
    planner_module.PlannerRecommendationService = original


class TestPlannerEndpoint:

    def test_requires_auth(self, client, mock_planner_service):
        resp = client.post(ROUTE, json=VALID_REQUEST)
        assert resp.status_code in (401, 403)

    def test_returns_200(self, auth_client, mock_planner_service):
        resp = auth_client.post(ROUTE, json=VALID_REQUEST)
        assert resp.status_code == 200

    def test_response_shape(self, auth_client, mock_planner_service):
        resp = auth_client.post(ROUTE, json=VALID_REQUEST)
        data = resp.json()
        assert data["title"] == "Saturday Plan in San Francisco"
        assert data["city"] == "San Francisco"
        assert len(data["activities"]) == 2

    def test_saves_planner_to_db(self, auth_client, mock_planner_service, db, test_user):
        auth_client.post(ROUTE, json=VALID_REQUEST)
        planners = db.query(Planner).filter(Planner.user_id == test_user.id).all()
        assert len(planners) == 1
        assert planners[0].title == "Saturday Plan in San Francisco"
        assert planners[0].city == "San Francisco"

    def test_saves_activities_to_db(self, auth_client, mock_planner_service, db, test_user):
        auth_client.post(ROUTE, json=VALID_REQUEST)
        planner = db.query(Planner).first()
        events = db.query(SavedEvent).filter(SavedEvent.planner_id == planner.id).all()
        assert len(events) == 2
        titles = {e.title for e in events}
        assert "Coffee and breakfast" in titles
        assert "Museum visit" in titles

    def test_activities_linked_to_user(self, auth_client, mock_planner_service, db, test_user):
        auth_client.post(ROUTE, json=VALID_REQUEST)
        events = db.query(SavedEvent).filter(SavedEvent.user_id == test_user.id).all()
        assert len(events) == 2

    def test_invalid_body_returns_422(self, auth_client, mock_planner_service):
        resp = auth_client.post(ROUTE, json={})
        assert resp.status_code == 422

    def test_service_error_returns_500(self, auth_client, mock_planner_service):
        mock_planner_service.get_recommendations.side_effect = Exception("API failure")
        resp = auth_client.post(ROUTE, json=VALID_REQUEST)
        assert resp.status_code == 500
        assert "API failure" in resp.json()["detail"]