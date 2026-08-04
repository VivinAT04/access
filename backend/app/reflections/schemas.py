import uuid
from datetime import date, datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


class ReflectionCreate(BaseModel):
    reflection_date: date

    good_thing: str = Field(
        min_length=1,
        max_length=500,
    )

    challenge: str = Field(
        min_length=1,
        max_length=500,
    )

    accomplishment: str = Field(
        min_length=1,
        max_length=500,
    )

    note: str | None = Field(
        default=None,
        max_length=3000,
    )

    @field_validator(
        "good_thing",
        "challenge",
        "accomplishment",
    )
    @classmethod
    def clean_required_text(
        cls,
        value: str,
    ) -> str:
        cleaned = value.strip()

        if not cleaned:
            raise ValueError(
                "This response cannot be empty."
            )

        return cleaned

    @field_validator("note")
    @classmethod
    def clean_optional_text(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        cleaned = value.strip()

        return cleaned or None


class ReflectionUpdate(BaseModel):
    good_thing: str = Field(
        min_length=1,
        max_length=500,
    )

    challenge: str = Field(
        min_length=1,
        max_length=500,
    )

    accomplishment: str = Field(
        min_length=1,
        max_length=500,
    )

    note: str | None = Field(
        default=None,
        max_length=3000,
    )

    @field_validator(
        "good_thing",
        "challenge",
        "accomplishment",
    )
    @classmethod
    def clean_required_text(
        cls,
        value: str,
    ) -> str:
        cleaned = value.strip()

        if not cleaned:
            raise ValueError(
                "This response cannot be empty."
            )

        return cleaned

    @field_validator("note")
    @classmethod
    def clean_optional_text(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        cleaned = value.strip()

        return cleaned or None


class ReflectionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    reflection_date: date
    good_thing: str
    challenge: str
    accomplishment: str
    note: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ReflectionSummaryResponse(BaseModel):
    total_reflections: int
    reflected_today: bool
    current_streak: int
