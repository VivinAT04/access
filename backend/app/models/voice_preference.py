import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    String,
    Uuid,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.db.base import Base


class VoicePreference(Base):
    __tablename__ = "voice_preferences"

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

    voice_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    language: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="en-GB",
    )

    speech_rate: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.95,
    )

    speech_pitch: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=1.0,
    )

    speech_volume: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=1.0,
    )

    auto_read_guidance: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    announce_timer_events: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    guided_breathing_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    companion_voice_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
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
