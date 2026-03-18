"""Shared test configuration.

Provides an isolated SQLite database, test client, and auth helpers
so every test runs against a clean DB.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base, get_db
from app.main import app
from app.models.user import User
from app.routers.auth import create_access_token
import bcrypt
import os

os.environ["DATABASE_URL"] = "sqlite:///tests/test.db"
os.environ.setdefault("SECRET_KEY", "test-secret-key")


TEST_ENGINE = create_engine(
    "sqlite:///tests/db/test.db", connect_args={"check_same_thread": False}
)
TestSession = sessionmaker(bind=TEST_ENGINE, autocommit=False, autoflush=False)


Base.metadata.create_all(bind=TEST_ENGINE)


@pytest.fixture(autouse=True)
def _clean_tables():
    """Truncate all tables between tests."""
    yield
    session = TestSession()
    for table in reversed(Base.metadata.sorted_tables):
        session.execute(table.delete())
    session.commit()
    session.close()


@pytest.fixture
def db():
    session = TestSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    """TestClient wired to the test database."""
    def _override():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """Create and return a test user in the DB."""
    hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode("utf-8")
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash=hashed,
        name="Test User",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_header(test_user):
    """Return an Authorization header dict for the test user."""
    token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_client(client, auth_header):
    """TestClient that sends auth headers on every request."""
    original_post = client.post
    original_get = client.get
    original_delete = client.delete

    def _post(url, **kwargs):
        kwargs.setdefault("headers", {}).update(auth_header)
        return original_post(url, **kwargs)

    def _get(url, **kwargs):
        kwargs.setdefault("headers", {}).update(auth_header)
        return original_get(url, **kwargs)

    def _delete(url, **kwargs):
        kwargs.setdefault("headers", {}).update(auth_header)
        return original_delete(url, **kwargs)

    client.post = _post
    client.get = _get
    client.delete = _delete
    return client
