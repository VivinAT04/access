import uuid
from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    Field,
)


DigestFrequency = Literal[
    "instant",
    "hourly",
    "daily",
    "off",
]

NotificationPriority = Literal[
    "low",
    "normal",
    "high",
]


class NotificationPreferenceUpdate(BaseModel):
    in_app_enabled: bool | None = None
    browser_enabled: bool | None = None

    task_reminders: bool | None = None
    routine_reminders: bool | None = None
    focus_reminders: bool | None = None
    wellbeing_checkins: bool | None = None
    community_activity: bool | None = None
    product_updates: bool | None = None

    quiet_hours_enabled: bool | None = None

    quiet_hours_start: str | None = Field(
        default=None,
        pattern=r"^\d{2}:\d{2}$",
    )

    quiet_hours_end: str | None = Field(
        default=None,
        pattern=r"^\d{2}:\d{2}$",
    )

    digest_frequency: DigestFrequency | None = None

    max_daily_notifications: int | None = Field(
        default=None,
        ge=1,
        le=50,
    )


class NotificationPreferenceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID

    in_app_enabled: bool
    browser_enabled: bool

    task_reminders: bool
    routine_reminders: bool
    focus_reminders: bool
    wellbeing_checkins: bool
    community_activity: bool
    product_updates: bool

    quiet_hours_enabled: bool
    quiet_hours_start: str
    quiet_hours_end: str

    digest_frequency: DigestFrequency
    max_daily_notifications: int

    created_at: datetime
    updated_at: datetime


class NotificationCreate(BaseModel):
    notification_type: str = Field(
        min_length=2,
        max_length=40,
    )

    title: str = Field(
        min_length=2,
        max_length=180,
    )

    message: str = Field(
        min_length=1,
        max_length=3000,
    )

    action_url: str | None = Field(
        default=None,
        max_length=500,
    )

    source_type: str | None = Field(
        default=None,
        max_length=60,
    )

    source_id: str | None = Field(
        default=None,
        max_length=100,
    )

    priority: NotificationPriority = "normal"


class NotificationResponse(BaseModel):
    id: uuid.UUID

    notification_type: str

    title: str
    message: str

    action_url: str | None

    source_type: str | None
    source_id: str | None

    is_read: bool
    is_dismissed: bool

    priority: NotificationPriority

    created_at: datetime
    read_at: datetime | None
    dismissed_at: datetime | None


class NotificationSummaryResponse(BaseModel):
    total: int
    unread: int
    dismissed: int


class NotificationActionResponse(BaseModel):
    message: str


class BrowserNotificationPreview(BaseModel):
    title: str
    body: str
    action_url: str
