import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.privacy_preference import (
    PrivacyPreference,
)
from app.models.voice_preference import (
    VoicePreference,
)
from app.voice.schemas import (
    VoicePreferenceUpdate,
)


def get_or_create_voice_preferences(
    database: Session,
    user_id: uuid.UUID,
) -> VoicePreference:
    preference = database.scalar(
        select(
            VoicePreference
        ).where(
            VoicePreference.user_id
            == user_id
        )
    )

    if preference is not None:
        return preference

    preference = VoicePreference(
        user_id=user_id,
    )

    database.add(
        preference
    )

    database.commit()

    database.refresh(
        preference
    )

    return preference


def update_voice_preferences(
    database: Session,
    user_id: uuid.UUID,
    payload: VoicePreferenceUpdate,
) -> VoicePreference:
    preference = (
        get_or_create_voice_preferences(
            database=database,
            user_id=user_id,
        )
    )

    changes = payload.model_dump(
        exclude_unset=True,
    )

    for key, value in changes.items():
        setattr(
            preference,
            key,
            value,
        )

    database.add(
        preference
    )

    database.commit()

    database.refresh(
        preference
    )

    return preference


def voice_processing_enabled(
    database: Session,
    user_id: uuid.UUID,
) -> bool:
    preference = database.scalar(
        select(
            PrivacyPreference
        ).where(
            PrivacyPreference.user_id
            == user_id
        )
    )

    if preference is None:
        return False

    return bool(
        preference.voice_processing_enabled
    )


def voice_guides() -> list[
    dict[str, str]
]:
    return [
        {
            "id":
                "calm-breathing",

            "title":
                "Gentle breathing",

            "category":
                "calm",

            "text":
                (
                    "Find a comfortable position. "
                    "Let your shoulders soften. "
                    "Breathe in slowly for four seconds. "
                    "Hold gently for two seconds. "
                    "Breathe out slowly for six seconds. "
                    "There is nothing else you need to do right now. "
                    "Repeat at a pace that feels comfortable."
                ),
        },

        {
            "id":
                "five-senses",

            "title":
                "Five senses grounding",

            "category":
                "grounding",

            "text":
                (
                    "Notice five things you can see. "
                    "Notice four things you can feel. "
                    "Notice three things you can hear. "
                    "Notice two things you can smell. "
                    "Notice one thing you can taste, "
                    "or one thing you appreciate in this moment."
                ),
        },

        {
            "id":
                "focus-start",

            "title":
                "Start a focus session",

            "category":
                "focus",

            "text":
                (
                    "Choose one small outcome. "
                    "You do not need to complete everything. "
                    "Remove one distraction if you can. "
                    "Start with the next manageable step. "
                    "Short focus sessions still count."
                ),
        },

        {
            "id":
                "focus-break",

            "title":
                "Focus break",

            "category":
                "focus",

            "text":
                (
                    "Your focus session is complete. "
                    "Look away from the screen. "
                    "Relax your shoulders. "
                    "Take a drink of water if one is nearby. "
                    "You can return when you feel ready."
                ),
        },

        {
            "id":
                "evening-wind-down",

            "title":
                "Evening wind-down",

            "category":
                "routine",

            "text":
                (
                    "The day does not need to be perfectly complete. "
                    "Notice one thing you finished. "
                    "Write down anything you want to remember tomorrow. "
                    "Reduce stimulation where possible. "
                    "Give yourself permission to stop."
                ),
        },

        {
            "id":
                "gentle-motivation",

            "title":
                "Gentle encouragement",

            "category":
                "companion",

            "text":
                (
                    "You only need to begin with one small action. "
                    "Progress does not need to be fast. "
                    "Take your time and continue when you are ready."
                ),
        },
    ]
