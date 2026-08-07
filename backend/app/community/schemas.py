import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


CommunityCategory = Literal[
    "general",
    "focus",
    "study",
    "work",
    "wellbeing",
    "sensory",
    "routines",
    "wins",
]

ModerationStatus = Literal[
    "published",
    "pending_review",
    "hidden",
]

ReportReason = Literal[
    "harassment",
    "unsafe-content",
    "misinformation",
    "spam",
    "privacy",
    "other",
]


class CommunityPostCreate(BaseModel):
    title: str = Field(
        min_length=3,
        max_length=180,
    )
    body: str = Field(
        min_length=3,
        max_length=5000,
    )
    category: CommunityCategory = "general"
    anonymous: bool = False


class CommunityCommentCreate(BaseModel):
    body: str = Field(
        min_length=1,
        max_length=3000,
    )
    anonymous: bool = False
    parent_comment_id: uuid.UUID | None = None


class CommunityReportCreate(BaseModel):
    reason: ReportReason
    details: str | None = Field(
        default=None,
        max_length=1000,
    )


class CommunityModerationUpdate(BaseModel):
    action: Literal[
        "approve",
        "hide",
        "restore",
    ]
    note: str | None = Field(
        default=None,
        max_length=1000,
    )


class CommunityAuthor(BaseModel):
    display_name: str
    is_anonymous: bool
    is_current_user: bool


class CommunityCommentResponse(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    parent_comment_id: uuid.UUID | None
    body: str
    author: CommunityAuthor
    moderation_status: ModerationStatus
    support_count: int
    viewer_supported: bool
    created_at: datetime


class CommunityPostResponse(BaseModel):
    id: uuid.UUID
    title: str
    body: str
    category: CommunityCategory
    author: CommunityAuthor
    moderation_status: ModerationStatus
    moderation_reason: str | None
    support_count: int
    viewer_supported: bool
    comment_count: int
    comments: list[CommunityCommentResponse] = Field(
        default_factory=list,
    )
    created_at: datetime


class CommunityReactionResponse(BaseModel):
    supported: bool
    support_count: int


class CommunityReportResponse(BaseModel):
    id: uuid.UUID
    status: str
    message: str


class CommunityModerationItem(BaseModel):
    content_type: Literal[
        "post",
        "comment",
    ]
    content_id: uuid.UUID
    title: str | None
    body: str
    moderation_status: str
    moderation_reason: str | None
    report_count: int
    created_at: datetime


class CommunityGuidelinesResponse(BaseModel):
    title: str
    rules: list[str]
    safety_message: str
    moderation_message: str


class CommunityModeratorStatusResponse(BaseModel):
    is_moderator: bool
