import uuid
from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


OfflineOperation = Literal[
    "create",
    "update",
    "delete",
]


class OfflineSyncItem(BaseModel):
    client_operation_id: str = Field(
        min_length=1,
        max_length=120,
    )

    resource_type: str = Field(
        min_length=1,
        max_length=60,
    )

    operation: OfflineOperation

    resource_id: str | None = Field(
        default=None,
        max_length=120,
    )

    payload: dict = Field(
        default_factory=dict,
    )

    client_created_at: datetime


class OfflineSyncBatchRequest(BaseModel):
    items: list[
        OfflineSyncItem
    ] = Field(
        max_length=100,
    )


class OfflineSyncRecordResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID

    client_operation_id: str

    resource_type: str

    operation: str

    resource_id: str | None

    payload: dict

    status: str

    retry_count: int

    conflict_reason: str | None

    client_created_at: datetime

    synced_at: datetime


class OfflineSyncBatchResponse(BaseModel):
    accepted: int

    duplicates: int

    records: list[
        OfflineSyncRecordResponse
    ]


class OfflineSyncStatusResponse(BaseModel):
    total_synced: int

    recent_records: list[
        OfflineSyncRecordResponse
    ]


class OfflineSyncResetResponse(BaseModel):
    message: str
