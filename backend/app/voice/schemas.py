import uuid
from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class VoicePreferenceUpdate(BaseModel):
    voice_name: str | None = Field(
        default=None,
        max_length=200,
    )

    language: str | None = Field(
        default=None,
        min_length=2,
        max_length=30,
    )

    speech_rate: float | None = Field(
        default=None,
        ge=0.5,
        le=2.0,
    )

    speech_pitch: float | None = Field(
        default=None,
        ge=0.5,
        le=2.0,
    )

    speech_volume: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )

    auto_read_guidance: bool | None = None

    announce_timer_events: bool | None = None

    guided_breathing_enabled: bool | None = None

    companion_voice_enabled: bool | None = None


class VoicePreferenceResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID
    user_id: uuid.UUID

    voice_name: str | None

    language: str

    speech_rate: float
    speech_pitch: float
    speech_volume: float

    auto_read_guidance: bool

    announce_timer_events: bool

    guided_breathing_enabled: bool

    companion_voice_enabled: bool

    created_at: datetime
    updated_at: datetime


class VoicePrivacyResponse(BaseModel):
    enabled: bool

    explanation: str


class VoiceGuide(BaseModel):
    id: str

    title: str

    category: str

    text: str


class VoiceGuidesResponse(BaseModel):
    guides: list[
        VoiceGuide
    ]
