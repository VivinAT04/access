import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.language_preferences.schemas import (
    LanguagePreferenceUpdate,
)
from app.models.language_preference import (
    LanguagePreference,
)


def get_preference(
    database: Session,
    user_id: uuid.UUID,
) -> LanguagePreference | None:
    return database.scalar(
        select(
            LanguagePreference
        ).where(
            LanguagePreference.user_id
            == user_id
        )
    )


def get_or_create_preference(
    database: Session,
    user_id: uuid.UUID,
) -> LanguagePreference:
    preference = get_preference(
        database=database,
        user_id=user_id,
    )

    if preference is not None:
        return preference

    preference = LanguagePreference(
        user_id=user_id,
        locale="en-GB",
        direction="auto",
        letter_spacing="normal",
        dyslexia_friendly=False,
        reading_guide=False,
    )

    database.add(preference)
    database.commit()
    database.refresh(preference)

    return preference


def update_preference(
    database: Session,
    preference: LanguagePreference,
    payload: LanguagePreferenceUpdate,
) -> LanguagePreference:
    values = payload.model_dump(
        exclude_unset=True,
    )

    for key, value in values.items():
        setattr(
            preference,
            key,
            value,
        )

    database.add(preference)
    database.commit()
    database.refresh(preference)

    return preference
