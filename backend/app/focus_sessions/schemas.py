import uuid
from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


FocusSessionStatus = Literal[
    "completed",
    "cancelled",
]


class FocusSessionCreate(BaseModel):
    task_id: uuid.UUID | None = None

    intention: str = Field(
        min_length=1,
        max_length=250,
    )

    notes: str | None = Field(
        default=None,
        max_length=5000,
    )

    planned_minutes: int = Field(
        ge=1,
        le=240,
    )

    completed_minutes: int = Field(
        ge=0,
        le=240,
    )

    status: FocusSessionStatus = "completed"

    started_at: datetime
    completed_at: datetime | None = None

    @model_validator(mode="after")
    def clean_values(
        self,
    ) -> "FocusSessionCreate":
        self.intention = self.intention.strip()

        if not self.intention:
            raise ValueError(
                "Session intention cannot be empty."
            )

        if self.notes is not None:
            cleaned_notes = self.notes.strip()
            self.notes = cleaned_notes or None

        if (
            self.completed_minutes >
            self.planned_minutes
        ):
            self.completed_minutes = (
                self.planned_minutes
            )

        return self


class FocusSessionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    task_id: uuid.UUID | None
    intention: str
    notes: str | None
    planned_minutes: int
    completed_minutes: int
    status: FocusSessionStatus
    started_at: datetime
    completed_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class FocusSummaryResponse(BaseModel):
    sessions_today: int
    minutes_today: int
    completed_sessions: int
    total_minutes: int
