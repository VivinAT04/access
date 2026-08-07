import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.db.base import Base


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

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

    in_app_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    browser_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    task_reminders: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    routine_reminders: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    focus_reminders: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    wellbeing_checkins: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    community_activity: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    product_updates: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    quiet_hours_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    quiet_hours_start: Mapped[str] = mapped_column(
        String(5),
        nullable=False,
        default="22:00",
    )

    quiet_hours_end: Mapped[str] = mapped_column(
        String(5),
        nullable=False,
        default="08:00",
    )

    digest_frequency: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="instant",
    )

    max_daily_notifications: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=8,
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


class Notification(Base):
    __tablename__ = "notifications"

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

    notification_type: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    action_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    source_type: Mapped[str | None] = mapped_column(
        String(60),
        nullable=True,
    )

    source_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
    )

    is_dismissed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="normal",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    dismissed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
