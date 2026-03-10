"""Tests for WTD-33: Initialize FastAPI app with CORS middleware."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_options_preflight_returns_200():
    """Test that the OPTIONS preflight request returns a 200 status code."""
    response = client.options(
        "/",
        headers={
            "Origin": "http://localhost:8080",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
