"""Tests for SQLAlchemy models and their relationships."""

from app.models.user import User
from app.models.planner import Planner
from app.models.saved_event import SavedEvent


class TestUserModel:

    def test_create_user(self, db):
        user = User(username="alice", email="alice@test.com", password_hash="hash", name="Alice")
        db.add(user)
        db.commit()
        assert user.id is not None
        assert user.username == "alice"

    def test_user_has_planners_relationship(self, db):
        user = User(username="bob", email="bob@test.com", password_hash="hash")
        db.add(user)
        db.commit()
        planner = Planner(user_id=user.id, title="Plan", date="2026-03-20", city="NYC", summary="A plan")
        db.add(planner)
        db.commit()
        db.refresh(user)
        assert len(user.planners) == 1
        assert user.planners[0].title == "Plan"

    def test_user_has_saved_events_relationship(self, db):
        user = User(username="carol", email="carol@test.com", password_hash="hash")
        db.add(user)
        db.commit()
        event = SavedEvent(
            user_id=user.id, title="Event", date="2026-03-20",
            time="10:00 AM", location="NYC", tag="Food", price="20",
        )
        db.add(event)
        db.commit()
        db.refresh(user)
        assert len(user.saved_events) == 1


class TestPlannerModel:

    def test_create_planner(self, db, test_user):
        planner = Planner(
            user_id=test_user.id, title="Day Plan",
            date="2026-03-20", city="SF", summary="Fun day",
        )
        db.add(planner)
        db.commit()
        assert planner.id is not None
        assert planner.user.id == test_user.id

    def test_planner_has_activities(self, db, test_user):
        planner = Planner(
            user_id=test_user.id, title="Day Plan",
            date="2026-03-20", city="SF", summary="Fun day",
        )
        db.add(planner)
        db.flush()

        event = SavedEvent(
            user_id=test_user.id, planner_id=planner.id,
            title="Lunch", date="2026-03-20", time="12:00 PM",
            location="Restaurant", tag="Food", price="25",
        )
        db.add(event)
        db.commit()
        db.refresh(planner)

        assert len(planner.activities) == 1
        assert planner.activities[0].title == "Lunch"
        assert planner.activities[0].planner_id == planner.id


class TestSavedEventModel:

    def test_create_saved_event(self, db, test_user):
        event = SavedEvent(
            user_id=test_user.id, title="Concert", date="2026-03-20",
            time="8:00 PM", location="Venue", tag="Music", price="50",
        )
        db.add(event)
        db.commit()
        assert event.id is not None
        assert event.saved_at is not None

    def test_saved_event_planner_id_nullable(self, db, test_user):
        event = SavedEvent(
            user_id=test_user.id, title="Solo Event", date="2026-03-20",
            time="3:00 PM", location="Park", tag="Outdoor", price="0",
        )
        db.add(event)
        db.commit()
        assert event.planner_id is None

    def test_cascade_delete_user_deletes_events(self, db):
        user = User(username="temp", email="temp@test.com", password_hash="hash")
        db.add(user)
        db.commit()
        event = SavedEvent(
            user_id=user.id, title="Event", date="2026-03-20",
            time="10:00 AM", location="NYC", tag="Art", price="10",
        )
        db.add(event)
        db.commit()
        event_id = event.id

        db.delete(user)
        db.commit()
        assert db.get(SavedEvent, event_id) is None
