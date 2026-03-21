"""Tests for saved events router."""


class TestGetSavedEvents:

    def test_requires_auth(self, client):
        resp = client.get("/saved")
        assert resp.status_code in (401, 403)

    def test_returns_empty_list(self, auth_client):
        resp = auth_client.get("/saved")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_returns_saved_events(self, auth_client):
        auth_client.post("/saved", json={
            "title": "Concert", "date": "2026-03-20",
            "time": "8:00 PM", "location": "Venue",
            "tag": "Music", "price": "50",
        })
        resp = auth_client.get("/saved")
        assert resp.status_code == 200
        assert len(resp.json()) == 1
        assert resp.json()[0]["title"] == "Concert"


class TestSaveEvent:

    def test_requires_auth(self, client):
        resp = client.post("/saved", json={
            "title": "X", "date": "2026-03-20", "time": "1 PM",
            "location": "Y", "tag": "Z", "price": "0",
        })
        assert resp.status_code in (401, 403)

    def test_save_event_returns_201(self, auth_client):
        resp = auth_client.post("/saved", json={
            "title": "Art Show", "date": "2026-03-20",
            "time": "2:00 PM", "location": "Gallery",
            "tag": "Art", "price": "15",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Art Show"
        assert "id" in data
        assert "saved_at" in data

    def test_save_event_missing_fields_422(self, auth_client):
        resp = auth_client.post("/saved", json={"title": "Incomplete"})
        assert resp.status_code == 422


class TestDeleteSavedEvent:

    def test_requires_auth(self, client):
        resp = client.delete("/saved/1")
        assert resp.status_code in (401, 403)

    def test_delete_event(self, auth_client):
        create_resp = auth_client.post("/saved", json={
            "title": "Temp", "date": "2026-03-20", "time": "1 PM",
            "location": "Place", "tag": "X", "price": "0",
        })
        event_id = create_resp.json()["id"]
        resp = auth_client.delete(f"/saved/{event_id}")
        assert resp.status_code == 204

        # Verify it's gone
        events = auth_client.get("/saved").json()
        assert len(events) == 0

    def test_delete_nonexistent_404(self, auth_client):
        resp = auth_client.delete("/saved/9999")
        assert resp.status_code == 404