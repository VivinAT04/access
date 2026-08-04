import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


RoutineCategory = Literal[
    "morning",
    "study",
    "work",
    "evening",
    "custom",
]

RoutineRunStatus = Literal[
    "in-progress",
    "completed",
]


class RoutineStepCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=2000,
    )

    position: int | None = Field(
        default=None,
        ge=0,
    )

    estimated_minutes: int | None = Field(
        default=None,
        ge=1,
        le=240,
    )

    @model_validator(mode="after")
    def clean_values(
        self,
    ) -> "RoutineStepCreate":
        self.title = self.title.strip()

        if not self.title:
            raise ValueError(
                "Routine step title cannot be empty."
            )

        if self.description is not None:
            cleaned = self.description.strip()
            self.description = cleaned or None

        return self


class RoutineCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=3000,
    )

    category: RoutineCategory = "custom"

    steps: list[RoutineStepCreate] = Field(
        default_factory=list,
        max_length=100,
    )

    @model_validator(mode="after")
    def clean_values(
        self,
    ) -> "RoutineCreate":
        self.title = self.title.strip()

        if not self.title:
            raise ValueError(
                "Routine title cannot be empty."
            )

        if self.description is not None:
            cleaned = self.description.strip()
            self.description = cleaned or None

        return self


class RoutineUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=3000,
    )

    category: RoutineCategory | None = None

    @model_validator(mode="after")
    def clean_values(
        self,
    ) -> "RoutineUpdate":
        if self.title is not None:
            self.title = self.title.strip()

            if not self.title:
                raise ValueError(
                    "Routine title cannot be empty."
                )

        if self.description is not None:
            cleaned = self.description.strip()
            self.description = cleaned or None

        return self


class RoutineStepUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=2000,
    )

    estimated_minutes: int | None = Field(
        default=None,
        ge=1,
        le=240,
    )

    @model_validator(mode="after")
    def clean_values(
        self,
    ) -> "RoutineStepUpdate":
        if self.title is not None:
            self.title = self.title.strip()

            if not self.title:
                raise ValueError(
                    "Routine step title cannot be empty."
                )

        if self.description is not None:
            cleaned = self.description.strip()
            self.description = cleaned or None

        return self


class RoutineStepReorderItem(BaseModel):
    id: uuid.UUID
    position: int = Field(ge=0)


class RoutineStepReorderRequest(BaseModel):
    items: list[RoutineStepReorderItem] = Field(
        min_length=1,
        max_length=100,
    )


class RoutineStepResponse(BaseModel):
    id: uuid.UUID
    routine_id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str | None
    position: int
    estimated_minutes: int | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class RoutineResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str | None
    category: RoutineCategory
    is_active: bool
    created_at: datetime
    updated_at: datetime
    steps: list[RoutineStepResponse]


class RoutineRunStepResponse(BaseModel):
    id: uuid.UUID
    run_id: uuid.UUID
    routine_step_id: uuid.UUID | None
    user_id: uuid.UUID
    title: str
    position: int
    is_completed: bool
    completed_at: datetime | None

    model_config = ConfigDict(
        from_attributes=True,
    )


class RoutineRunResponse(BaseModel):
    id: uuid.UUID
    routine_id: uuid.UUID
    user_id: uuid.UUID
    run_date: date
    status: RoutineRunStatus
    started_at: datetime
    completed_at: datetime | None
    routine_title: str
    progress_percentage: int
    completed_steps: int
    total_steps: int
    steps: list[RoutineRunStepResponse]


class RoutineSummaryResponse(BaseModel):
    total_routines: int
    active_runs_today: int
    completed_runs_today: int
    total_completed_runs: int
