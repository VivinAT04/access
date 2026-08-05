import re
import uuid
from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


Direction = Literal[
    "auto",
    "ltr",
    "rtl",
]

LetterSpacing = Literal[
    "normal",
    "relaxed",
    "wide",
]


LOCALE_PATTERN = re.compile(
    r"^[A-Za-z]{2,3}"
    r"(?:-[A-Za-z]{4})?"
    r"(?:-[A-Za-z]{2}|-[0-9]{3})?"
    r"(?:-[A-Za-z0-9]{5,8})*$"
)


class LanguagePreferenceUpdate(BaseModel):
    locale: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )

    direction: Direction | None = None

    letter_spacing: LetterSpacing | None = None

    dyslexia_friendly: bool | None = None

    reading_guide: bool | None = None

    @field_validator("locale")
    @classmethod
    def validate_locale(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return value

        cleaned = value.strip()

        if not LOCALE_PATTERN.fullmatch(
            cleaned
        ):
            raise ValueError(
                "Enter a valid language locale, "
                "such as en-GB, ta-IN or ar-SA."
            )

        return cleaned


class LanguagePreferenceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    locale: str
    direction: Direction
    letter_spacing: LetterSpacing
    dyslexia_friendly: bool
    reading_guide: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )
