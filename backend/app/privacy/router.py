from fastapi import APIRouter

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.privacy.repository import (
    get_or_create_privacy_preferences,
    update_privacy_preferences,
)
from app.privacy.schemas import (
    PrivacyDataCategory,
    PrivacyPreferenceResponse,
    PrivacyPreferenceUpdate,
    PrivacySummaryResponse,
)


router = APIRouter(
    prefix="/privacy",
    tags=["Privacy and data controls"],
)


@router.get(
    "/preferences",
    response_model=PrivacyPreferenceResponse,
)
def read_privacy_preferences(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> PrivacyPreferenceResponse:
    return get_or_create_privacy_preferences(
        database=database,
        user_id=current_user.id,
    )


@router.put(
    "/preferences",
    response_model=PrivacyPreferenceResponse,
)
def change_privacy_preferences(
    update: PrivacyPreferenceUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> PrivacyPreferenceResponse:
    return update_privacy_preferences(
        database=database,
        user_id=current_user.id,
        update=update,
    )


@router.get(
    "/summary",
    response_model=PrivacySummaryResponse,
)
def read_privacy_summary(
    current_user: CurrentUserDependency,
) -> PrivacySummaryResponse:
    del current_user

    return PrivacySummaryResponse(
        categories=[
            PrivacyDataCategory(
                key="account",
                title="Account information",
                description=(
                    "Name, email address and account "
                    "settings required to provide Aksess."
                ),
                purpose=(
                    "Authentication, account management "
                    "and personal settings."
                ),
            ),
            PrivacyDataCategory(
                key="wellbeing",
                title="Wellbeing activity",
                description=(
                    "Mood check-ins, reflections, "
                    "focus sessions and routines."
                ),
                purpose=(
                    "To provide your selected wellbeing "
                    "tools and personal insights."
                ),
            ),
            PrivacyDataCategory(
                key="accessibility",
                title="Accessibility preferences",
                description=(
                    "Display, sensory, language and "
                    "reading preferences."
                ),
                purpose=(
                    "To adapt the interface to your "
                    "chosen accessibility settings."
                ),
            ),
            PrivacyDataCategory(
                key="future_integrations",
                title="Optional advanced features",
                description=(
                    "Voice, wearable and community data "
                    "are only used when you explicitly "
                    "enable those features."
                ),
                purpose=(
                    "To support optional Phase 3 "
                    "functionality."
                ),
            ),
        ],
        storage_statement=(
            "Aksess stores only the information required "
            "for enabled features. Optional advanced "
            "processing is disabled by default."
        ),
        personalisation_statement=(
            "Adaptive personalisation requires explicit "
            "opt-in and can be disabled at any time."
        ),
        sharing_statement=(
            "Research sharing is disabled by default. "
            "Aksess does not treat consent to one feature "
            "as consent to another."
        ),
    )
