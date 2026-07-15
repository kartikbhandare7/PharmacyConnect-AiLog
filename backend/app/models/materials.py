import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer # type: ignore
from sqlalchemy.orm import Mapped, mapped_column, relationship # type: ignore
from sqlalchemy.dialects.postgresql import UUID # type: ignore
from app.db.session import Base


class Material(Base):
    """Master list of approved marketing / clinical materials."""
    __tablename__ = "materials"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=True)   # e.g. Brochure, Clinical data
    file_url: Mapped[str] = mapped_column(String(500), nullable=True)
    version: Mapped[str] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    interaction_links: Mapped[list["InteractionMaterial"]] = relationship(
        "InteractionMaterial", back_populates="material"
    )


class Sample(Base):
    """Master list of approved drug samples."""
    __tablename__ = "samples"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    product_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    dosage: Mapped[str] = mapped_column(String(100), nullable=True)
    unit: Mapped[str] = mapped_column(String(50), nullable=True)        # e.g. tablets, vials
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    interaction_links: Mapped[list["InteractionSample"]] = relationship(
        "InteractionSample", back_populates="sample"
    )