from datetime import (
    datetime,
    timezone,
)

from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
COMPANION_URL = "/api/v1/companion"
FOCUS_URL = "/api/v1/focus-sessions"


def auth_headers(
    client: TestClient,
    email: str = "companion@aksess.app",
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name":
                "Companion User",
            "password":
                "StrongPassword123!",
        },
    )

    response = client.post(
        TOKEN_URL,
        data={
            "username": email,
            "password":
                "StrongPassword123!",
        },
    )

    assert response.status_code == 200

    return {
        "Authorization":
            "Bearer "
            + response.json()[
                "access_token"
            ]
    }


def create_focus_session(
    client: TestClient,
    headers: dict[str, str],
    completed_minutes: int = 25,
    status: str = "completed",
) -> dict[str, object]:
    response = client.post(
        FOCUS_URL,
        headers=headers,
        json={
            "task_id": None,
            "intention":
                "Work beside companion",
            "notes": None,
            "planned_minutes": 25,
            "completed_minutes":
                completed_minutes,
            "status": status,
            "started_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),
            "completed_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),
        },
    )

    assert response.status_code == 201

    return response.json()


def test_default_profile_created(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    response = client.get(
        f"{COMPANION_URL}/profile",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data[
        "companion_type"
    ] == "sprout"

    assert data[
        "total_xp"
    ] == 0

    assert data[
        "current_level"
    ] == 1


def test_update_companion(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    response = client.put(
        f"{COMPANION_URL}/profile",
        headers=headers,
        json={
            "companion_type": "owl",
            "companion_name": "Nova",
        },
    )

    assert response.status_code == 200
    assert response.json()[
        "companion_name"
    ] == "Nova"

    assert response.json()[
        "companion_type"
    ] == "owl"


def test_completed_session_awards_xp(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    session = create_focus_session(
        client,
        headers,
        completed_minutes=25,
    )

    response = client.post(
        f"{COMPANION_URL}/reward",
        headers=headers,
        json={
            "focus_session_id":
                session["id"],
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data[
        "already_awarded"
    ] is False

    assert data["xp_awarded"] == 25

    assert data["profile"][
        "total_xp"
    ] == 25

    assert data["profile"][
        "completed_sessions"
    ] == 1


def test_same_session_is_not_awarded_twice(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    session = create_focus_session(
        client,
        headers,
        completed_minutes=20,
    )

    payload = {
        "focus_session_id":
            session["id"],
    }

    first = client.post(
        f"{COMPANION_URL}/reward",
        headers=headers,
        json=payload,
    )

    second = client.post(
        f"{COMPANION_URL}/reward",
        headers=headers,
        json=payload,
    )

    assert first.status_code == 200
    assert second.status_code == 200

    assert second.json()[
        "already_awarded"
    ] is True

    assert second.json()[
        "profile"
    ]["total_xp"] == 20


def test_cancelled_session_cannot_earn_xp(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    session = create_focus_session(
        client,
        headers,
        completed_minutes=5,
        status="cancelled",
    )

    response = client.post(
        f"{COMPANION_URL}/reward",
        headers=headers,
        json={
            "focus_session_id":
                session["id"],
        },
    )

    assert response.status_code == 400


def test_users_cannot_reward_other_users_session(
    client: TestClient,
) -> None:
    owner_headers = auth_headers(
        client,
        "companion-owner@aksess.app",
    )

    other_headers = auth_headers(
        client,
        "companion-other@aksess.app",
    )

    session = create_focus_session(
        client,
        owner_headers,
    )

    response = client.post(
        f"{COMPANION_URL}/reward",
        headers=other_headers,
        json={
            "focus_session_id":
                session["id"],
        },
    )

    assert response.status_code == 404
