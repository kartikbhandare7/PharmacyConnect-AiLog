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
    """What the LangGraph agent returns after parsing free-text."""
    hcp_name: Optional[str] = None
    hcp_id: Optional[UUID] = None
    interaction_type: Optional[str] = None
    topics_discussed: Optional[str] = None
    materials_mentioned: Optional[list[str]] = []
    sentiment: Optional[SentimentEnum] = None
    sentiment_confidence: Optional[float] = None
    outcomes: Optional[str] = None
    suggested_followups: Optional[list[str]] = []
    clarification_needed: bool = False
    clarification_question: Optional[str] = None
    raw_extraction: Optional[dict[str, Any]] = None


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