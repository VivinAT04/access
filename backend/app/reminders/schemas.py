import uuid
from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


class ReminderCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )

    message: str | None = Field(
        default=None,
        max_length=2000,
    )

    remind_at: datetime

    task_id: uuid.UUID | None = None
    routine_id: uuid.UUID | None = None

    is_enabled: bool = True

    @model_validator(mode="after")
    def validate_values(
        self,
    ) -> "ReminderCreate":
        self.title = self.title.strip()

        if not self.title:
            raise ValueError(
                "Reminder title cannot be empty."
            )

        if (
            self.task_id is not None
            and self.routine_id is not None
        ):
            raise ValueError(
                "A reminder can link to either a task or a routine, not both."
            )

        if self.message is not None:
            cleaned = self.message.strip()
            self.message = cleaned or None

        return self


class ReminderUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    message: str | None = Field(
        default=None,
        max_length=2000,
    )

    remind_at: datetime | None = None
    is_enabled: bool | None = None

    @model_validator(mode="after")
    def validate_values(
        self,
    ) -> "ReminderUpdate":
        if self.title is not None:
            self.title = self.title.strip()

            if not self.title:
                raise ValueError(
                    "Reminder title cannot be empty."
                )

        if self.message is not None:
            cleaned = self.message.strip()
            self.message = cleaned or None

        return self


class ReminderResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    task_id: uuid.UUID | None
    routine_id: uuid.UUID | None
    title: str
    message: str | None
    remind_at: datetime
    is_enabled: bool
    is_dismissed: bool
    notified_at: datetime | None
    created_at: datetime
    updated_at: datetime
    is_due_now: bool
    is_overdue: bool

    model_config = ConfigDict(
        from_attributes=True,
    )


class ReminderSummaryResponse(BaseModel):
    total_active: int
    upcoming: int
    overdue: int
    due_today: int
