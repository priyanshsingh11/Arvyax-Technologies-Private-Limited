from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json

from database import engine, get_db, Base
from models import JournalEntry
from schemas import (
    JournalEntryCreate,
    JournalEntryAnalyze,
    JournalEntryResponse,
    AnalysisResponse,
    InsightsResponse,
)
from llm import analyze_journal_entry
from insights import compute_insights

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Assisted Journal System",
    description="Nature session journal with LLM-powered emotion analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "AI Journal System is running"}


# ---------------------------------------------------------------------------
# 1. Create Journal Entry  POST /api/journal
# ---------------------------------------------------------------------------

@app.post("/api/journal", response_model=JournalEntryResponse, status_code=201, tags=["Journal"])
def create_journal_entry(payload: JournalEntryCreate, db: Session = Depends(get_db)):
    """
    Store a new journal entry. Does NOT run LLM analysis automatically —
    call POST /api/journal/analyze separately for analysis.
    """
    entry = JournalEntry(
        userId=payload.userId,
        ambience=payload.ambience,
        text=payload.text,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


# ---------------------------------------------------------------------------
# 3. Emotion Analysis  POST /api/journal/analyze
# NOTE: This route MUST be defined BEFORE the /{userId} GET to avoid
#       FastAPI treating "analyze" as a userId path parameter.
# ---------------------------------------------------------------------------

@app.post("/api/journal/analyze", response_model=AnalysisResponse, tags=["Analysis"])
def analyze_entry(payload: JournalEntryAnalyze):
    """
    Analyze the emotional tone of a journal entry using Groq LLaMA-3.
    Returns emotion, keywords, and a summary.
    """
    try:
        result = analyze_journal_entry(payload.text)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM analysis failed: {str(exc)}")

    return AnalysisResponse(
        emotion=result.get("emotion", "unknown"),
        keywords=result.get("keywords", []),
        summary=result.get("summary", ""),
    )


# ---------------------------------------------------------------------------
# 4. Insights  GET /api/journal/insights/{userId}
# NOTE: Defined before /{userId} for the same routing reason.
# ---------------------------------------------------------------------------

@app.get("/api/journal/insights/{userId}", response_model=InsightsResponse, tags=["Insights"])
def get_insights(userId: str, db: Session = Depends(get_db)):
    """
    Return aggregated insights for a user: total entries, top emotion,
    most-used ambience, and recent keywords.
    """
    entries = db.query(JournalEntry).filter(JournalEntry.userId == userId).all()
    insights = compute_insights(entries)
    return InsightsResponse(**insights)


# ---------------------------------------------------------------------------
# 2. Get User Entries  GET /api/journal/{userId}
# ---------------------------------------------------------------------------

@app.get("/api/journal/{userId}", response_model=list[JournalEntryResponse], tags=["Journal"])
def get_user_entries(userId: str, db: Session = Depends(get_db)):
    """
    Return all journal entries for the given user, most recent first.
    """
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.userId == userId)
        .order_by(JournalEntry.created_at.desc())
        .all()
    )
    return entries


# ---------------------------------------------------------------------------
# Bonus: Analyze & Save — POST /api/journal/{entryId}/analyze
# Runs LLM and persists results back to the entry row.
# ---------------------------------------------------------------------------

@app.post("/api/journal/{entryId}/analyze", response_model=JournalEntryResponse, tags=["Analysis"])
def analyze_and_save(entryId: int, db: Session = Depends(get_db)):
    """
    Run emotion analysis on an existing entry and save results to the database.
    """
    entry = db.query(JournalEntry).filter(JournalEntry.id == entryId).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    try:
        result = analyze_journal_entry(entry.text)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM analysis failed: {str(exc)}")

    entry.emotion = result.get("emotion", "unknown")
    entry.keywords = ", ".join(result.get("keywords", []))
    entry.summary = result.get("summary", "")
    db.commit()
    db.refresh(entry)
    return entry
