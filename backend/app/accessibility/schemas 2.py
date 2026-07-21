import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


FontSize = Literal[
    "small",
    "medium",
    "large",
    "extra-large",
]


class AccessibilityPreferenceUpdate(BaseModel):
    font_size: FontSize | None = None
    high_contrast: bool | None = None
    reduced_motion: bool | None = None
    dyslexia_friendly_font: bool | None = None
    increased_spacing: bool | None = None
    simplified_interface: bool | None = None
    screen_reader_optimised: bool | None = None


class AccessibilityPreferenceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    font_size: FontSize
    high_contrast: bool
    reduced_motion: bool
    dyslexia_friendly_font: bool
    increased_spacing: bool
    simplified_interface: bool
    screen_reader_optimised: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
