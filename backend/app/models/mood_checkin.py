import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Integer,
    Text,
    Uuid,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MoodCheckin(Base):
    __tablename__ = "mood_checkins"

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
        index=True,
    )

    mood_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    energy_level: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    stress_level: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    emotions: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )
