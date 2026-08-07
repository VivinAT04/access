from fastapi import APIRouter

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.offline_sync.repository import (
    delete_sync_history,
    list_recent_sync_records,
    save_sync_item,
    total_sync_count,
)
from app.offline_sync.schemas import (
    OfflineSyncBatchRequest,
    OfflineSyncBatchResponse,
    OfflineSyncResetResponse,
    OfflineSyncStatusResponse,
)


router = APIRouter(
    prefix="/offline-sync",
    tags=["Offline Sync"],
)


@router.post(
    "/batch",
    response_model=OfflineSyncBatchResponse,
)
def sync_batch(
    payload: OfflineSyncBatchRequest,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> OfflineSyncBatchResponse:
    records = []

    accepted = 0
    duplicates = 0

    for item in payload.items:
        record, duplicate = save_sync_item(
            database=database,
            user_id=current_user.id,
            item=item,
        )

        records.append(
            record
        )

        if duplicate:
            duplicates += 1
        else:
            accepted += 1

    return OfflineSyncBatchResponse(
        accepted=accepted,
        duplicates=duplicates,
        records=records,
    )


@router.get(
    "/status",
    response_model=OfflineSyncStatusResponse,
)
def status(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> OfflineSyncStatusResponse:
    return OfflineSyncStatusResponse(
        total_synced=total_sync_count(
            database=database,
            user_id=current_user.id,
        ),
        recent_records=(
            list_recent_sync_records(
                database=database,
                user_id=current_user.id,
            )
        ),
    )


@router.delete(
    "/history",
    response_model=OfflineSyncResetResponse,
)
def reset_history(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> OfflineSyncResetResponse:
    delete_sync_history(
        database=database,
        user_id=current_user.id,
    )

    return OfflineSyncResetResponse(
        message=(
            "Offline synchronisation history "
            "was deleted."
        )
    )
