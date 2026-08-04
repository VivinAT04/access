import uuid
from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


class SubtaskCreate(BaseModel):
    task_id: uuid.UUID

    title: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )

    position: int | None = Field(
        default=None,
        ge=0,
    )

    @model_validator(mode="after")
    def clean_values(
        self,
    ) -> "SubtaskCreate":
        self.title = self.title.strip()

        if not self.title:
            raise ValueError(
                "Subtask title cannot be empty."
            )

        if self.description is not None:
            cleaned = self.description.strip()
            self.description = cleaned or None

        return self


class SubtaskUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )

    @model_validator(mode="after")
    def clean_values(
        self,
    ) -> "SubtaskUpdate":
        if self.title is not None:
            self.title = self.title.strip()

            if not self.title:
                raise ValueError(
                    "Subtask title cannot be empty."
                )

        if self.description is not None:
            cleaned = self.description.strip()
            self.description = cleaned or None

        return self


class SubtaskReorderItem(BaseModel):
    id: uuid.UUID
    position: int = Field(
        ge=0,
    )


class SubtaskReorderRequest(BaseModel):
    items: list[SubtaskReorderItem] = Field(
        min_length=1,
        max_length=200,
    )


class SubtaskResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    task_id: uuid.UUID
    title: str
    description: str | None
    position: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class TaskProgressResponse(BaseModel):
    task_id: uuid.UUID
    total_subtasks: int
    completed_subtasks: int
    progress_percentage: int
    is_completed: bool
