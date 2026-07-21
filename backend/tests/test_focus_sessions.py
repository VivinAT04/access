from datetime import datetime, timezone

from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
FOCUS_URL = "/api/v1/focus-sessions"


def auth_headers(
    client: TestClient,
    email: str = "focus@aksess.app",
) -> dict[str, str]:
    password = "StrongPassword123!"

    register_response = client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name": "Focus User",
            "password": password,
        },
    )

    assert register_response.status_code == 201

    token_response = client.post(
        TOKEN_URL,
        data={
            "username": email,
            "password": password,
        },
    )

    assert token_response.status_code == 200

    token = token_response.json()[
        "access_token"
    ]

    return {
        "Authorization": f"Bearer {token}",
    }


def create_session(
    client: TestClient,
    headers: dict[str, str],
) -> dict[str, object]:
    now = datetime.now(
        timezone.utc
    ).isoformat()

    response = client.post(
        FOCUS_URL,
        headers=headers,
        json={
            "intention": "Write dissertation",
            "notes": "Complete results section.",
            "planned_minutes": 25,
            "completed_minutes": 25,
            "status": "completed",
            "started_at": now,
            "completed_at": now,
        },
    )

    assert response.status_code == 201

    return response.json()


def test_focus_sessions_require_authentication(
    client: TestClient,
) -> None:
    response = client.get(
        FOCUS_URL
    )

    assert response.status_code == 401


def test_create_focus_session(
    client: TestClient,
) -> None:
    headers = auth_headers(client)
    session = create_session(
        client,
        headers,
    )

    assert session["intention"] == (
        "Write dissertation"
    )
    assert session["planned_minutes"] == 25
    assert session["completed_minutes"] == 25
    assert session["status"] == "completed"


def test_list_focus_sessions(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    create_session(
        client,
        headers,
    )

    response = client.get(
        FOCUS_URL,
        headers=headers,
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_focus_summary(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    create_session(
        client,
        headers,
    )

    response = client.get(
        f"{FOCUS_URL}/summary",
        headers=headers,
    )

    assert response.status_code == 200

    summary = response.json()

    assert summary["sessions_today"] == 1
    assert summary["minutes_today"] == 25
    assert summary["completed_sessions"] == 1
    assert summary["total_minutes"] == 25


def test_delete_focus_session(
    client: TestClient,
) -> None:
    headers = auth_headers(client)
    session = create_session(
        client,
        headers,
    )

    response = client.delete(
        f"{FOCUS_URL}/{session['id']}",
        headers=headers,
    )

    assert response.status_code == 204

    list_response = client.get(
        FOCUS_URL,
        headers=headers,
    )

    assert list_response.status_code == 200
    assert list_response.json() == []


def test_invalid_duration_is_rejected(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    now = datetime.now(
        timezone.utc
    ).isoformat()

    response = client.post(
        FOCUS_URL,
        headers=headers,
        json={
            "intention": "Invalid session",
            "planned_minutes": 0,
            "completed_minutes": 0,
            "started_at": now,
        },
    )

    assert response.status_code == 422


def test_users_cannot_delete_other_sessions(
    client: TestClient,
) -> None:
    owner_headers = auth_headers(
        client,
        "focus-owner@aksess.app",
    )

    other_headers = auth_headers(
        client,
        "focus-other@aksess.app",
    )

    session = create_session(
        client,
        owner_headers,
    )

    response = client.delete(
        f"{FOCUS_URL}/{session['id']}",
        headers=other_headers,
    )

    assert response.status_code == 404
