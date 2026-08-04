import uuid
from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


AnxietyExerciseType = Literal[
    "box_breathing",
    "four_seven_eight",
    "grounding_54321",
    "quick_calm",
]


class AnxietySessionCreate(BaseModel):
    exercise_type: AnxietyExerciseType

    duration_seconds: int = Field(
        ge=0,
        le=7200,
    )

    completed: bool = True


class AnxietySessionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    exercise_type: AnxietyExerciseType
    duration_seconds: int
    completed: bool
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class AnxietySummaryResponse(BaseModel):
    sessions_today: int
    minutes_today: int
    total_sessions: int
    total_minutes: int
    favourite_exercise: str | None
