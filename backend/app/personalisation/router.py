import uuid

from fastapi import (
    APIRouter,
    HTTPException,
)

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.personalisation.repository import (
    adaptive_personalisation_enabled,
    generate_recommendations,
    get_or_create_preferences,
    recommendation_history,
    reset_personalisation,
    set_feedback,
    update_preferences,
)
from app.personalisation.schemas import (
    PersonalisationHistoryResponse,
    PersonalisationPreferenceResponse,
    PersonalisationPreferenceUpdate,
    PersonalisationProfileResponse,
    PersonalisationRecommendationResponse,
    PersonalisationRecommendationSet,
    PersonalisationResetResponse,
    RecommendationFeedback,
)


router = APIRouter(
    prefix="/personalisation",
    tags=["Personalisation"],
)


@router.get(
    "/profile",
    response_model=PersonalisationProfileResponse,
)
def read_profile(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> PersonalisationProfileResponse:
    preference = get_or_create_preferences(
        database=database,
        user_id=current_user.id,
    )

    enabled = adaptive_personalisation_enabled(
        database=database,
        user_id=current_user.id,
    )

    return PersonalisationProfileResponse(
        adaptive_personalisation_enabled=enabled,
        preferred_focus_minutes=(
            preference.preferred_focus_minutes
        ),
        preferred_support_style=(
            preference.preferred_support_style
        ),
        preferred_energy_level=(
            preference.preferred_energy_level
        ),
        preferred_prompt_style=(
            preference.preferred_prompt_style
        ),
        explanation=(
            "Aksess personalisation uses the preferences "
            "you choose and app activity you provide. "
            "It does not diagnose conditions or infer "
            "mental-health disorders."
        ),
    )


@router.get(
    "/preferences",
    response_model=PersonalisationPreferenceResponse,
)
def read_preferences(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> PersonalisationPreferenceResponse:
    return get_or_create_preferences(
        database=database,
        user_id=current_user.id,
    )


@router.put(
    "/preferences",
    response_model=PersonalisationPreferenceResponse,
)
def change_preferences(
    payload: PersonalisationPreferenceUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> PersonalisationPreferenceResponse:
    return update_preferences(
        database=database,
        user_id=current_user.id,
        payload=payload,
    )


@router.post(
    "/recommendations",
    response_model=PersonalisationRecommendationSet,
)
def create_recommendations(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> PersonalisationRecommendationSet:
    enabled = adaptive_personalisation_enabled(
        database=database,
        user_id=current_user.id,
    )

    if not enabled:
        return PersonalisationRecommendationSet(
            enabled=False,
            explanation=(
                "Adaptive personalisation is currently off. "
                "Enable it in the privacy centre before "
                "generating personalised recommendations."
            ),
            recommendations=[],
        )

    recommendations = generate_recommendations(
        database=database,
        user_id=current_user.id,
    )

    return PersonalisationRecommendationSet(
        enabled=True,
        explanation=(
            "These suggestions are generated from "
            "preferences you selected. They are not "
            "diagnosis, treatment or medical advice."
        ),
        recommendations=[
            PersonalisationRecommendationResponse(
                id=item.id,
                recommendation_type=(
                    item.recommendation_type
                ),
                title=item.title,
                message=item.message,
                reason=item.reason,
                action_url=item.action_url,
                feedback=item.feedback,
                created_at=item.created_at,
            )
            for item in recommendations
        ],
    )


@router.get(
    "/history",
    response_model=PersonalisationHistoryResponse,
)
def read_history(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> PersonalisationHistoryResponse:
    return PersonalisationHistoryResponse(
        recommendations=(
            recommendation_history(
                database=database,
                user_id=current_user.id,
            )
        )
    )


@router.patch(
    "/recommendations/{recommendation_id}/feedback",
    response_model=PersonalisationRecommendationResponse,
)
def update_feedback(
    recommendation_id: uuid.UUID,
    payload: RecommendationFeedback,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> PersonalisationRecommendationResponse:
    try:
        return set_feedback(
            database=database,
            user_id=current_user.id,
            recommendation_id=recommendation_id,
            feedback=payload.feedback,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.delete(
    "/reset",
    response_model=PersonalisationResetResponse,
)
def reset(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> PersonalisationResetResponse:
    reset_personalisation(
        database=database,
        user_id=current_user.id,
    )

    return PersonalisationResetResponse(
        message=(
            "Personalisation history and preferences "
            "were deleted."
        )
    )
