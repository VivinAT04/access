import uuid
from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


SupportStyle = Literal[
    "balanced",
    "focus-first",
    "calm-first",
    "routine-first",
]

EnergyPreference = Literal[
    "low",
    "balanced",
    "high",
]

PromptStyle = Literal[
    "gentle",
    "concise",
    "structured",
]


class PersonalisationPreferenceUpdate(BaseModel):
    preferred_focus_minutes: int | None = Field(
        default=None,
        ge=5,
        le=120,
    )

    preferred_support_style: SupportStyle | None = None
    preferred_energy_level: EnergyPreference | None = None
    preferred_prompt_style: PromptStyle | None = None


class PersonalisationPreferenceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID

    preferred_focus_minutes: int
    preferred_support_style: SupportStyle
    preferred_energy_level: EnergyPreference
    preferred_prompt_style: PromptStyle

    created_at: datetime
    updated_at: datetime


class PersonalisationRecommendationResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID

    recommendation_type: str

    title: str
    message: str
    reason: str

    action_url: str | None

    feedback: str | None

    created_at: datetime


class PersonalisationRecommendationSet(BaseModel):
    enabled: bool

    explanation: str

    recommendations: list[
        PersonalisationRecommendationResponse
    ]


class RecommendationFeedback(BaseModel):
    feedback: Literal[
        "helpful",
        "not-helpful",
    ]


class PersonalisationHistoryResponse(BaseModel):
    recommendations: list[
        PersonalisationRecommendationResponse
    ]


class PersonalisationResetResponse(BaseModel):
    message: str


class PersonalisationProfileResponse(BaseModel):
    adaptive_personalisation_enabled: bool

    preferred_focus_minutes: int
    preferred_support_style: str
    preferred_energy_level: str
    preferred_prompt_style: str

    explanation: str
