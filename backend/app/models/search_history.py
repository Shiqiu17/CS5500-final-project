from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func

from app.db.database import Base


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    city = Column(String(255), nullable=False)
    interests = Column(String(500), nullable=False)
    budget = Column(Float, nullable=True)
    date_range = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
