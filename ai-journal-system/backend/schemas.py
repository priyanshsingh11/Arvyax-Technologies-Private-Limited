from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class JournalEntryCreate(BaseModel):
    userId: str
    ambience: str
    text: str


class JournalEntryAnalyze(BaseModel):
    text: str


class JournalEntryResponse(BaseModel):
    id: int
    userId: str
    ambience: str
    text: str
    emotion: Optional[str] = None
    keywords: Optional[str] = None
    summary: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnalysisResponse(BaseModel):
    emotion: str
    keywords: List[str]
    summary: str


class InsightsResponse(BaseModel):
    totalEntries: int
    topEmotion: Optional[str] = None
    mostUsedAmbience: Optional[str] = None
    recentKeywords: List[str]
