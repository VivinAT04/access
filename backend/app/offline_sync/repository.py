import uuid

from sqlalchemy import (
    delete,
    func,
    select,
)
from sqlalchemy.orm import Session

from app.models.offline_sync import (
    OfflineSyncRecord,
)
from app.offline_sync.schemas import (
    OfflineSyncItem,
)


def find_existing_operation(
    database: Session,
    user_id: uuid.UUID,
    client_operation_id: str,
) -> OfflineSyncRecord | None:
    return database.scalar(
        select(
            OfflineSyncRecord
        ).where(
            OfflineSyncRecord.user_id
            == user_id,
            OfflineSyncRecord.client_operation_id
            == client_operation_id,
        )
    )


def save_sync_item(
    database: Session,
    user_id: uuid.UUID,
    item: OfflineSyncItem,
) -> tuple[
    OfflineSyncRecord,
    bool,
]:
    existing = find_existing_operation(
        database=database,
        user_id=user_id,
        client_operation_id=(
            item.client_operation_id
        ),
    )

    if existing is not None:
        return (
            existing,
            True,
        )

    record = OfflineSyncRecord(
        user_id=user_id,
        client_operation_id=(
            item.client_operation_id
        ),
        resource_type=(
            item.resource_type
        ),
        operation=(
            item.operation
        ),
        resource_id=(
            item.resource_id
        ),
        payload=(
            item.payload
        ),
        client_created_at=(
            item.client_created_at
        ),
        status="accepted",
    )

    database.add(
        record
    )

    database.commit()

    database.refresh(
        record
    )

    return (
        record,
        False,
    )


def list_recent_sync_records(
    database: Session,
    user_id: uuid.UUID,
    limit: int = 50,
) -> list[
    OfflineSyncRecord
]:
    statement = (
        select(
            OfflineSyncRecord
        )
        .where(
            OfflineSyncRecord.user_id
            == user_id
        )
        .order_by(
            OfflineSyncRecord.synced_at.desc()
        )
        .limit(
            limit
        )
    )

    return list(
        database.scalars(
            statement
        )
    )


def total_sync_count(
    database: Session,
    user_id: uuid.UUID,
) -> int:
    statement = select(
        func.count(
            OfflineSyncRecord.id
        )
    ).where(
        OfflineSyncRecord.user_id
        == user_id
    )

    return int(
        database.scalar(
            statement
        )
        or 0
    )


def delete_sync_history(
    database: Session,
    user_id: uuid.UUID,
) -> None:
    database.execute(
        delete(
            OfflineSyncRecord
        ).where(
            OfflineSyncRecord.user_id
            == user_id
        )
    )

    database.commit()
