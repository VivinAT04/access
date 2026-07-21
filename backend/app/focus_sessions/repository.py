import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.focus_sessions.schemas import (
    FocusSessionCreate,
)
from app.models.focus_session import FocusSession
from app.models.task import Task


def create_focus_session(
    database: Session,
    user_id: uuid.UUID,
    payload: FocusSessionCreate,
) -> FocusSession:
    session = FocusSession(
        user_id=user_id,
        task_id=payload.task_id,
        intention=payload.intention,
        notes=payload.notes,
        planned_minutes=payload.planned_minutes,
        completed_minutes=payload.completed_minutes,
        status=payload.status,
        started_at=payload.started_at,
        completed_at=payload.completed_at,
    )

    database.add(session)
    database.commit()
    database.refresh(session)

    return session


def list_focus_sessions(
    database: Session,
    user_id: uuid.UUID,
    limit: int = 20,
) -> list[FocusSession]:
    statement = (
        select(FocusSession)
        .where(
            FocusSession.user_id == user_id
        )
        .order_by(
            FocusSession.created_at.desc()
        )
        .limit(limit)
    )

    return list(
        database.scalars(statement).all()
    )


def get_focus_session(
    database: Session,
    user_id: uuid.UUID,
    session_id: uuid.UUID,
) -> FocusSession | None:
    statement = select(
        FocusSession
    ).where(
        FocusSession.id == session_id,
        FocusSession.user_id == user_id,
    )

    return database.scalar(statement)


def delete_focus_session(
    database: Session,
    session: FocusSession,
) -> None:
    database.delete(session)
    database.commit()


def task_belongs_to_user(
    database: Session,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
) -> bool:
    statement = select(Task.id).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )

    return database.scalar(statement) is not None


def get_focus_summary(
    database: Session,
    user_id: uuid.UUID,
) -> dict[str, int]:
    now = datetime.now(timezone.utc)

    start_of_day = now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    sessions_today = database.scalar(
        select(
            func.count(FocusSession.id)
        ).where(
            FocusSession.user_id == user_id,
            FocusSession.status == "completed",
            FocusSession.completed_at.is_not(None),
            FocusSession.completed_at >= start_of_day,
        )
    ) or 0

    minutes_today = database.scalar(
        select(
            func.coalesce(
                func.sum(
                    FocusSession.completed_minutes
                ),
                0,
            )
        ).where(
            FocusSession.user_id == user_id,
            FocusSession.status == "completed",
            FocusSession.completed_at.is_not(None),
            FocusSession.completed_at >= start_of_day,
        )
    ) or 0

    completed_sessions = database.scalar(
        select(
            func.count(FocusSession.id)
        ).where(
            FocusSession.user_id == user_id,
            FocusSession.status == "completed",
        )
    ) or 0

    total_minutes = database.scalar(
        select(
            func.coalesce(
                func.sum(
                    FocusSession.completed_minutes
                ),
                0,
            )
        ).where(
            FocusSession.user_id == user_id,
            FocusSession.status == "completed",
        )
    ) or 0

    return {
        "sessions_today": int(
            sessions_today
        ),
        "minutes_today": int(
            minutes_today
        ),
        "completed_sessions": int(
            completed_sessions
        ),
        "total_minutes": int(
            total_minutes
        ),
    }
