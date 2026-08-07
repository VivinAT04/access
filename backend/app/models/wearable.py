import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Uuid,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.db.base import Base


class WearableDevice(Base):
    __tablename__ = "wearable_devices"

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

    provider: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
        default="manual",
    )

    device_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        default="Manual heart-rate source",
    )

    external_device_id: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    is_connected: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    last_synced_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class HeartRateSample(Base):
    __tablename__ = "heart_rate_samples"

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

    device_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey(
            "wearable_devices.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    bpm: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
        default="manual",
    )

    measured_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class HeartRateBaseline(Base):
    __tablename__ = "heart_rate_baselines"

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

    baseline_bpm: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    sample_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    threshold_percentage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=20.0,
    )

    calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class WearableSignal(Base):
    __tablename__ = "wearable_signals"

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

    heart_rate_sample_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey(
            "heart_rate_samples.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    signal_type: Mapped[str] = mapped_column(
        String(60),
        nullable=False,
        default="elevated-arousal",
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="notice",
    )

    baseline_bpm: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    observed_bpm: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    percentage_above_baseline: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )
