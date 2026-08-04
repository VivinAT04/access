import uuid
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.reflection import Reflection
from app.reflections.schemas import (
    ReflectionCreate,
    ReflectionUpdate,
)


def create_reflection(
    database: Session,
    user_id: uuid.UUID,
    payload: ReflectionCreate,
) -> Reflection:
    reflection = Reflection(
        user_id=user_id,
        reflection_date=payload.reflection_date,
        good_thing=payload.good_thing,
        challenge=payload.challenge,
        accomplishment=payload.accomplishment,
        note=payload.note,
    )

    database.add(reflection)
    database.commit()
    database.refresh(reflection)

    return reflection


def list_reflections(
    database: Session,
    user_id: uuid.UUID,
    limit: int = 30,
) -> list[Reflection]:
    statement = (
        select(Reflection)
        .where(
            Reflection.user_id == user_id
        )
        .order_by(
            Reflection.reflection_date.desc(),
            Reflection.created_at.desc(),
        )
        .limit(limit)
    )

    return list(
        database.scalars(statement).all()
    )


def get_reflection_by_id(
    database: Session,
    user_id: uuid.UUID,
    reflection_id: uuid.UUID,
) -> Reflection | None:
    statement = select(
        Reflection
    ).where(
        Reflection.id == reflection_id,
        Reflection.user_id == user_id,
    )

    return database.scalar(statement)


def get_reflection_by_date(
    database: Session,
    user_id: uuid.UUID,
    reflection_date: date,
) -> Reflection | None:
    statement = select(
        Reflection
    ).where(
        Reflection.user_id == user_id,
        Reflection.reflection_date
        == reflection_date,
    )

    return database.scalar(statement)


def update_reflection(
    database: Session,
    reflection: Reflection,
    payload: ReflectionUpdate,
) -> Reflection:
    reflection.good_thing = (
        payload.good_thing
    )

    reflection.challenge = (
        payload.challenge
    )

    reflection.accomplishment = (
        payload.accomplishment
    )

    reflection.note = payload.note

    database.add(reflection)
    database.commit()
    database.refresh(reflection)

    return reflection


def delete_reflection(
    database: Session,
    reflection: Reflection,
) -> None:
    database.delete(reflection)
    database.commit()


def get_reflection_summary(
    database: Session,
    user_id: uuid.UUID,
    today: date,
) -> dict[str, int | bool]:
    total_reflections = database.scalar(
        select(
            func.count(Reflection.id)
        ).where(
            Reflection.user_id == user_id
        )
    ) or 0

    reflected_today = (
        get_reflection_by_date(
            database=database,
            user_id=user_id,
            reflection_date=today,
        )
        is not None
    )

    dates_statement = (
        select(
            Reflection.reflection_date
        )
        .where(
            Reflection.user_id == user_id
        )
        .order_by(
            Reflection.reflection_date.desc()
        )
    )

    reflection_dates = list(
        database.scalars(
            dates_statement
        ).all()
    )

    current_streak = 0
    expected_date = today

    if (
        reflection_dates
        and reflection_dates[0]
        == today - timedelta(days=1)
    ):
        expected_date = (
            today - timedelta(days=1)
        )

    for reflection_date in reflection_dates:
        if reflection_date != expected_date:
            if reflection_date < expected_date:
                break

            continue

        current_streak += 1

        expected_date -= timedelta(
            days=1
        )

    return {
        "total_reflections": int(
            total_reflections
        ),
        "reflected_today": (
            reflected_today
        ),
        "current_streak": (
            current_streak
        ),
    }
