import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PrivacyPreferenceUpdate(BaseModel):
    adaptive_personalisation: bool | None = None

    wellbeing_analytics: bool | None = None

    community_profile_visible: bool | None = None

    wearable_data_enabled: bool | None = None

    voice_processing_enabled: bool | None = None

    research_data_sharing: bool | None = None


class PrivacyPreferenceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID

    adaptive_personalisation: bool

    wellbeing_analytics: bool

    community_profile_visible: bool

    wearable_data_enabled: bool

    voice_processing_enabled: bool

    research_data_sharing: bool

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class PrivacyDataCategory(BaseModel):
    key: str
    title: str
    description: str
    purpose: str


class PrivacySummaryResponse(BaseModel):
    categories: list[PrivacyDataCategory]
    storage_statement: str
    personalisation_statement: str
    sharing_statement: str
