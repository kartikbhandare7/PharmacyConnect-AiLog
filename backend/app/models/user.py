import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime # type: ignore
from sqlalchemy.orm import Mapped, mapped_column, relationship # type: ignore
from sqlalchemy.dialects.postgresql import UUID # type: ignore
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="rep")  # rep | manager | admin
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    interactions: Mapped[list["Interaction"]] = relationship(
        "Interaction", back_populates="rep", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"