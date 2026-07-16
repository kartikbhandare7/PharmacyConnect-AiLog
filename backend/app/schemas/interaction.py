from uuid import UUID
from datetime import date, time, datetime
from typing import Optional, Any
from pydantic import BaseModel
from app.models.interaction import SentimentEnum, StatusEnum


# ── Inbound: chat parse request ───────────────────────────────────────────────

class ParseRequest(BaseModel):
    text: str                          # Free-text from the chat panel
    session_id: Optional[str] = None   # Tracks multi-turn chat history


class ParsedInteractionData(BaseModel):

    hcp_id: str | None = None

    hcp_name: str | None = None

    specialty: str | None = None

    hospital: str | None = None

    interaction_type: str | None = None

    topics_discussed: str | None = None

    materials_mentioned: list[str] = []

    sentiment: str | None = None

    sentiment_confidence: float | None = None

    outcomes: str | None = None

    suggested_followups: list[str] = []

    clarification_needed: bool = False

    clarification_question: str | None = None

    raw_extraction: dict | None = None


# ── Inbound: create interaction ───────────────────────────────────────────────

class MaterialLink(BaseModel):
    material_id: UUID


class SampleLink(BaseModel):
    sample_id: UUID
    quantity: int = 1


class InteractionCreate(BaseModel):
    hcp_id: UUID
    interaction_type: str
    interaction_date: date
    interaction_time: Optional[time] = None
    attendees: Optional[str] = None
    topics_discussed: str
    materials_shared: list[MaterialLink] = []
    samples_distributed: list[SampleLink] = []
    sentiment: Optional[SentimentEnum] = None
    sentiment_confidence: Optional[float] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = None
    ai_suggested_followups: Optional[list[str]] = []
    ai_extracted_data: Optional[dict[str, Any]] = None


# ── Outbound ──────────────────────────────────────────────────────────────────

class InteractionOut(BaseModel):
    id: UUID
    hcp_id: UUID
    rep_id: UUID
    interaction_type: str
    interaction_date: date
    interaction_time: Optional[time] = None
    attendees: Optional[str] = None
    topics_discussed: str
    sentiment: Optional[SentimentEnum] = None
    sentiment_confidence: Optional[float] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = None
    ai_suggested_followups: Optional[list[str]] = []
    status: StatusEnum
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FollowupSuggestionsOut(BaseModel):
    interaction_id: UUID
    suggestions: list[str]