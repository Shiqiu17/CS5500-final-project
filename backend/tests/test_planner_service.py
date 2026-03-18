"""Tests for planner route."""

from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.routers import planner as planner_module


ROUTE = "/planner"

VALID_REQUEST = {
    "location": "San Francisco",
    "date": "2026-03-14",
    "timeRange": "10:00 AM - 8:00 PM",
    "budget": 80,
    "preference": "Outdoor",
    "interests": ["food", "art", "nature"],
}

SAMPLE_RESPONSE = {
    "title": "Saturday Plan in San Francisco",
    "date": "2026-03-14",
    "city": "San Francisco",
    "summary": "A day plan based on outdoor preferences, moderate budget, and food interests.",
    "activities": [
        {
            "id": "1",
            "time": "10:00 AM",
            "location": "Blue Bottle Coffee, Hayes Valley",
            "activity": "Coffee and breakfast",
            "activityType": "Food",
            "price": 18,
            "info": "Popular cafe with light breakfast options.",
            "website": "https://example.com/blue-bottle",
        }
    ],
}


@pytest.fixture
def client():
    mock_service = MagicMock()
    mock_service.get_recommendations.return_value = SAMPLE_RESPONSE

    original = planner_module.PlannerRecommendationService
    planner_module.PlannerRecommendationService = lambda *args, **kwargs: mock_service
    try:
        yield TestClient(app), mock_service
    finally:
        planner_module.PlannerRecommendationService = original


def test_planner_returns_200(client):
    tc, _ = client
    response = tc.post(ROUTE, json=VALID_REQUEST)
    assert response.status_code == 200


def test_planner_response_shape(client):
    tc, _ = client
    response = tc.post(ROUTE, json=VALID_REQUEST)
    data = response.json()
    assert data["title"] == "Saturday Plan in San Francisco"
    assert data["city"] == "San Francisco"
    assert len(data["activities"]) == 1
    assert data["activities"][0]["activityType"] == "Food"


def test_planner_calls_service_once(client):
    tc, mock_service = client
    tc.post(ROUTE, json=VALID_REQUEST)
    mock_service.get_recommendations.assert_called_once()


def test_planner_invalid_body_returns_422(client):
    tc, _ = client
    response = tc.post(ROUTE, json={})
    assert response.status_code == 422


def test_planner_service_error_returns_500(client):
    tc, mock_service = client
    mock_service.get_recommendations.side_effect = Exception("Planner failure")
    response = tc.post(ROUTE, json=VALID_REQUEST)
    assert response.status_code == 500
    assert "Planner failure" in response.json()["detail"]
