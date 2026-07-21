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


class AccessibilityPreference(Base):
    __tablename__ = "accessibility_preferences"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    font_size: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="medium",
    )

    high_contrast: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    reduced_motion: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    dyslexia_friendly_font: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    increased_spacing: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    simplified_interface: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    screen_reader_optimised: Mapped[bool] = mapped_column(
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
