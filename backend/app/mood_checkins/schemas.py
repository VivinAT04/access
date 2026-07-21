import uuid
from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


class MoodCheckinCreate(BaseModel):
    mood_score: int = Field(
        ge=1,
        le=5,
    )

    energy_level: int = Field(
        ge=1,
        le=5,
    )

    stress_level: int = Field(
        ge=1,
        le=5,
    )

    emotions: list[str] = Field(
        default_factory=list,
        max_length=10,
    )

    note: str | None = Field(
        default=None,
        max_length=3000,
    )

    @field_validator("emotions")
    @classmethod
    def clean_emotions(
        cls,
        values: list[str],
    ) -> list[str]:
        cleaned: list[str] = []

        for value in values:
            emotion = value.strip().lower()

            if emotion and emotion not in cleaned:
                cleaned.append(emotion)

        return cleaned

    @field_validator("note")
    @classmethod
    def clean_note(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        cleaned = value.strip()

        return cleaned or None


class MoodCheckinResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    mood_score: int
    energy_level: int
    stress_level: int
    emotions: list[str]
    note: str | None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class MoodSummaryResponse(BaseModel):
    entries_today: int
    total_entries: int
    average_mood: float
    average_energy: float
    average_stress: float
