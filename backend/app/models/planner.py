from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Planner(Base):
    __tablename__ = "planner"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False)
    city = Column(String, nullable=False)
    summary = Column(String, nullable=False)
    activities = relationship("SavedEvent", back_populates="planner")
    user = relationship("User", back_populates="planners")
