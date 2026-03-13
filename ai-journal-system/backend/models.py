from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(String, index=True, nullable=False)
    ambience = Column(String, nullable=False)  # forest | ocean | mountain
    text = Column(Text, nullable=False)
    emotion = Column(String, nullable=True)
    keywords = Column(String, nullable=True)   # stored as comma-separated
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
