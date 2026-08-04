import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    desc,
    func,
    select,
)
from sqlalchemy.orm import Session

from app.anxiety_sessions.schemas import (
    AnxietySessionCreate,
)
from app.models.anxiety_session import (
    AnxietySession,
)


def create_anxiety_session(
    database: Session,
    user_id: uuid.UUID,
    payload: AnxietySessionCreate,
) -> AnxietySession:
    session = AnxietySession(
        user_id=user_id,
        exercise_type=payload.exercise_type,
        duration_seconds=payload.duration_seconds,
        completed=payload.completed,
    )

    database.add(session)
    database.commit()
    database.refresh(session)

    return session


def list_anxiety_sessions(
    database: Session,
    user_id: uuid.UUID,
    limit: int = 30,
) -> list[AnxietySession]:
    statement = (
        select(AnxietySession)
        .where(
            AnxietySession.user_id == user_id
        )
        .order_by(
            AnxietySession.created_at.desc()
        )
        .limit(limit)
    )

    return list(
        database.scalars(statement).all()
    )


def get_anxiety_session(
    database: Session,
    user_id: uuid.UUID,
    session_id: uuid.UUID,
) -> AnxietySession | None:
    statement = select(
        AnxietySession
    ).where(
        AnxietySession.id == session_id,
        AnxietySession.user_id == user_id,
    )

    return database.scalar(statement)


def delete_anxiety_session(
    database: Session,
    session: AnxietySession,
) -> None:
    database.delete(session)
    database.commit()


def get_anxiety_summary(
    database: Session,
    user_id: uuid.UUID,
) -> dict[str, int | str | None]:
    now = datetime.now(timezone.utc)

    start_of_day = now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    sessions_today = database.scalar(
        select(
            func.count(AnxietySession.id)
        ).where(
            AnxietySession.user_id == user_id,
            AnxietySession.completed.is_(True),
            AnxietySession.created_at >= start_of_day,
        )
    ) or 0

    seconds_today = database.scalar(
        select(
            func.coalesce(
                func.sum(
                    AnxietySession.duration_seconds
                ),
                0,
            )
        ).where(
            AnxietySession.user_id == user_id,
            AnxietySession.completed.is_(True),
            AnxietySession.created_at >= start_of_day,
        )
    ) or 0

    total_sessions = database.scalar(
        select(
            func.count(AnxietySession.id)
        ).where(
            AnxietySession.user_id == user_id,
            AnxietySession.completed.is_(True),
        )
    ) or 0

    total_seconds = database.scalar(
        select(
            func.coalesce(
                func.sum(
                    AnxietySession.duration_seconds
                ),
                0,
            )
        ).where(
            AnxietySession.user_id == user_id,
            AnxietySession.completed.is_(True),
        )
    ) or 0

    favourite_statement = (
        select(
            AnxietySession.exercise_type,
            func.count(
                AnxietySession.id
            ).label("exercise_count"),
        )
        .where(
            AnxietySession.user_id == user_id,
            AnxietySession.completed.is_(True),
        )
        .group_by(
            AnxietySession.exercise_type
        )
        .order_by(
            desc("exercise_count")
        )
        .limit(1)
    )

    favourite_row = database.execute(
        favourite_statement
    ).first()

    favourite_exercise = (
        favourite_row[0]
        if favourite_row
        else None
    )

    return {
        "sessions_today": int(
            sessions_today
        ),
        "minutes_today": int(
            round(
                int(seconds_today) / 60
            )
        ),
        "total_sessions": int(
            total_sessions
        ),
        "total_minutes": int(
            round(
                int(total_seconds) / 60
            )
        ),
        "favourite_exercise": (
            favourite_exercise
        ),
    }
