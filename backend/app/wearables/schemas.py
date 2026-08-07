import uuid
from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


WearableProvider = Literal[
    "manual",
    "apple-health",
    "google-health-connect",
    "fitbit",
    "garmin",
    "other",
]


class WearablePrivacyResponse(BaseModel):
    enabled: bool
    explanation: str


class WearableDeviceCreate(BaseModel):
    provider: WearableProvider = "manual"

    device_name: str = Field(
        min_length=2,
        max_length=120,
    )

    external_device_id: str | None = Field(
        default=None,
        max_length=200,
    )


class WearableDeviceResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID
    user_id: uuid.UUID

    provider: str
    device_name: str
    external_device_id: str | None

    is_connected: bool
    last_synced_at: datetime | None
    created_at: datetime


class HeartRateSampleCreate(BaseModel):
    bpm: int = Field(
        ge=30,
        le=240,
    )

    measured_at: datetime

    device_id: uuid.UUID | None = None

    source: str = Field(
        default="manual",
        max_length=40,
    )


class HeartRateSampleResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID

    device_id: uuid.UUID | None

    bpm: int
    source: str

    measured_at: datetime
    created_at: datetime


class HeartRateBaselineResponse(BaseModel):
    baseline_bpm: float | None

    sample_count: int

    threshold_percentage: float

    ready: bool


class WearableSignalResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID

    signal_type: str
    severity: str

    baseline_bpm: float
    observed_bpm: int

    percentage_above_baseline: float

    created_at: datetime


class WearableAnalysisResponse(BaseModel):
    baseline: HeartRateBaselineResponse

    latest_sample: HeartRateSampleResponse | None

    latest_signal: WearableSignalResponse | None

    possible_elevated_arousal: bool

    explanation: str

    suggestion: str


class WearableDashboardResponse(BaseModel):
    privacy_enabled: bool

    devices: list[
        WearableDeviceResponse
    ]

    recent_samples: list[
        HeartRateSampleResponse
    ]

    recent_signals: list[
        WearableSignalResponse
    ]

    baseline: HeartRateBaselineResponse


class WearableResetResponse(BaseModel):
    message: str
