from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, func

from app.db.database import Base


class SavedEvent(Base):
    __tablename__ = "saved_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False)
    estimated_cost = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    indoor = Column(Boolean, nullable=False)
    source = Column(String(255), nullable=False)
    event_url = Column(String(1000), nullable=False)
    start_time = Column(String(50), nullable=False)
    end_time = Column(String(50), nullable=False)
    saved_at = Column(DateTime(timezone=True), server_default=func.now())
