from datetime import datetime, timezone

from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
BASE_URL = "/api/v1/offline-sync"


def headers_for(
    client: TestClient,
    email: str,
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email":
                email,
            "full_name":
                "Offline User",
            "password":
                "StrongPassword123!",
        },
    )

    response = client.post(
        TOKEN_URL,
        data={
            "username":
                email,
            "password":
                "StrongPassword123!",
        },
    )

    assert response.status_code == 200

    return {
        "Authorization":
            (
                "Bearer "
                + response.json()[
                    "access_token"
                ]
            ),
    }


def sample_item(
    operation_id: str,
) -> dict:
    return {
        "client_operation_id":
            operation_id,
        "resource_type":
            "task",
        "operation":
            "create",
        "resource_id":
            None,
        "payload": {
            "title":
                "Offline task",
        },
        "client_created_at":
            datetime.now(
                timezone.utc
            ).isoformat(),
    }


def test_offline_sync_requires_auth(
    client: TestClient,
) -> None:
    response = client.get(
        f"{BASE_URL}/status"
    )

    assert response.status_code == 401


def test_sync_single_item(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "offline1@aksess.app",
    )

    response = client.post(
        f"{BASE_URL}/batch",
        headers=headers,
        json={
            "items": [
                sample_item(
                    "operation-1"
                )
            ]
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data[
        "accepted"
    ] == 1

    assert data[
        "duplicates"
    ] == 0


def test_duplicate_operation_is_idempotent(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "offline2@aksess.app",
    )

    body = {
        "items": [
            sample_item(
                "operation-duplicate"
            )
        ]
    }

    first = client.post(
        f"{BASE_URL}/batch",
        headers=headers,
        json=body,
    )

    second = client.post(
        f"{BASE_URL}/batch",
        headers=headers,
        json=body,
    )

    assert first.status_code == 200
    assert second.status_code == 200

    assert second.json()[
        "duplicates"
    ] == 1


def test_sync_multiple_items(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "offline3@aksess.app",
    )

    response = client.post(
        f"{BASE_URL}/batch",
        headers=headers,
        json={
            "items": [
                sample_item(
                    "operation-a"
                ),
                sample_item(
                    "operation-b"
                ),
            ]
        },
    )

    assert response.status_code == 200

    assert response.json()[
        "accepted"
    ] == 2


def test_sync_status(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "offline4@aksess.app",
    )

    client.post(
        f"{BASE_URL}/batch",
        headers=headers,
        json={
            "items": [
                sample_item(
                    "operation-status"
                )
            ]
        },
    )

    response = client.get(
        f"{BASE_URL}/status",
        headers=headers,
    )

    assert response.status_code == 200

    assert response.json()[
        "total_synced"
    ] == 1


def test_delete_sync_history(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "offline5@aksess.app",
    )

    client.post(
        f"{BASE_URL}/batch",
        headers=headers,
        json={
            "items": [
                sample_item(
                    "operation-delete"
                )
            ]
        },
    )

    response = client.delete(
        f"{BASE_URL}/history",
        headers=headers,
    )

    assert response.status_code == 200

    status = client.get(
        f"{BASE_URL}/status",
        headers=headers,
    )

    assert status.json()[
        "total_synced"
    ] == 0
