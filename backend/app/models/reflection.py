import uuid
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Reflection(Base):
    __tablename__ = "reflections"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "reflection_date",
            name="uq_reflection_user_date",
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

    reflection_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    good_thing: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    challenge: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    accomplishment: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
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
