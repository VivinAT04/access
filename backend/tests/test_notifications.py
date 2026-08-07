from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
BASE_URL = "/api/v1/notifications"


def headers_for(
    client: TestClient,
    email: str = "notify@aksess.app",
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name": "Notification User",
            "password": "StrongPassword123!",
        },
    )

    response = client.post(
        TOKEN_URL,
        data={
            "username": email,
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 200

    token = response.json()[
        "access_token"
    ]

    return {
        "Authorization":
            f"Bearer {token}",
    }


def test_notifications_require_auth(
    client: TestClient,
) -> None:
    response = client.get(
        BASE_URL
    )

    assert response.status_code == 401


def test_default_preferences(
    client: TestClient,
) -> None:
    headers = headers_for(
        client
    )

    response = client.get(
        f"{BASE_URL}/preferences",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data[
        "in_app_enabled"
    ] is True

    assert data[
        "browser_enabled"
    ] is False

    assert data[
        "quiet_hours_enabled"
    ] is True


def test_update_preferences(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "notify2@aksess.app",
    )

    response = client.put(
        f"{BASE_URL}/preferences",
        headers=headers,
        json={
            "browser_enabled": True,
            "digest_frequency": "daily",
            "max_daily_notifications": 4,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data[
        "browser_enabled"
    ] is True

    assert data[
        "digest_frequency"
    ] == "daily"

    assert data[
        "max_daily_notifications"
    ] == 4


def test_initial_notifications(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "notify3@aksess.app",
    )

    response = client.get(
        BASE_URL,
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) >= 2


def test_create_preview_notification(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "notify4@aksess.app",
    )

    response = client.post(
        f"{BASE_URL}/preview",
        headers=headers,
        json={
            "notification_type":
                "wellbeing",
            "title":
                "Time for a check-in",
            "message":
                "Take a moment to notice how you feel.",
            "action_url":
                "/mood",
            "priority":
                "normal",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data[
        "title"
    ] == "Time for a check-in"

    assert data[
        "is_read"
    ] is False


def test_mark_notification_read(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "notify5@aksess.app",
    )

    created = client.post(
        f"{BASE_URL}/preview",
        headers=headers,
        json={
            "notification_type":
                "focus",
            "title":
                "Focus",
            "message":
                "Ready when you are.",
        },
    ).json()

    response = client.patch(
        (
            f"{BASE_URL}/"
            f"{created['id']}/read"
        ),
        headers=headers,
    )

    assert response.status_code == 200

    assert response.json()[
        "is_read"
    ] is True


def test_mark_all_read(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "notify6@aksess.app",
    )

    client.get(
        BASE_URL,
        headers=headers,
    )

    response = client.patch(
        f"{BASE_URL}/read-all",
        headers=headers,
    )

    assert response.status_code == 200


def test_dismiss_notification(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "notify7@aksess.app",
    )

    created = client.post(
        f"{BASE_URL}/preview",
        headers=headers,
        json={
            "notification_type":
                "routine",
            "title":
                "Routine",
            "message":
                "Your routine is ready.",
        },
    ).json()

    response = client.patch(
        (
            f"{BASE_URL}/"
            f"{created['id']}/dismiss"
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
    headers = headers_for(
        client,
        "notify8@aksess.app",
    )

    response = client.get(
        f"{BASE_URL}/summary",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert "unread" in data
    assert "total" in data
