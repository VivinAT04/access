import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LanguagePreference(Base):
    __tablename__ = "language_preferences"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
        index=True,
    )

    locale: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="en-GB",
    )

    direction: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="auto",
    )

    letter_spacing: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="normal",
    )

    dyslexia_friendly: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    reading_guide: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
