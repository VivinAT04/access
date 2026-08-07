import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.privacy_preference import (
    PrivacyPreference,
)
from app.privacy.schemas import (
    PrivacyPreferenceUpdate,
)


def get_or_create_privacy_preferences(
    database: Session,
    user_id: uuid.UUID,
) -> PrivacyPreference:
    statement = select(
        PrivacyPreference
    ).where(
        PrivacyPreference.user_id
        == user_id
    )

    preference = database.scalar(
        statement
    )

    if preference is not None:
        return preference

    preference = PrivacyPreference(
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


def update_privacy_preferences(
    database: Session,
    user_id: uuid.UUID,
    update: PrivacyPreferenceUpdate,
) -> PrivacyPreference:
    preference = (
        get_or_create_privacy_preferences(
            database=database,
            user_id=user_id,
        )
    )

    changes = (
        update.model_dump(
            exclude_unset=True,
        )
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
