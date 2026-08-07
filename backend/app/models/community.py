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


class CommunityPost(Base):
    __tablename__ = "community_posts"

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

    title: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    body: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
        default="general",
        index=True,
    )

    anonymous: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    moderation_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="published",
        index=True,
    )

    moderation_reason: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    support_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    report_count: Mapped[int] = mapped_column(
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


class CommunityComment(Base):
    __tablename__ = "community_comments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )

    post_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey(
            "community_posts.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
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

    parent_comment_id: Mapped[
        uuid.UUID | None
    ] = mapped_column(
        Uuid,
        ForeignKey(
            "community_comments.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    body: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    anonymous: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    moderation_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="published",
        index=True,
    )

    moderation_reason: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    support_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    report_count: Mapped[int] = mapped_column(
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


class CommunityReaction(Base):
    __tablename__ = "community_reactions"

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

    post_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey(
            "community_posts.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    comment_id: Mapped[
        uuid.UUID | None
    ] = mapped_column(
        Uuid,
        ForeignKey(
            "community_comments.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    reaction_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="support",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class CommunityReport(Base):
    __tablename__ = "community_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )

    reporter_user_id: Mapped[
        uuid.UUID
    ] = mapped_column(
        Uuid,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    post_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey(
            "community_posts.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    comment_id: Mapped[
        uuid.UUID | None
    ] = mapped_column(
        Uuid,
        ForeignKey(
            "community_comments.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    reason: Mapped[str] = mapped_column(
        String(60),
        nullable=False,
    )

    details: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="open",
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )


class CommunityModerationAction(Base):
    __tablename__ = "community_moderation_actions"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )

    moderator_user_id: Mapped[
        uuid.UUID
    ] = mapped_column(
        Uuid,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    post_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey(
            "community_posts.id",
            ondelete="CASCADE",
        ),
        nullable=True,
    )

    comment_id: Mapped[
        uuid.UUID | None
    ] = mapped_column(
        Uuid,
        ForeignKey(
            "community_comments.id",
            ondelete="CASCADE",
        ),
        nullable=True,
    )

    action: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
    )

    note: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
