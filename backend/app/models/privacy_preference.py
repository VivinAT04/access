import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Uuid,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.db.base import Base


class PrivacyPreference(Base):
    __tablename__ = "privacy_preferences"

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

    adaptive_personalisation: Mapped[bool] = (
        mapped_column(
            Boolean,
            nullable=False,
            default=False,
        )
    )

    wellbeing_analytics: Mapped[bool] = (
        mapped_column(
            Boolean,
            nullable=False,
            default=True,
        )
    )

    community_profile_visible: Mapped[bool] = (
        mapped_column(
            Boolean,
            nullable=False,
            default=False,
        )
    )

    wearable_data_enabled: Mapped[bool] = (
        mapped_column(
            Boolean,
            nullable=False,
            default=False,
        )
    )

    voice_processing_enabled: Mapped[bool] = (
        mapped_column(
            Boolean,
            nullable=False,
            default=False,
        )
    )

    research_data_sharing: Mapped[bool] = (
        mapped_column(
            Boolean,
            nullable=False,
            default=False,
        )
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
