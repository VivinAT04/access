import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Uuid,
    func,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.db.base import Base


class OfflineSyncRecord(Base):
    __tablename__ = "offline_sync_records"

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

    client_operation_id: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        index=True,
    )

    resource_type: Mapped[str] = mapped_column(
        String(60),
        nullable=False,
    )

    operation: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    resource_id: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    payload: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="accepted",
    )

    retry_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    conflict_reason: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    client_created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
