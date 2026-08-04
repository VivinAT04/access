from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
ANXIETY_URL = "/api/v1/anxiety-sessions"


def auth_headers(
    client: TestClient,
    email: str = "anxiety@aksess.app",
) -> dict[str, str]:
    password = "StrongPassword123!"

    register_response = client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name": "Calm User",
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
    response = client.post(
        ANXIETY_URL,
        headers=headers,
        json={
            "exercise_type": (
                "box_breathing"
            ),
            "duration_seconds": 120,
            "completed": True,
        },
    )

    assert response.status_code == 201

    return response.json()


def test_anxiety_sessions_require_authentication(
    client: TestClient,
) -> None:
    response = client.get(
        ANXIETY_URL
    )

    assert response.status_code == 401


def test_create_anxiety_session(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    session = create_session(
        client,
        headers,
    )

    assert session[
        "exercise_type"
    ] == "box_breathing"

    assert session[
        "duration_seconds"
    ] == 120

    assert session[
        "completed"
    ] is True


def test_list_anxiety_sessions(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    create_session(
        client,
        headers,
    )

    response = client.get(
        ANXIETY_URL,
        headers=headers,
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_anxiety_summary(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    create_session(
        client,
        headers,
    )

    response = client.get(
        f"{ANXIETY_URL}/summary",
        headers=headers,
    )

    assert response.status_code == 200

    summary = response.json()

    assert summary["sessions_today"] == 1
    assert summary["minutes_today"] == 2
    assert summary["total_sessions"] == 1
    assert summary["total_minutes"] == 2
    assert summary[
        "favourite_exercise"
    ] == "box_breathing"


def test_delete_anxiety_session(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    session = create_session(
        client,
        headers,
    )

    response = client.delete(
        (
            f"{ANXIETY_URL}/"
            f"{session['id']}"
        ),
        headers=headers,
    )

    assert response.status_code == 204

    list_response = client.get(
        ANXIETY_URL,
        headers=headers,
    )

    assert list_response.json() == []


def test_invalid_exercise_is_rejected(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    response = client.post(
        ANXIETY_URL,
        headers=headers,
        json={
            "exercise_type": (
                "invalid_exercise"
            ),
            "duration_seconds": 30,
            "completed": True,
        },
    )

    assert response.status_code == 422


def test_users_cannot_delete_other_sessions(
    client: TestClient,
) -> None:
    owner_headers = auth_headers(
        client,
        "anxiety-owner@aksess.app",
    )

    other_headers = auth_headers(
        client,
        "anxiety-other@aksess.app",
    )

    session = create_session(
        client,
        owner_headers,
    )

    response = client.delete(
        (
            f"{ANXIETY_URL}/"
            f"{session['id']}"
        ),
        headers=other_headers,
    )

    assert response.status_code == 404
