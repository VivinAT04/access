from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
MOOD_URL = "/api/v1/mood-checkins"


def auth_headers(
    client: TestClient,
    email: str = "mood@aksess.app",
) -> dict[str, str]:
    password = "StrongPassword123!"

    register_response = client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name": "Mood User",
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


def create_checkin(
    client: TestClient,
    headers: dict[str, str],
) -> dict[str, object]:
    response = client.post(
        MOOD_URL,
        headers=headers,
        json={
            "mood_score": 4,
            "energy_level": 3,
            "stress_level": 2,
            "emotions": [
                "calm",
                "hopeful",
            ],
            "note": "Feeling productive today.",
        },
    )

    assert response.status_code == 201

    return response.json()


def test_mood_requires_authentication(
    client: TestClient,
) -> None:
    response = client.get(MOOD_URL)

    assert response.status_code == 401


def test_create_mood_checkin(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    checkin = create_checkin(
        client,
        headers,
    )

    assert checkin["mood_score"] == 4
    assert checkin["energy_level"] == 3
    assert checkin["stress_level"] == 2
    assert checkin["emotions"] == [
        "calm",
        "hopeful",
    ]


def test_list_mood_checkins(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    create_checkin(
        client,
        headers,
    )

    response = client.get(
        MOOD_URL,
        headers=headers,
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_mood_summary(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    create_checkin(
        client,
        headers,
    )

    response = client.get(
        f"{MOOD_URL}/summary",
        headers=headers,
    )

    assert response.status_code == 200

    summary = response.json()

    assert summary["entries_today"] == 1
    assert summary["total_entries"] == 1
    assert summary["average_mood"] == 4.0
    assert summary["average_energy"] == 3.0
    assert summary["average_stress"] == 2.0


def test_delete_mood_checkin(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    checkin = create_checkin(
        client,
        headers,
    )

    response = client.delete(
        f"{MOOD_URL}/{checkin['id']}",
        headers=headers,
    )

    assert response.status_code == 204

    list_response = client.get(
        MOOD_URL,
        headers=headers,
    )

    assert list_response.json() == []


def test_invalid_score_is_rejected(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    response = client.post(
        MOOD_URL,
        headers=headers,
        json={
            "mood_score": 7,
            "energy_level": 3,
            "stress_level": 2,
            "emotions": [],
        },
    )

    assert response.status_code == 422


def test_users_cannot_delete_other_checkins(
    client: TestClient,
) -> None:
    owner_headers = auth_headers(
        client,
        "mood-owner@aksess.app",
    )

    other_headers = auth_headers(
        client,
        "mood-other@aksess.app",
    )

    checkin = create_checkin(
        client,
        owner_headers,
    )

    response = client.delete(
        f"{MOOD_URL}/{checkin['id']}",
        headers=other_headers,
    )

    assert response.status_code == 404
