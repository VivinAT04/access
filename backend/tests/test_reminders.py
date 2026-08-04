from datetime import (
    datetime,
    timedelta,
    timezone,
)

from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
REMINDER_URL = "/api/v1/reminders"


def auth_headers(
    client: TestClient,
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email":
                "reminder@aksess.app",
            "full_name":
                "Reminder User",
            "password":
                "StrongPassword123!",
        },
    )

    response = client.post(
        TOKEN_URL,
        data={
            "username":
                "reminder@aksess.app",
            "password":
                "StrongPassword123!",
        },
    )

    return {
        "Authorization":
            "Bearer "
            + response.json()[
                "access_token"
            ]
    }


def create_reminder(
    client: TestClient,
    headers: dict[str, str],
) -> dict[str, object]:
    response = client.post(
        REMINDER_URL,
        headers=headers,
        json={
            "title":
                "Begin study session",
            "message":
                "Start with one small step.",
            "remind_at":
                (
                    datetime.now(
                        timezone.utc
                    )
                    + timedelta(hours=1)
                ).isoformat(),
            "is_enabled": True,
        },
    )

    assert response.status_code == 201

    return response.json()


def test_create_and_list_reminders(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    reminder = create_reminder(
        client,
        headers,
    )

    assert reminder[
        "title"
    ] == "Begin study session"

    response = client.get(
        REMINDER_URL,
        headers=headers,
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_update_reminder(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    reminder = create_reminder(
        client,
        headers,
    )

    response = client.put(
        (
            f"{REMINDER_URL}/"
            f"{reminder['id']}"
        ),
        headers=headers,
        json={
            "title":
                "Updated reminder"
        },
    )

    assert response.status_code == 200

    assert response.json()[
        "title"
    ] == "Updated reminder"


def test_dismiss_reminder(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    reminder = create_reminder(
        client,
        headers,
    )

    response = client.patch(
        (
            f"{REMINDER_URL}/"
            f"{reminder['id']}"
            "/dismiss"
        ),
        headers=headers,
    )

    assert response.status_code == 200

    assert response.json()[
        "is_dismissed"
    ] is True


def test_summary(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    create_reminder(
        client,
        headers,
    )

    response = client.get(
        f"{REMINDER_URL}/summary",
        headers=headers,
    )

    assert response.status_code == 200

    assert response.json()[
        "total_active"
    ] == 1


def test_delete_reminder(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    reminder = create_reminder(
        client,
        headers,
    )

    response = client.delete(
        (
            f"{REMINDER_URL}/"
            f"{reminder['id']}"
        ),
        headers=headers,
    )

    assert response.status_code == 204
