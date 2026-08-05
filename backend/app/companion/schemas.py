import uuid
from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


CompanionType = Literal[
    "sprout",
    "owl",
    "cloud",
    "fox",
]


class CompanionProfileUpdate(BaseModel):
    companion_type: CompanionType | None = None

    companion_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=80,
    )

    @model_validator(mode="after")
    def clean_name(
        self,
    ) -> "CompanionProfileUpdate":
        if self.companion_name is not None:
            self.companion_name = (
                self.companion_name.strip()
            )

            if not self.companion_name:
                raise ValueError(
                    "Companion name cannot be empty."
                )

        return self


class CompanionProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    companion_type: CompanionType
    companion_name: str
    total_xp: int
    current_level: int
    completed_sessions: int
    total_focus_minutes: int
    xp_for_current_level: int
    xp_for_next_level: int
    level_progress_percentage: int
    break_recommendation: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class CompanionRewardRequest(BaseModel):
    focus_session_id: uuid.UUID


class CompanionRewardResponse(BaseModel):
    already_awarded: bool
    xp_awarded: int
    focus_minutes: int
    message: str
    profile: CompanionProfileResponse


class CompanionRewardHistoryItem(BaseModel):
    id: uuid.UUID
    focus_session_id: uuid.UUID
    xp_awarded: int
    focus_minutes: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )
