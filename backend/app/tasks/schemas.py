import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


TaskPriority = Literal[
    "low",
    "medium",
    "high",
    "urgent",
]

TaskStatus = Literal[
    "pending",
    "in-progress",
    "completed",
]


class TaskCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )

    priority: TaskPriority = "medium"
    status: TaskStatus = "pending"
    due_date: datetime | None = None

    @model_validator(mode="after")
    def clean_values(self) -> "TaskCreate":
        self.title = self.title.strip()

        if not self.title:
            raise ValueError("Task title cannot be empty.")

        if self.description is not None:
            cleaned_description = self.description.strip()
            self.description = cleaned_description or None

        return self


class TaskUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )

    priority: TaskPriority | None = None
    status: TaskStatus | None = None
    due_date: datetime | None = None

    @model_validator(mode="after")
    def clean_values(self) -> "TaskUpdate":
        if self.title is not None:
            self.title = self.title.strip()

            if not self.title:
                raise ValueError("Task title cannot be empty.")

        if self.description is not None:
            cleaned_description = self.description.strip()
            self.description = cleaned_description or None

        return self


class TaskResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str | None
    priority: TaskPriority
    status: TaskStatus
    due_date: datetime | None
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskSummaryResponse(BaseModel):
    total: int
    pending: int
    in_progress: int
    completed: int
    overdue: int
