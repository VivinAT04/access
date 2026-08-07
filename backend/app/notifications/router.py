import uuid

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    status,
)

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.notifications.repository import (
    create_notification,
    create_welcome_notifications,
    dismiss_notification,
    get_or_create_preferences,
    list_notifications,
    mark_all_as_read,
    mark_as_read,
    notification_summary,
    update_preferences,
)
from app.notifications.schemas import (
    BrowserNotificationPreview,
    NotificationActionResponse,
    NotificationCreate,
    NotificationPreferenceResponse,
    NotificationPreferenceUpdate,
    NotificationResponse,
    NotificationSummaryResponse,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get(
    "/preferences",
    response_model=NotificationPreferenceResponse,
)
def read_preferences(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> NotificationPreferenceResponse:
    return get_or_create_preferences(
        database=database,
        user_id=current_user.id,
    )


@router.put(
    "/preferences",
    response_model=NotificationPreferenceResponse,
)
def change_preferences(
    payload: NotificationPreferenceUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> NotificationPreferenceResponse:
    return update_preferences(
        database=database,
        user_id=current_user.id,
        payload=payload,
    )


@router.get(
    "",
    response_model=list[
        NotificationResponse
    ],
)
def read_notifications(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    unread_only: bool = Query(
        default=False,
    ),
) -> list[
    NotificationResponse
]:
    create_welcome_notifications(
        database=database,
        user_id=current_user.id,
    )

    return list_notifications(
        database=database,
        user_id=current_user.id,
        unread_only=unread_only,
    )


@router.get(
    "/summary",
    response_model=NotificationSummaryResponse,
)
def read_summary(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> NotificationSummaryResponse:
    create_welcome_notifications(
        database=database,
        user_id=current_user.id,
    )

    return NotificationSummaryResponse(
        **notification_summary(
            database=database,
            user_id=current_user.id,
        )
    )


@router.post(
    "/preview",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_preview_notification(
    payload: NotificationCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> NotificationResponse:
    return create_notification(
        database=database,
        user_id=current_user.id,
        payload=payload,
    )


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def read_notification(
    notification_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> NotificationResponse:
    try:
        return mark_as_read(
            database=database,
            user_id=current_user.id,
            notification_id=notification_id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.patch(
    "/read-all",
    response_model=NotificationActionResponse,
)
def read_all_notifications(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> NotificationActionResponse:
    count = mark_all_as_read(
        database=database,
        user_id=current_user.id,
    )

    return NotificationActionResponse(
        message=(
            f"{count} notification"
            + (
                ""
                if count == 1
                else "s"
            )
            + " marked as read."
        )
    )


@router.patch(
    "/{notification_id}/dismiss",
    response_model=NotificationResponse,
)
def dismiss(
    notification_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> NotificationResponse:
    try:
        return dismiss_notification(
            database=database,
            user_id=current_user.id,
            notification_id=notification_id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.get(
    "/browser-preview",
    response_model=BrowserNotificationPreview,
)
def browser_preview(
    current_user: CurrentUserDependency,
) -> BrowserNotificationPreview:
    del current_user

    return BrowserNotificationPreview(
        title="Aksess",
        body=(
            "A gentle reminder from Aksess. "
            "You can change notification settings at any time."
        ),
        action_url="/notifications",
    )
