import uuid

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
from app.models.subtask import Subtask
from app.models.task import Task
from app.subtasks.repository import (
    create_subtask,
    delete_subtask,
    get_subtask_for_user,
    get_task_for_user,
    get_task_progress,
    list_subtasks,
    reorder_subtasks,
    set_subtask_completion,
    update_subtask,
)
from app.subtasks.schemas import (
    SubtaskCreate,
    SubtaskReorderRequest,
    SubtaskResponse,
    SubtaskUpdate,
    TaskProgressResponse,
)


router = APIRouter(
    prefix="/subtasks",
    tags=["Task Breakdown"],
)


def require_task(
    database: DatabaseDependency,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
) -> Task:
    task = get_task_for_user(
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


def require_subtask(
    database: DatabaseDependency,
    user_id: uuid.UUID,
    subtask_id: uuid.UUID,
) -> Subtask:
    subtask = get_subtask_for_user(
        database=database,
        user_id=user_id,
        subtask_id=subtask_id,
    )

    if subtask is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found.",
        )

    return subtask


@router.post(
    "",
    response_model=SubtaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_subtask(
    payload: SubtaskCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> SubtaskResponse:
    require_task(
        database=database,
        user_id=current_user.id,
        task_id=payload.task_id,
    )

    subtask = create_subtask(
        database=database,
        user_id=current_user.id,
        payload=payload,
    )

    return SubtaskResponse.model_validate(
        subtask
    )


@router.get(
    "",
    response_model=list[SubtaskResponse],
)
def read_subtasks(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    task_id: uuid.UUID = Query(...),
) -> list[SubtaskResponse]:
    require_task(
        database=database,
        user_id=current_user.id,
        task_id=task_id,
    )

    subtasks = list_subtasks(
        database=database,
        user_id=current_user.id,
        task_id=task_id,
    )

    return [
        SubtaskResponse.model_validate(
            subtask
        )
        for subtask in subtasks
    ]


@router.get(
    "/progress/{task_id}",
    response_model=TaskProgressResponse,
)
def read_task_progress(
    task_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> TaskProgressResponse:
    require_task(
        database=database,
        user_id=current_user.id,
        task_id=task_id,
    )

    progress = get_task_progress(
        database=database,
        user_id=current_user.id,
        task_id=task_id,
    )

    return TaskProgressResponse(
        **progress
    )


@router.put(
    "/{subtask_id}",
    response_model=SubtaskResponse,
)
def replace_subtask(
    subtask_id: uuid.UUID,
    payload: SubtaskUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> SubtaskResponse:
    subtask = require_subtask(
        database=database,
        user_id=current_user.id,
        subtask_id=subtask_id,
    )

    updated = update_subtask(
        database=database,
        subtask=subtask,
        payload=payload,
    )

    return SubtaskResponse.model_validate(
        updated
    )


@router.patch(
    "/{subtask_id}/complete",
    response_model=SubtaskResponse,
)
def change_subtask_completion(
    subtask_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    completed: bool = True,
) -> SubtaskResponse:
    subtask = require_subtask(
        database=database,
        user_id=current_user.id,
        subtask_id=subtask_id,
    )

    updated = set_subtask_completion(
        database=database,
        subtask=subtask,
        completed=completed,
    )

    return SubtaskResponse.model_validate(
        updated
    )


@router.patch(
    "/reorder/{task_id}",
    response_model=list[SubtaskResponse],
)
def change_subtask_order(
    task_id: uuid.UUID,
    payload: SubtaskReorderRequest,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> list[SubtaskResponse]:
    require_task(
        database=database,
        user_id=current_user.id,
        task_id=task_id,
    )

    try:
        subtasks = reorder_subtasks(
            database=database,
            user_id=current_user.id,
            task_id=task_id,
            payload=payload,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return [
        SubtaskResponse.model_validate(
            subtask
        )
        for subtask in subtasks
    ]


@router.delete(
    "/{subtask_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_subtask(
    subtask_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> Response:
    subtask = require_subtask(
        database=database,
        user_id=current_user.id,
        subtask_id=subtask_id,
    )

    delete_subtask(
        database=database,
        subtask=subtask,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
