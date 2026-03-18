"""Tests for auth router (register / login)."""


class TestRegister:

    def test_register_returns_201(self, client):
        resp = client.post("/auth/register", json={
            "username": "newuser", "email": "new@test.com",
            "password": "pass123", "name": "New",
        })
        assert resp.status_code == 201

    def test_register_returns_token(self, client):
        resp = client.post("/auth/register", json={
            "username": "newuser", "email": "new@test.com",
            "password": "pass123",
        })
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "newuser"

    def test_register_duplicate_username_400(self, client, test_user):
        resp = client.post("/auth/register", json={
            "username": "testuser", "email": "other@test.com",
            "password": "pass123",
        })
        assert resp.status_code == 400
        assert "Username already exists" in resp.json()["detail"]

    def test_register_duplicate_email_400(self, client, test_user):
        resp = client.post("/auth/register", json={
            "username": "other", "email": "test@example.com",
            "password": "pass123",
        })
        assert resp.status_code == 400
        assert "Email already exists" in resp.json()["detail"]

    def test_register_missing_fields_422(self, client):
        resp = client.post("/auth/register", json={})
        assert resp.status_code == 422


class TestLogin:

    def test_login_with_username(self, client, test_user):
        resp = client.post("/auth/login", json={
            "username": "testuser", "password": "password123",
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_with_email(self, client, test_user):
        resp = client.post("/auth/login", json={
            "username": "test@example.com", "password": "password123",
        })
        assert resp.status_code == 200

    def test_login_wrong_password_401(self, client, test_user):
        resp = client.post("/auth/login", json={
            "username": "testuser", "password": "wrong",
        })
        assert resp.status_code == 401

    def test_login_nonexistent_user_401(self, client):
        resp = client.post("/auth/login", json={
            "username": "nobody", "password": "pass",
        })
        assert resp.status_code == 401