from fastapi import APIRouter

from app.accessibility.repository import (
    get_or_create_preferences,
    update_preferences,
)
from app.accessibility.schemas import (
    AccessibilityPreferenceResponse,
    AccessibilityPreferenceUpdate,
)
from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)


router = APIRouter(
    prefix="/accessibility",
    tags=["Accessibility"],
)


@router.get(
    "/preferences",
    response_model=AccessibilityPreferenceResponse,
)
def read_accessibility_preferences(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> AccessibilityPreferenceResponse:
    preferences = get_or_create_preferences(
        database,
        current_user.id,
    )

    return AccessibilityPreferenceResponse.model_validate(
        preferences
    )


@router.put(
    "/preferences",
    response_model=AccessibilityPreferenceResponse,
)
def replace_accessibility_preferences(
    payload: AccessibilityPreferenceUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> AccessibilityPreferenceResponse:
    preferences = get_or_create_preferences(
        database,
        current_user.id,
    )

    values = payload.model_dump(
        exclude_none=True,
    )

    updated_preferences = update_preferences(
        database,
        preferences,
        values,
    )

    return AccessibilityPreferenceResponse.model_validate(
        updated_preferences
    )
