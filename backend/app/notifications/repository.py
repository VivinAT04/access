import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    func,
    select,
)
from sqlalchemy.orm import Session

from app.models.notification import (
    Notification,
    NotificationPreference,
)
from app.notifications.schemas import (
    NotificationCreate,
    NotificationPreferenceUpdate,
)


def get_or_create_preferences(
    database: Session,
    user_id: uuid.UUID,
) -> NotificationPreference:
    statement = select(
        NotificationPreference
    ).where(
        NotificationPreference.user_id
        == user_id
    )

    preference = database.scalar(
        statement
    )

    if preference is not None:
        return preference

    preference = NotificationPreference(
        user_id=user_id,
    )

    database.add(
        preference
    )
    database.commit()
    database.refresh(
        preference
    )

    return preference


def update_preferences(
    database: Session,
    user_id: uuid.UUID,
    payload: NotificationPreferenceUpdate,
) -> NotificationPreference:
    preference = get_or_create_preferences(
        database=database,
        user_id=user_id,
    )

    changes = payload.model_dump(
        exclude_unset=True,
    )

    for key, value in changes.items():
        setattr(
            preference,
            key,
            value,
        )

    database.add(
        preference
    )
    database.commit()
    database.refresh(
        preference
    )

    return preference


def create_notification(
    database: Session,
    user_id: uuid.UUID,
    payload: NotificationCreate,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        notification_type=(
            payload.notification_type
        ),
        title=payload.title.strip(),
        message=payload.message.strip(),
        action_url=payload.action_url,
        source_type=payload.source_type,
        source_id=payload.source_id,
        priority=payload.priority,
    )

    database.add(
        notification
    )
    database.commit()
    database.refresh(
        notification
    )

    return notification


def list_notifications(
    database: Session,
    user_id: uuid.UUID,
    unread_only: bool = False,
) -> list[Notification]:
    conditions = [
        Notification.user_id
        == user_id,
        Notification.is_dismissed
        .is_(False),
    ]

    if unread_only:
        conditions.append(
            Notification.is_read
            .is_(False)
        )

    statement = (
        select(
            Notification
        )
        .where(
            *conditions
        )
        .order_by(
            Notification.created_at.desc()
        )
    )

    return list(
        database.scalars(
            statement
        )
    )


def notification_summary(
    database: Session,
    user_id: uuid.UUID,
) -> dict[str, int]:
    total_statement = select(
        func.count(
            Notification.id
        )
    ).where(
        Notification.user_id
        == user_id,
        Notification.is_dismissed
        .is_(False),
    )

    unread_statement = select(
        func.count(
            Notification.id
        )
    ).where(
        Notification.user_id
        == user_id,
        Notification.is_dismissed
        .is_(False),
        Notification.is_read
        .is_(False),
    )

    dismissed_statement = select(
        func.count(
            Notification.id
        )
    ).where(
        Notification.user_id
        == user_id,
        Notification.is_dismissed
        .is_(True),
    )

    return {
        "total":
            int(
                database.scalar(
                    total_statement
                )
                or 0
            ),

        "unread":
            int(
                database.scalar(
                    unread_statement
                )
                or 0
            ),

        "dismissed":
            int(
                database.scalar(
                    dismissed_statement
                )
                or 0
            ),
    }


def get_user_notification(
    database: Session,
    user_id: uuid.UUID,
    notification_id: uuid.UUID,
) -> Notification:
    notification = database.get(
        Notification,
        notification_id,
    )

    if (
        notification is None
        or notification.user_id
        != user_id
    ):
        raise ValueError(
            "Notification not found."
        )

    return notification


def mark_as_read(
    database: Session,
    user_id: uuid.UUID,
    notification_id: uuid.UUID,
) -> Notification:
    notification = get_user_notification(
        database=database,
        user_id=user_id,
        notification_id=notification_id,
    )

    if not notification.is_read:
        notification.is_read = True
        notification.read_at = (
            datetime.now(
                timezone.utc
            )
        )

        database.add(
            notification
        )
        database.commit()
        database.refresh(
            notification
        )

    return notification


def mark_all_as_read(
    database: Session,
    user_id: uuid.UUID,
) -> int:
    notifications = list_notifications(
        database=database,
        user_id=user_id,
        unread_only=True,
    )

    now = datetime.now(
        timezone.utc
    )

    for notification in notifications:
        notification.is_read = True
        notification.read_at = now

        database.add(
            notification
        )

    database.commit()

    return len(
        notifications
    )


def dismiss_notification(
    database: Session,
    user_id: uuid.UUID,
    notification_id: uuid.UUID,
) -> Notification:
    notification = get_user_notification(
        database=database,
        user_id=user_id,
        notification_id=notification_id,
    )

    notification.is_dismissed = True
    notification.dismissed_at = (
        datetime.now(
            timezone.utc
        )
    )

    database.add(
        notification
    )
    database.commit()
    database.refresh(
        notification
    )

    return notification


def create_welcome_notifications(
    database: Session,
    user_id: uuid.UUID,
) -> None:
    existing = database.scalar(
        select(
            Notification.id
        ).where(
            Notification.user_id
            == user_id,
            Notification.source_type
            == "notification-onboarding",
        )
    )

    if existing is not None:
        return

    notifications = [
        Notification(
            user_id=user_id,
            notification_type="wellbeing",
            title="Notification centre ready",
            message=(
                "You can choose which reminders "
                "feel helpful and turn off the rest."
            ),
            action_url="/notifications",
            source_type="notification-onboarding",
            source_id="welcome",
            priority="normal",
        ),
        Notification(
            user_id=user_id,
            notification_type="focus",
            title="Gentle focus reminders",
            message=(
                "Focus reminders are optional and "
                "never punish you for skipping a session."
            ),
            action_url="/focus",
            source_type="notification-onboarding",
            source_id="focus",
            priority="low",
        ),
    ]

    database.add_all(
        notifications
    )
    database.commit()
