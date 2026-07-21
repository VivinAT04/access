import uuid
from typing import Annotated

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    Response,
    status,
)

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.models.task import Task
from app.tasks.repository import (
    create_task,
    delete_task,
    get_task_by_id,
    get_task_summary,
    list_tasks,
    set_task_completion,
    update_task,
)
from app.tasks.schemas import (
    TaskCreate,
    TaskPriority,
    TaskResponse,
    TaskStatus,
    TaskSummaryResponse,
    TaskUpdate,
)


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


def require_task(
    database: DatabaseDependency,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
) -> Task:
    task = get_task_by_id(
        database=database,
        user_id=user_id,
        task_id=task_id,
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    return task


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_task(
    payload: TaskCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> TaskResponse:
    task = create_task(
        database=database,
        user_id=current_user.id,
        payload=payload,
    )

    return TaskResponse.model_validate(task)


@router.get(
    "",
    response_model=list[TaskResponse],
)
def read_tasks(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    task_status: Annotated[
        TaskStatus | None,
        Query(alias="status"),
    ] = None,
    priority: TaskPriority | None = None,
) -> list[TaskResponse]:
    tasks = list_tasks(
        database=database,
        user_id=current_user.id,
        status=task_status,
        priority=priority,
    )

    return [
        TaskResponse.model_validate(task)
        for task in tasks
    ]


@router.get(
    "/summary",
    response_model=TaskSummaryResponse,
)
def read_task_summary(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> TaskSummaryResponse:
    summary = get_task_summary(
        database=database,
        user_id=current_user.id,
    )

    return TaskSummaryResponse(**summary)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def read_task(
    task_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> TaskResponse:
    task = require_task(
        database=database,
        user_id=current_user.id,
        task_id=task_id,
    )

    return TaskResponse.model_validate(task)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
)
def replace_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> TaskResponse:
    task = require_task(
        database=database,
        user_id=current_user.id,
        task_id=task_id,
    )

    updated_task = update_task(
        database=database,
        task=task,
        payload=payload,
    )

    return TaskResponse.model_validate(updated_task)


@router.patch(
    "/{task_id}/complete",
    response_model=TaskResponse,
)
def change_task_completion(
    task_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    completed: bool = True,
) -> TaskResponse:
    task = require_task(
        database=database,
        user_id=current_user.id,
        task_id=task_id,
    )

    updated_task = set_task_completion(
        database=database,
        task=task,
        completed=completed,
    )

    return TaskResponse.model_validate(updated_task)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_task(
    task_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> Response:
    task = require_task(
        database=database,
        user_id=current_user.id,
        task_id=task_id,
    )

    delete_task(
        database=database,
        task=task,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
