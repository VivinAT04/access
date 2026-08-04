from datetime import date

from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
REFLECTION_URL = "/api/v1/reflections"


def auth_headers(
    client: TestClient,
    email: str = (
        "reflection@aksess.app"
    ),
) -> dict[str, str]:
    password = "StrongPassword123!"

    register_response = client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name": (
                "Reflection User"
            ),
            "password": password,
        },
    )

    assert (
        register_response.status_code
        == 201
    )

    token_response = client.post(
        TOKEN_URL,
        data={
            "username": email,
            "password": password,
        },
    )

    assert (
        token_response.status_code
        == 200
    )

    token = token_response.json()[
        "access_token"
    ]

    return {
        "Authorization": (
            f"Bearer {token}"
        ),
    }


def create_reflection(
    client: TestClient,
    headers: dict[str, str],
) -> dict[str, object]:
    response = client.post(
        REFLECTION_URL,
        headers=headers,
        json={
            "reflection_date": (
                date.today().isoformat()
            ),
            "good_thing": (
                "I completed an important task."
            ),
            "challenge": (
                "I found it difficult to begin."
            ),
            "accomplishment": (
                "I worked for twenty minutes."
            ),
            "note": (
                "Starting small helped."
            ),
        },
    )

    assert response.status_code == 201

    return response.json()


def test_reflections_require_authentication(
    client: TestClient,
) -> None:
    response = client.get(
        REFLECTION_URL
    )

    assert response.status_code == 401


def test_create_reflection(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    reflection = create_reflection(
        client,
        headers,
    )

    assert reflection["good_thing"] == (
        "I completed an important task."
    )

    assert reflection["challenge"] == (
        "I found it difficult to begin."
    )


def test_only_one_reflection_per_date(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    create_reflection(
        client,
        headers,
    )

    response = client.post(
        REFLECTION_URL,
        headers=headers,
        json={
            "reflection_date": (
                date.today().isoformat()
            ),
            "good_thing": "Another good thing.",
            "challenge": "Another challenge.",
            "accomplishment": (
                "Another accomplishment."
            ),
        },
    )

    assert response.status_code == 409


def test_list_reflections(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    create_reflection(
        client,
        headers,
    )

    response = client.get(
        REFLECTION_URL,
        headers=headers,
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_update_reflection(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    reflection = create_reflection(
        client,
        headers,
    )

    response = client.put(
        (
            f"{REFLECTION_URL}/"
            f"{reflection['id']}"
        ),
        headers=headers,
        json={
            "good_thing": (
                "I spoke to a friend."
            ),
            "challenge": (
                "I felt overwhelmed."
            ),
            "accomplishment": (
                "I asked for help."
            ),
            "note": (
                "Support made things easier."
            ),
        },
    )

    assert response.status_code == 200
    assert response.json()[
        "accomplishment"
    ] == "I asked for help."


def test_reflection_summary(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    create_reflection(
        client,
        headers,
    )

    response = client.get(
        (
            f"{REFLECTION_URL}/summary"
            f"?today={date.today().isoformat()}"
        ),
        headers=headers,
    )

    assert response.status_code == 200

    summary = response.json()

    assert summary[
        "total_reflections"
    ] == 1

    assert summary[
        "reflected_today"
    ] is True

    assert summary[
        "current_streak"
    ] == 1


def test_delete_reflection(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    reflection = create_reflection(
        client,
        headers,
    )

    response = client.delete(
        (
            f"{REFLECTION_URL}/"
            f"{reflection['id']}"
        ),
        headers=headers,
    )

    assert response.status_code == 204

    list_response = client.get(
        REFLECTION_URL,
        headers=headers,
    )

    assert list_response.json() == []


def test_users_cannot_access_other_reflections(
    client: TestClient,
) -> None:
    owner_headers = auth_headers(
        client,
        "reflection-owner@aksess.app",
    )

    other_headers = auth_headers(
        client,
        "reflection-other@aksess.app",
    )

    reflection = create_reflection(
        client,
        owner_headers,
    )

    response = client.delete(
        (
            f"{REFLECTION_URL}/"
            f"{reflection['id']}"
        ),
        headers=other_headers,
    )

    assert response.status_code == 404
