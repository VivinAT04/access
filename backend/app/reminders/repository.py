import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.reminder import Reminder
from app.models.routine import Routine
from app.models.task import Task
from app.reminders.schemas import (
    ReminderCreate,
    ReminderUpdate,
)


def get_task(
    database: Session,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
) -> Task | None:
    return database.scalar(
        select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id,
        )
    )


def get_routine(
    database: Session,
    user_id: uuid.UUID,
    routine_id: uuid.UUID,
) -> Routine | None:
    return database.scalar(
        select(Routine).where(
            Routine.id == routine_id,
            Routine.user_id == user_id,
        )
    )


def get_reminder(
    database: Session,
    user_id: uuid.UUID,
    reminder_id: uuid.UUID,
) -> Reminder | None:
    return database.scalar(
        select(Reminder).where(
            Reminder.id == reminder_id,
            Reminder.user_id == user_id,
        )
    )


def create_reminder(
    database: Session,
    user_id: uuid.UUID,
    payload: ReminderCreate,
) -> Reminder:
    reminder = Reminder(
        user_id=user_id,
        task_id=payload.task_id,
        routine_id=payload.routine_id,
        title=payload.title,
        message=payload.message,
        remind_at=payload.remind_at,
        is_enabled=payload.is_enabled,
        is_dismissed=False,
    )

    database.add(reminder)
    database.commit()
    database.refresh(reminder)

    return reminder


def update_reminder(
    database: Session,
    reminder: Reminder,
    payload: ReminderUpdate,
) -> Reminder:
    values = payload.model_dump(
        exclude_unset=True,
    )

    for key, value in values.items():
        setattr(
            reminder,
            key,
            value,
        )

    if (
        "remind_at" in values
        or values.get("is_enabled") is True
    ):
        reminder.is_dismissed = False
        reminder.notified_at = None

    database.add(reminder)
    database.commit()
    database.refresh(reminder)

    return reminder


def list_reminders(
    database: Session,
    user_id: uuid.UUID,
    include_dismissed: bool = False,
) -> list[Reminder]:
    statement = select(
        Reminder
    ).where(
        Reminder.user_id == user_id
    )

    if not include_dismissed:
        statement = statement.where(
            Reminder.is_dismissed.is_(
                False
            )
        )

    statement = statement.order_by(
        Reminder.remind_at.asc()
    )

    return list(
        database.scalars(
            statement
        ).all()
    )


def delete_reminder(
    database: Session,
    reminder: Reminder,
) -> None:
    database.delete(reminder)
    database.commit()


def dismiss_reminder(
    database: Session,
    reminder: Reminder,
) -> Reminder:
    reminder.is_dismissed = True
    reminder.is_enabled = False

    database.add(reminder)
    database.commit()
    database.refresh(reminder)

    return reminder


def mark_notified(
    database: Session,
    reminder: Reminder,
) -> Reminder:
    reminder.notified_at = (
        datetime.now(timezone.utc)
    )

    database.add(reminder)
    database.commit()
    database.refresh(reminder)

    return reminder


def reminder_to_dict(
    reminder: Reminder,
) -> dict[str, object]:
    now = datetime.now(timezone.utc)

    remind_at = reminder.remind_at

    if remind_at.tzinfo is None:
        remind_at = remind_at.replace(
            tzinfo=timezone.utc
        )

    due_now_until = (
        remind_at
        + timedelta(minutes=15)
    )

    is_due_now = (
        reminder.is_enabled
        and not reminder.is_dismissed
        and remind_at <= now
        and now <= due_now_until
    )

    is_overdue = (
        reminder.is_enabled
        and not reminder.is_dismissed
        and now > due_now_until
    )

    return {
        "id": reminder.id,
        "user_id": reminder.user_id,
        "task_id": reminder.task_id,
        "routine_id": reminder.routine_id,
        "title": reminder.title,
        "message": reminder.message,
        "remind_at": reminder.remind_at,
        "is_enabled": reminder.is_enabled,
        "is_dismissed": reminder.is_dismissed,
        "notified_at": reminder.notified_at,
        "created_at": reminder.created_at,
        "updated_at": reminder.updated_at,
        "is_due_now": is_due_now,
        "is_overdue": is_overdue,
    }


def get_summary(
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

    end_of_day = now.replace(
        hour=23,
        minute=59,
        second=59,
        microsecond=999999,
    )

    base_conditions = (
        Reminder.user_id == user_id,
        Reminder.is_enabled.is_(True),
        Reminder.is_dismissed.is_(False),
    )

    total_active = database.scalar(
        select(
            func.count(Reminder.id)
        ).where(
            *base_conditions
        )
    ) or 0

    upcoming = database.scalar(
        select(
            func.count(Reminder.id)
        ).where(
            *base_conditions,
            Reminder.remind_at >= now,
        )
    ) or 0

    overdue = database.scalar(
        select(
            func.count(Reminder.id)
        ).where(
            *base_conditions,
            Reminder.remind_at < now,
        )
    ) or 0

    due_today = database.scalar(
        select(
            func.count(Reminder.id)
        ).where(
            *base_conditions,
            Reminder.remind_at
            >= start_of_day,
            Reminder.remind_at
            <= end_of_day,
        )
    ) or 0

    return {
        "total_active": int(
            total_active
        ),
        "upcoming": int(upcoming),
        "overdue": int(overdue),
        "due_today": int(due_today),
    }
