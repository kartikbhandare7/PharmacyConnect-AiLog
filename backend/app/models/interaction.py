import uuid
from datetime import datetime, date, time, timezone
from typing import Optional
from sqlalchemy import ( # type: ignore
    String, Text, DateTime, Date, Time,
    Integer, Float, ForeignKey, Index, Enum as SAEnum
)
from sqlalchemy.orm import Mapped, mapped_column, relationship # type: ignore
from sqlalchemy.dialects.postgresql import UUID, JSONB # type: ignore
from app.db.session import Base
import enum


class SentimentEnum(str, enum.Enum):
    positive = "positive"
    neutral  = "neutral"
    negative = "negative"


class StatusEnum(str, enum.Enum):
    draft     = "draft"
    submitted = "submitted"


class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── Foreign keys ──────────────────────────────────────────────────────────
    hcp_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hcps.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    rep_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    # ── Interaction details ───────────────────────────────────────────────────
    interaction_type: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # Meeting | Phone call | Email | Conference | Remote detail
    interaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    interaction_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    attendees: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    topics_discussed: Mapped[str] = mapped_column(Text, nullable=False)

    # ── AI-inferred fields ────────────────────────────────────────────────────
    sentiment: Mapped[Optional[str]] = mapped_column(
        SAEnum(SentimentEnum, name="sentiment_enum"), nullable=True
    )
    sentiment_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Raw JSON blob from LangGraph — never lose AI output
    ai_extracted_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # ── Outcomes ──────────────────────────────────────────────────────────────
    outcomes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    follow_up_actions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_suggested_followups: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)

    # ── Audit / compliance ────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        SAEnum(StatusEnum, name="status_enum"), default="draft", nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    hcp: Mapped["HCP"] = relationship("HCP", back_populates="interactions")
    rep: Mapped["User"] = relationship("User", back_populates="interactions")
    material_links: Mapped[list["InteractionMaterial"]] = relationship(
        "InteractionMaterial", back_populates="interaction", cascade="all, delete-orphan"
    )
    sample_links: Mapped[list["InteractionSample"]] = relationship(
        "InteractionSample", back_populates="interaction", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_interaction_hcp_date", "hcp_id", "interaction_date"),
        Index("ix_interaction_rep_date", "rep_id", "interaction_date"),
    )

    def __repr__(self) -> str:
        return f"<Interaction {self.id} — {self.status}>"


# ── Junction tables ───────────────────────────────────────────────────────────

class InteractionMaterial(Base):
    __tablename__ = "interaction_materials"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    interaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("interactions.id", ondelete="CASCADE"), nullable=False
    )
    material_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("materials.id", ondelete="RESTRICT"), nullable=False
    )

    interaction: Mapped["Interaction"] = relationship("Interaction", back_populates="material_links")
    material: Mapped["Material"] = relationship("Material", back_populates="interaction_links")


class InteractionSample(Base):
    __tablename__ = "interaction_samples"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    interaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("interactions.id", ondelete="CASCADE"), nullable=False
    )
    sample_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("samples.id", ondelete="RESTRICT"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    interaction: Mapped["Interaction"] = relationship("Interaction", back_populates="sample_links")
    sample: Mapped["Sample"] = relationship("Sample", back_populates="interaction_links")