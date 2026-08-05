import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.companion.schemas import (
    CompanionProfileUpdate,
)
from app.models.companion import (
    CompanionProfile,
    CompanionReward,
)
from app.models.focus_session import FocusSession


LEVEL_THRESHOLDS = [
    0,
    100,
    250,
    450,
    700,
    1000,
    1400,
    1900,
    2500,
    3200,
]


def calculate_level(
    total_xp: int,
) -> int:
    level = 1

    for index, threshold in enumerate(
        LEVEL_THRESHOLDS,
        start=1,
    ):
        if total_xp >= threshold:
            level = index
        else:
            break

    if total_xp >= LEVEL_THRESHOLDS[-1]:
        extra_xp = (
            total_xp
            - LEVEL_THRESHOLDS[-1]
        )

        level += extra_xp // 1000

    return int(level)


def level_bounds(
    total_xp: int,
) -> tuple[int, int]:
    current_level = calculate_level(
        total_xp
    )

    if current_level < len(
        LEVEL_THRESHOLDS
    ):
        lower = LEVEL_THRESHOLDS[
            current_level - 1
        ]

        upper = LEVEL_THRESHOLDS[
            current_level
        ]

        return lower, upper

    lower = (
        LEVEL_THRESHOLDS[-1]
        + (
            current_level
            - len(LEVEL_THRESHOLDS)
        )
        * 1000
    )

    return lower, lower + 1000


def break_recommendation(
    total_focus_minutes: int,
) -> str:
    if total_focus_minutes == 0:
        return (
            "Begin with a small focus session. "
            "There is no minimum you need to reach."
        )

    if total_focus_minutes < 25:
        return (
            "A short stretch or drink of water "
            "may help before your next session."
        )

    if total_focus_minutes < 90:
        return (
            "You have done meaningful focused work. "
            "Consider a five-minute sensory break."
        )

    return (
        "You have focused for a while. Consider a longer "
        "break away from the screen before continuing."
    )


def get_profile(
    database: Session,
    user_id: uuid.UUID,
) -> CompanionProfile | None:
    return database.scalar(
        select(
            CompanionProfile
        ).where(
            CompanionProfile.user_id
            == user_id
        )
    )


def get_or_create_profile(
    database: Session,
    user_id: uuid.UUID,
) -> CompanionProfile:
    profile = get_profile(
        database=database,
        user_id=user_id,
    )

    if profile is not None:
        return profile

    profile = CompanionProfile(
        user_id=user_id,
        companion_type="sprout",
        companion_name="Moss",
        total_xp=0,
        current_level=1,
        completed_sessions=0,
        total_focus_minutes=0,
    )

    database.add(profile)
    database.commit()
    database.refresh(profile)

    return profile


def update_profile(
    database: Session,
    profile: CompanionProfile,
    payload: CompanionProfileUpdate,
) -> CompanionProfile:
    values = payload.model_dump(
        exclude_unset=True,
    )

    for key, value in values.items():
        setattr(
            profile,
            key,
            value,
        )

    database.add(profile)
    database.commit()
    database.refresh(profile)

    return profile


def profile_to_dict(
    profile: CompanionProfile,
) -> dict[str, object]:
    lower, upper = level_bounds(
        profile.total_xp
    )

    level_range = max(
        upper - lower,
        1,
    )

    level_progress = round(
        (
            profile.total_xp
            - lower
        )
        / level_range
        * 100
    )

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "companion_type": (
            profile.companion_type
        ),
        "companion_name": (
            profile.companion_name
        ),
        "total_xp": profile.total_xp,
        "current_level": (
            profile.current_level
        ),
        "completed_sessions": (
            profile.completed_sessions
        ),
        "total_focus_minutes": (
            profile.total_focus_minutes
        ),
        "xp_for_current_level": lower,
        "xp_for_next_level": upper,
        "level_progress_percentage": max(
            0,
            min(100, level_progress),
        ),
        "break_recommendation": (
            break_recommendation(
                profile.total_focus_minutes
            )
        ),
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }


def get_focus_session_for_user(
    database: Session,
    user_id: uuid.UUID,
    focus_session_id: uuid.UUID,
) -> FocusSession | None:
    return database.scalar(
        select(
            FocusSession
        ).where(
            FocusSession.id
            == focus_session_id,
            FocusSession.user_id
            == user_id,
        )
    )


def get_reward_for_session(
    database: Session,
    focus_session_id: uuid.UUID,
) -> CompanionReward | None:
    return database.scalar(
        select(
            CompanionReward
        ).where(
            CompanionReward.focus_session_id
            == focus_session_id
        )
    )


def award_focus_session(
    database: Session,
    user_id: uuid.UUID,
    focus_session_id: uuid.UUID,
) -> tuple[
    CompanionProfile,
    CompanionReward | None,
    bool,
]:
    profile = get_or_create_profile(
        database=database,
        user_id=user_id,
    )

    existing_reward = (
        get_reward_for_session(
            database=database,
            focus_session_id=focus_session_id,
        )
    )

    if existing_reward is not None:
        return (
            profile,
            existing_reward,
            True,
        )

    focus_session = (
        get_focus_session_for_user(
            database=database,
            user_id=user_id,
            focus_session_id=focus_session_id,
        )
    )

    if focus_session is None:
        raise LookupError(
            "Focus session not found."
        )

    if (
        focus_session.status
        != "completed"
    ):
        raise ValueError(
            "Only completed focus sessions can earn XP."
        )

    completed_minutes = max(
        0,
        int(
            focus_session.completed_minutes
        ),
    )

    xp_awarded = completed_minutes

    reward = CompanionReward(
        user_id=user_id,
        companion_profile_id=profile.id,
        focus_session_id=focus_session.id,
        xp_awarded=xp_awarded,
        focus_minutes=completed_minutes,
    )

    profile.total_xp += xp_awarded
    profile.total_focus_minutes += (
        completed_minutes
    )
    profile.completed_sessions += 1
    profile.current_level = (
        calculate_level(
            profile.total_xp
        )
    )

    database.add(reward)
    database.add(profile)
    database.commit()
    database.refresh(reward)
    database.refresh(profile)

    return profile, reward, False


def list_rewards(
    database: Session,
    user_id: uuid.UUID,
    limit: int = 30,
) -> list[CompanionReward]:
    return list(
        database.scalars(
            select(
                CompanionReward
            )
            .where(
                CompanionReward.user_id
                == user_id
            )
            .order_by(
                CompanionReward.created_at
                .desc()
            )
            .limit(limit)
        ).all()
    )
