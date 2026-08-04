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
from app.models.reminder import Reminder
from app.reminders.repository import (
    create_reminder,
    delete_reminder,
    dismiss_reminder,
    get_reminder,
    get_routine,
    get_summary,
    get_task,
    list_reminders,
    mark_notified,
    reminder_to_dict,
    update_reminder,
)
from app.reminders.schemas import (
    ReminderCreate,
    ReminderResponse,
    ReminderSummaryResponse,
    ReminderUpdate,
)


router = APIRouter(
    prefix="/reminders",
    tags=["Reminders"],
)


def require_reminder(
    database: DatabaseDependency,
    user_id: uuid.UUID,
    reminder_id: uuid.UUID,
) -> Reminder:
    reminder = get_reminder(
        database=database,
        user_id=user_id,
        reminder_id=reminder_id,
    )

    if reminder is None:
        raise HTTPException(
            status_code=404,
            detail="Reminder not found.",
        )

    return reminder


def validate_links(
    database: DatabaseDependency,
    user_id: uuid.UUID,
    payload: ReminderCreate,
) -> None:
    if (
        payload.task_id is not None
        and get_task(
            database,
            user_id,
            payload.task_id,
        )
        is None
    ):
        raise HTTPException(
            status_code=404,
            detail="Linked task not found.",
        )

    if (
        payload.routine_id is not None
        and get_routine(
            database,
            user_id,
            payload.routine_id,
        )
        is None
    ):
        raise HTTPException(
            status_code=404,
            detail="Linked routine not found.",
        )


@router.post(
    "",
    response_model=ReminderResponse,
    status_code=201,
)
def create_new_reminder(
    payload: ReminderCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> ReminderResponse:
    validate_links(
        database,
        current_user.id,
        payload,
    )

    reminder = create_reminder(
        database,
        current_user.id,
        payload,
    )

    return ReminderResponse(
        **reminder_to_dict(
            reminder
        )
    )


@router.get(
    "",
    response_model=list[
        ReminderResponse
    ],
)
def read_reminders(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    include_dismissed: bool = Query(
        default=False
    ),
) -> list[ReminderResponse]:
    return [
        ReminderResponse(
            **reminder_to_dict(
                reminder
            )
        )
        for reminder in list_reminders(
            database,
            current_user.id,
            include_dismissed,
        )
    ]


@router.get(
    "/summary",
    response_model=ReminderSummaryResponse,
)
def read_summary(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> ReminderSummaryResponse:
    return ReminderSummaryResponse(
        **get_summary(
            database,
            current_user.id,
        )
    )


@router.put(
    "/{reminder_id}",
    response_model=ReminderResponse,
)
def edit_reminder(
    reminder_id: uuid.UUID,
    payload: ReminderUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> ReminderResponse:
    reminder = require_reminder(
        database,
        current_user.id,
        reminder_id,
    )

    updated = update_reminder(
        database,
        reminder,
        payload,
    )

    return ReminderResponse(
        **reminder_to_dict(updated)
    )


@router.patch(
    "/{reminder_id}/dismiss",
    response_model=ReminderResponse,
)
def dismiss_existing_reminder(
    reminder_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> ReminderResponse:
    reminder = require_reminder(
        database,
        current_user.id,
        reminder_id,
    )

    updated = dismiss_reminder(
        database,
        reminder,
    )

    return ReminderResponse(
        **reminder_to_dict(updated)
    )


@router.patch(
    "/{reminder_id}/notified",
    response_model=ReminderResponse,
)
def mark_existing_reminder_notified(
    reminder_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> ReminderResponse:
    reminder = require_reminder(
        database,
        current_user.id,
        reminder_id,
    )

    updated = mark_notified(
        database,
        reminder,
    )

    return ReminderResponse(
        **reminder_to_dict(updated)
    )


@router.delete(
    "/{reminder_id}",
    status_code=204,
)
def remove_reminder(
    reminder_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> Response:
    reminder = require_reminder(
        database,
        current_user.id,
        reminder_id,
    )

    delete_reminder(
        database,
        reminder,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )
