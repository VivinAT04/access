import uuid

from sqlalchemy import (
    delete,
    select,
)
from sqlalchemy.orm import Session

from app.models.personalisation import (
    PersonalisationEvent,
    PersonalisationPreference,
    PersonalisationRecommendation,
)
from app.models.privacy_preference import (
    PrivacyPreference,
)
from app.personalisation.engine import (
    build_recommendations,
)
from app.personalisation.schemas import (
    PersonalisationPreferenceUpdate,
)


def get_or_create_preferences(
    database: Session,
    user_id: uuid.UUID,
) -> PersonalisationPreference:
    preference = database.scalar(
        select(
            PersonalisationPreference
        ).where(
            PersonalisationPreference.user_id
            == user_id
        )
    )

    if preference is not None:
        return preference

    preference = PersonalisationPreference(
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


def update_preferences(
    database: Session,
    user_id: uuid.UUID,
    payload: PersonalisationPreferenceUpdate,
) -> PersonalisationPreference:
    preference = get_or_create_preferences(
        database=database,
        user_id=user_id,
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

    database.add(
        PersonalisationEvent(
            user_id=user_id,
            event_type="preferences-updated",
            event_value=",".join(
                sorted(
                    changes.keys()
                )
            ),
        )
    )

    database.commit()
    database.refresh(
        preference
    )

    return preference


def adaptive_personalisation_enabled(
    database: Session,
    user_id: uuid.UUID,
) -> bool:
    privacy = database.scalar(
        select(
            PrivacyPreference
        ).where(
            PrivacyPreference.user_id
            == user_id
        )
    )

    if privacy is None:
        return False

    return bool(
        privacy.adaptive_personalisation
    )


def generate_recommendations(
    database: Session,
    user_id: uuid.UUID,
) -> list[
    PersonalisationRecommendation
]:
    preference = get_or_create_preferences(
        database=database,
        user_id=user_id,
    )

    drafts = build_recommendations(
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
    )

    recommendations = [
        PersonalisationRecommendation(
            user_id=user_id,
            recommendation_type=(
                draft.recommendation_type
            ),
            title=draft.title,
            message=draft.message,
            reason=draft.reason,
            action_url=draft.action_url,
        )
        for draft in drafts
    ]

    database.add_all(
        recommendations
    )

    database.add(
        PersonalisationEvent(
            user_id=user_id,
            event_type="recommendations-generated",
            event_value=str(
                len(
                    recommendations
                )
            ),
        )
    )

    database.commit()

    for recommendation in recommendations:
        database.refresh(
            recommendation
        )

    return recommendations


def recommendation_history(
    database: Session,
    user_id: uuid.UUID,
) -> list[
    PersonalisationRecommendation
]:
    statement = (
        select(
            PersonalisationRecommendation
        )
        .where(
            PersonalisationRecommendation.user_id
            == user_id
        )
        .order_by(
            PersonalisationRecommendation.created_at.desc()
        )
        .limit(
            50
        )
    )

    return list(
        database.scalars(
            statement
        )
    )


def set_feedback(
    database: Session,
    user_id: uuid.UUID,
    recommendation_id: uuid.UUID,
    feedback: str,
) -> PersonalisationRecommendation:
    recommendation = database.get(
        PersonalisationRecommendation,
        recommendation_id,
    )

    if (
        recommendation is None
        or recommendation.user_id
        != user_id
    ):
        raise ValueError(
            "Recommendation not found."
        )

    recommendation.feedback = (
        feedback
    )

    database.add(
        recommendation
    )

    database.add(
        PersonalisationEvent(
            user_id=user_id,
            event_type="recommendation-feedback",
            event_value=feedback,
        )
    )

    database.commit()
    database.refresh(
        recommendation
    )

    return recommendation


def reset_personalisation(
    database: Session,
    user_id: uuid.UUID,
) -> None:
    database.execute(
        delete(
            PersonalisationRecommendation
        ).where(
            PersonalisationRecommendation.user_id
            == user_id
        )
    )

    database.execute(
        delete(
            PersonalisationEvent
        ).where(
            PersonalisationEvent.user_id
            == user_id
        )
    )

    database.execute(
        delete(
            PersonalisationPreference
        ).where(
            PersonalisationPreference.user_id
            == user_id
        )
    )

    database.commit()
