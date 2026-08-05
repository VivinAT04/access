import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CompanionProfile(Base):
    __tablename__ = "companion_profiles"

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

    companion_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="sprout",
    )

    companion_name: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
        default="Moss",
    )

    total_xp: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    current_level: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    completed_sessions: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    total_focus_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
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


class CompanionReward(Base):
    __tablename__ = "companion_rewards"

    __table_args__ = (
        UniqueConstraint(
            "focus_session_id",
            name="uq_companion_reward_focus_session",
        ),
    )

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

    companion_profile_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey(
            "companion_profiles.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    focus_session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey(
            "focus_sessions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    xp_awarded: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    focus_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
