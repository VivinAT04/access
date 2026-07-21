import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.mood_checkin import MoodCheckin
from app.mood_checkins.schemas import MoodCheckinCreate


def serialize_emotions(
    emotions: list[str],
) -> str:
    return "|".join(emotions)


def deserialize_emotions(
    emotions: str,
) -> list[str]:
    if not emotions:
        return []

    return [
        value
        for value in emotions.split("|")
        if value
    ]


def create_mood_checkin(
    database: Session,
    user_id: uuid.UUID,
    payload: MoodCheckinCreate,
) -> MoodCheckin:
    checkin = MoodCheckin(
        user_id=user_id,
        mood_score=payload.mood_score,
        energy_level=payload.energy_level,
        stress_level=payload.stress_level,
        emotions=serialize_emotions(
            payload.emotions
        ),
        note=payload.note,
    )

    database.add(checkin)
    database.commit()
    database.refresh(checkin)

    return checkin


def list_mood_checkins(
    database: Session,
    user_id: uuid.UUID,
    limit: int = 30,
) -> list[MoodCheckin]:
    statement = (
        select(MoodCheckin)
        .where(
            MoodCheckin.user_id == user_id
        )
        .order_by(
            MoodCheckin.created_at.desc()
        )
        .limit(limit)
    )

    return list(
        database.scalars(statement).all()
    )


def get_mood_checkin(
    database: Session,
    user_id: uuid.UUID,
    checkin_id: uuid.UUID,
) -> MoodCheckin | None:
    statement = select(
        MoodCheckin
    ).where(
        MoodCheckin.id == checkin_id,
        MoodCheckin.user_id == user_id,
    )

    return database.scalar(statement)


def delete_mood_checkin(
    database: Session,
    checkin: MoodCheckin,
) -> None:
    database.delete(checkin)
    database.commit()


def get_mood_summary(
    database: Session,
    user_id: uuid.UUID,
) -> dict[str, float | int]:
    now = datetime.now(timezone.utc)

    start_of_day = now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    entries_today = database.scalar(
        select(
            func.count(MoodCheckin.id)
        ).where(
            MoodCheckin.user_id == user_id,
            MoodCheckin.created_at >= start_of_day,
        )
    ) or 0

    total_entries = database.scalar(
        select(
            func.count(MoodCheckin.id)
        ).where(
            MoodCheckin.user_id == user_id
        )
    ) or 0

    average_mood = database.scalar(
        select(
            func.avg(MoodCheckin.mood_score)
        ).where(
            MoodCheckin.user_id == user_id
        )
    ) or 0

    average_energy = database.scalar(
        select(
            func.avg(MoodCheckin.energy_level)
        ).where(
            MoodCheckin.user_id == user_id
        )
    ) or 0

    average_stress = database.scalar(
        select(
            func.avg(MoodCheckin.stress_level)
        ).where(
            MoodCheckin.user_id == user_id
        )
    ) or 0

    return {
        "entries_today": int(entries_today),
        "total_entries": int(total_entries),
        "average_mood": round(
            float(average_mood),
            1,
        ),
        "average_energy": round(
            float(average_energy),
            1,
        ),
        "average_stress": round(
            float(average_stress),
            1,
        ),
    }
