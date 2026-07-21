import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.accessibility_preference import (
    AccessibilityPreference,
)


def get_preferences_by_user_id(
    database: Session,
    user_id: uuid.UUID,
) -> AccessibilityPreference | None:
    statement = select(AccessibilityPreference).where(
        AccessibilityPreference.user_id == user_id
    )

    return database.scalar(statement)


def create_default_preferences(
    database: Session,
    user_id: uuid.UUID,
) -> AccessibilityPreference:
    preferences = AccessibilityPreference(
        user_id=user_id,
    )

    database.add(preferences)
    database.commit()
    database.refresh(preferences)

    return preferences


def get_or_create_preferences(
    database: Session,
    user_id: uuid.UUID,
) -> AccessibilityPreference:
    preferences = get_preferences_by_user_id(
        database,
        user_id,
    )

    if preferences is not None:
        return preferences

    return create_default_preferences(
        database,
        user_id,
    )


def update_preferences(
    database: Session,
    preferences: AccessibilityPreference,
    values: dict[str, object],
) -> AccessibilityPreference:
    for field, value in values.items():
        setattr(preferences, field, value)

    database.add(preferences)
    database.commit()
    database.refresh(preferences)

    return preferences
