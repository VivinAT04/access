import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.subtask import Subtask
from app.models.task import Task
from app.subtasks.schemas import (
    SubtaskCreate,
    SubtaskReorderRequest,
    SubtaskUpdate,
)


def get_task_for_user(
    database: Session,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
) -> Task | None:
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )

    return database.scalar(statement)


def get_subtask_for_user(
    database: Session,
    user_id: uuid.UUID,
    subtask_id: uuid.UUID,
) -> Subtask | None:
    statement = select(Subtask).where(
        Subtask.id == subtask_id,
        Subtask.user_id == user_id,
    )

    return database.scalar(statement)


def list_subtasks(
    database: Session,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
) -> list[Subtask]:
    statement = (
        select(Subtask)
        .where(
            Subtask.user_id == user_id,
            Subtask.task_id == task_id,
        )
        .order_by(
            Subtask.position.asc(),
            Subtask.created_at.asc(),
        )
    )

    return list(
        database.scalars(statement).all()
    )


def get_next_position(
    database: Session,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
) -> int:
    maximum_position = database.scalar(
        select(
            func.max(Subtask.position)
        ).where(
            Subtask.user_id == user_id,
            Subtask.task_id == task_id,
        )
    )

    if maximum_position is None:
        return 0

    return int(maximum_position) + 1


def create_subtask(
    database: Session,
    user_id: uuid.UUID,
    payload: SubtaskCreate,
) -> Subtask:
    position = payload.position

    if position is None:
        position = get_next_position(
            database=database,
            user_id=user_id,
            task_id=payload.task_id,
        )

    subtask = Subtask(
        user_id=user_id,
        task_id=payload.task_id,
        title=payload.title,
        description=payload.description,
        position=position,
        is_completed=False,
    )

    database.add(subtask)
    database.commit()
    database.refresh(subtask)

    synchronise_parent_task(
        database=database,
        user_id=user_id,
        task_id=payload.task_id,
    )

    database.refresh(subtask)

    return subtask


def update_subtask(
    database: Session,
    subtask: Subtask,
    payload: SubtaskUpdate,
) -> Subtask:
    values = payload.model_dump(
        exclude_unset=True,
    )

    for field, value in values.items():
        setattr(subtask, field, value)

    database.add(subtask)
    database.commit()
    database.refresh(subtask)

    return subtask


def set_subtask_completion(
    database: Session,
    subtask: Subtask,
    completed: bool,
) -> Subtask:
    subtask.is_completed = completed

    database.add(subtask)
    database.commit()
    database.refresh(subtask)

    synchronise_parent_task(
        database=database,
        user_id=subtask.user_id,
        task_id=subtask.task_id,
    )

    database.refresh(subtask)

    return subtask


def delete_subtask(
    database: Session,
    subtask: Subtask,
) -> None:
    user_id = subtask.user_id
    task_id = subtask.task_id

    database.delete(subtask)
    database.commit()

    normalise_positions(
        database=database,
        user_id=user_id,
        task_id=task_id,
    )

    synchronise_parent_task(
        database=database,
        user_id=user_id,
        task_id=task_id,
    )


def reorder_subtasks(
    database: Session,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
    payload: SubtaskReorderRequest,
) -> list[Subtask]:
    existing_subtasks = list_subtasks(
        database=database,
        user_id=user_id,
        task_id=task_id,
    )

    subtasks_by_id = {
        subtask.id: subtask
        for subtask in existing_subtasks
    }

    submitted_ids = {
        item.id
        for item in payload.items
    }

    if not submitted_ids.issubset(
        subtasks_by_id.keys()
    ):
        raise ValueError(
            "One or more subtasks do not belong to this task."
        )

    for item in payload.items:
        subtasks_by_id[
            item.id
        ].position = item.position

    database.commit()

    return list_subtasks(
        database=database,
        user_id=user_id,
        task_id=task_id,
    )


def normalise_positions(
    database: Session,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
) -> None:
    subtasks = list_subtasks(
        database=database,
        user_id=user_id,
        task_id=task_id,
    )

    for position, subtask in enumerate(
        subtasks
    ):
        subtask.position = position

    database.commit()


def get_task_progress(
    database: Session,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
) -> dict[str, int | bool | uuid.UUID]:
    total_subtasks = database.scalar(
        select(
            func.count(Subtask.id)
        ).where(
            Subtask.user_id == user_id,
            Subtask.task_id == task_id,
        )
    ) or 0

    completed_subtasks = database.scalar(
        select(
            func.count(Subtask.id)
        ).where(
            Subtask.user_id == user_id,
            Subtask.task_id == task_id,
            Subtask.is_completed.is_(True),
        )
    ) or 0

    if total_subtasks == 0:
        progress_percentage = 0
    else:
        progress_percentage = round(
            (
                int(completed_subtasks)
                / int(total_subtasks)
            )
            * 100
        )

    return {
        "task_id": task_id,
        "total_subtasks": int(
            total_subtasks
        ),
        "completed_subtasks": int(
            completed_subtasks
        ),
        "progress_percentage": int(
            progress_percentage
        ),
        "is_completed": (
            total_subtasks > 0
            and completed_subtasks
            == total_subtasks
        ),
    }


def synchronise_parent_task(
    database: Session,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
) -> None:
    task = get_task_for_user(
        database=database,
        user_id=user_id,
        task_id=task_id,
    )

    if task is None:
        return

    progress = get_task_progress(
        database=database,
        user_id=user_id,
        task_id=task_id,
    )

    total_subtasks = int(
        progress["total_subtasks"]
    )

    completed_subtasks = int(
        progress["completed_subtasks"]
    )

    if total_subtasks == 0:
        return

    if completed_subtasks == total_subtasks:
        task.status = "completed"
        task.is_completed = True
    elif completed_subtasks > 0:
        task.status = "in-progress"
        task.is_completed = False
    else:
        task.status = "pending"
        task.is_completed = False

    database.add(task)
    database.commit()
