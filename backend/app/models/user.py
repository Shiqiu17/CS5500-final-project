from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    interests = Column(String, nullable=True)
    environment_preference = Column(String, nullable=True)
    dietary_restrictions = Column(String, nullable=True)
    accessibility_needs = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    saved_events = relationship("SavedEvent", back_populates="user", cascade="all, delete-orphan")
    planners = relationship("Planner", back_populates="user", cascade="all, delete-orphan")