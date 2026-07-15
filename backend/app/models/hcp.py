import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text, Index # type: ignore
from sqlalchemy.orm import Mapped, mapped_column, relationship # type: ignore
from sqlalchemy.dialects.postgresql import UUID # type: ignore
from app.db.session import Base


class HCP(Base):
    __tablename__ = "hcps"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    specialty: Mapped[str] = mapped_column(String(150), nullable=False)
    hospital: Mapped[str] = mapped_column(String(255), nullable=False)
    territory: Mapped[str] = mapped_column(String(150), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    interactions: Mapped[list["Interaction"]] = relationship(
        "Interaction", back_populates="hcp", lazy="select"
    )

    # Full-text search index on name + specialty + hospital
    __table_args__ = (
        Index("ix_hcp_name", "name"),
    )

    def __repr__(self) -> str:
        return f"<HCP {self.name} — {self.specialty}>"