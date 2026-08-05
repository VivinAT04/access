from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    status,
)

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.companion.repository import (
    award_focus_session,
    get_or_create_profile,
    list_rewards,
    profile_to_dict,
    update_profile,
)
from app.companion.schemas import (
    CompanionProfileResponse,
    CompanionProfileUpdate,
    CompanionRewardHistoryItem,
    CompanionRewardRequest,
    CompanionRewardResponse,
)


router = APIRouter(
    prefix="/companion",
    tags=["Body-doubling companion"],
)


@router.get(
    "/profile",
    response_model=CompanionProfileResponse,
)
def read_companion_profile(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> CompanionProfileResponse:
    profile = get_or_create_profile(
        database=database,
        user_id=current_user.id,
    )

    return CompanionProfileResponse(
        **profile_to_dict(profile)
    )


@router.put(
    "/profile",
    response_model=CompanionProfileResponse,
)
def edit_companion_profile(
    payload: CompanionProfileUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> CompanionProfileResponse:
    profile = get_or_create_profile(
        database=database,
        user_id=current_user.id,
    )

    profile = update_profile(
        database=database,
        profile=profile,
        payload=payload,
    )

    return CompanionProfileResponse(
        **profile_to_dict(profile)
    )


@router.post(
    "/reward",
    response_model=CompanionRewardResponse,
)
def reward_completed_focus_session(
    payload: CompanionRewardRequest,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> CompanionRewardResponse:
    try:
        profile, reward, already_awarded = (
            award_focus_session(
                database=database,
                user_id=current_user.id,
                focus_session_id=(
                    payload.focus_session_id
                ),
            )
        )
    except LookupError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    xp_awarded = (
        reward.xp_awarded
        if reward is not None
        else 0
    )

    focus_minutes = (
        reward.focus_minutes
        if reward is not None
        else 0
    )

    message = (
        "This session was already counted. "
        "Your progress remains safe."
        if already_awarded
        else (
            f"You and your companion completed "
            f"{focus_minutes} focused minutes."
        )
    )

    return CompanionRewardResponse(
        already_awarded=already_awarded,
        xp_awarded=xp_awarded,
        focus_minutes=focus_minutes,
        message=message,
        profile=CompanionProfileResponse(
            **profile_to_dict(profile)
        ),
    )


@router.get(
    "/rewards",
    response_model=list[
        CompanionRewardHistoryItem
    ],
)
def read_companion_rewards(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    limit: int = Query(
        default=30,
        ge=1,
        le=100,
    ),
) -> list[
    CompanionRewardHistoryItem
]:
    return [
        CompanionRewardHistoryItem
        .model_validate(reward)
        for reward in list_rewards(
            database=database,
            user_id=current_user.id,
            limit=limit,
        )
    ]
