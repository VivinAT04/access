from fastapi import APIRouter

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.voice.repository import (
    get_or_create_voice_preferences,
    update_voice_preferences,
    voice_guides,
    voice_processing_enabled,
)
from app.voice.schemas import (
    VoiceGuide,
    VoiceGuidesResponse,
    VoicePreferenceResponse,
    VoicePreferenceUpdate,
    VoicePrivacyResponse,
)


router = APIRouter(
    prefix="/voice",
    tags=["Voice"],
)


@router.get(
    "/privacy",
    response_model=VoicePrivacyResponse,
)
def privacy_status(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> VoicePrivacyResponse:
    enabled = voice_processing_enabled(
        database=database,
        user_id=current_user.id,
    )

    return VoicePrivacyResponse(
        enabled=enabled,
        explanation=(
            "Voice guidance uses browser speech synthesis. "
            "Aksess does not need to upload spoken audio "
            "for read-aloud guidance."
        ),
    )


@router.get(
    "/preferences",
    response_model=VoicePreferenceResponse,
)
def read_preferences(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> VoicePreferenceResponse:
    return get_or_create_voice_preferences(
        database=database,
        user_id=current_user.id,
    )


@router.put(
    "/preferences",
    response_model=VoicePreferenceResponse,
)
def change_preferences(
    payload: VoicePreferenceUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> VoicePreferenceResponse:
    return update_voice_preferences(
        database=database,
        user_id=current_user.id,
        payload=payload,
    )


@router.get(
    "/guides",
    response_model=VoiceGuidesResponse,
)
def read_guides(
    current_user: CurrentUserDependency,
) -> VoiceGuidesResponse:
    del current_user

    return VoiceGuidesResponse(
        guides=[
            VoiceGuide(
                **guide
            )
            for guide in voice_guides()
        ]
    )
