import uuid
from datetime import datetime, timezone

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.tasks.schemas import TaskCreate, TaskUpdate


def create_task(
    database: Session,
    user_id: uuid.UUID,
    payload: TaskCreate,
) -> Task:
    is_completed = payload.status == "completed"

    task = Task(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        status=payload.status,
        due_date=payload.due_date,
        is_completed=is_completed,
    )

    database.add(task)
    database.commit()
    database.refresh(task)

    return task


def build_task_query(
    user_id: uuid.UUID,
    status: str | None = None,
    priority: str | None = None,
) -> Select[tuple[Task]]:
    statement = select(Task).where(
        Task.user_id == user_id
    )

    if status is not None:
        statement = statement.where(
            Task.status == status
        )

    if priority is not None:
        statement = statement.where(
            Task.priority == priority
        )

    return statement.order_by(
        Task.is_completed.asc(),
        Task.due_date.asc().nulls_last(),
        Task.created_at.desc(),
    )


def list_tasks(
    database: Session,
    user_id: uuid.UUID,
    status: str | None = None,
    priority: str | None = None,
) -> list[Task]:
    statement = build_task_query(
        user_id=user_id,
        status=status,
        priority=priority,
    )

    return list(
        database.scalars(statement).all()
    )


def get_task_by_id(
    database: Session,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
) -> Task | None:
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )

    return database.scalar(statement)


def update_task(
    database: Session,
    task: Task,
    payload: TaskUpdate,
) -> Task:
    values = payload.model_dump(
        exclude_unset=True,
    )

    for field, value in values.items():
        setattr(task, field, value)

    if "status" in values:
        task.is_completed = (
            values["status"] == "completed"
        )

    database.add(task)
    database.commit()
    database.refresh(task)

    return task


def set_task_completion(
    database: Session,
    task: Task,
    completed: bool,
) -> Task:
    task.is_completed = completed

    if completed:
        task.status = "completed"
    elif task.status == "completed":
        task.status = "pending"

    database.add(task)
    database.commit()
    database.refresh(task)

    return task


def delete_task(
    database: Session,
    task: Task,
) -> None:
    database.delete(task)
    database.commit()


def get_task_summary(
    database: Session,
    user_id: uuid.UUID,
) -> dict[str, int]:
    total = database.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id
        )
    ) or 0

    pending = database.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id,
            Task.status == "pending",
        )
    ) or 0

    in_progress = database.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id,
            Task.status == "in-progress",
        )
    ) or 0

    completed = database.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id,
            Task.status == "completed",
        )
    ) or 0

    current_time = datetime.now(timezone.utc)

    overdue = database.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id,
            Task.due_date.is_not(None),
            Task.due_date < current_time,
            Task.is_completed.is_(False),
        )
    ) or 0

    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "overdue": overdue,
    }
