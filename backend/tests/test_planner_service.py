"""Tests for planner route."""

from unittest.mock import MagicMock

import pytest

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
def mock_service():
    mock = MagicMock()
    mock.get_recommendations.return_value = SAMPLE_RESPONSE

    original = planner_module.PlannerRecommendationService
    planner_module.PlannerRecommendationService = lambda *args, **kwargs: mock
    yield mock
    planner_module.PlannerRecommendationService = original


def test_planner_returns_200(auth_client, mock_service):
    response = auth_client.post(ROUTE, json=VALID_REQUEST)
    assert response.status_code == 200


def test_planner_response_shape(auth_client, mock_service):
    response = auth_client.post(ROUTE, json=VALID_REQUEST)
    data = response.json()
    assert data["title"] == "Saturday Plan in San Francisco"
    assert data["city"] == "San Francisco"
    assert len(data["activities"]) == 1
    assert data["activities"][0]["activityType"] == "Food"


def test_planner_calls_service_once(auth_client, mock_service):
    auth_client.post(ROUTE, json=VALID_REQUEST)
    mock_service.get_recommendations.assert_called_once()


def test_planner_invalid_body_returns_422(auth_client, mock_service):
    response = auth_client.post(ROUTE, json={})
    assert response.status_code == 422


def test_planner_service_error_returns_500(auth_client, mock_service):
    mock_service.get_recommendations.side_effect = Exception("Planner failure")
    response = auth_client.post(ROUTE, json=VALID_REQUEST)
    assert response.status_code == 500
    assert "Planner failure" in response.json()["detail"]
