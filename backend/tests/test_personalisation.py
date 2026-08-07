from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
BASE_URL = "/api/v1/personalisation"
PRIVACY_URL = "/api/v1/privacy/preferences"


def headers_for(
    client: TestClient,
    email: str,
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name": "Personalisation User",
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


def test_personalisation_requires_auth(
    client: TestClient,
) -> None:
    response = client.get(
        f"{BASE_URL}/profile"
    )

    assert response.status_code == 401


def test_default_profile_is_opted_out(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "personal1@aksess.app",
    )

    response = client.get(
        f"{BASE_URL}/profile",
        headers=headers,
    )

    assert response.status_code == 200

    assert response.json()[
        "adaptive_personalisation_enabled"
    ] is False


def test_update_preferences(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "personal2@aksess.app",
    )

    response = client.put(
        f"{BASE_URL}/preferences",
        headers=headers,
        json={
            "preferred_focus_minutes": 15,
            "preferred_support_style": "calm-first",
            "preferred_energy_level": "low",
            "preferred_prompt_style": "gentle",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data[
        "preferred_focus_minutes"
    ] == 15

    assert data[
        "preferred_support_style"
    ] == "calm-first"


def test_recommendations_blocked_without_opt_in(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "personal3@aksess.app",
    )

    response = client.post(
        f"{BASE_URL}/recommendations",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data[
        "enabled"
    ] is False

    assert data[
        "recommendations"
    ] == []


def test_generate_recommendations_after_opt_in(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "personal4@aksess.app",
    )

    privacy = client.put(
        PRIVACY_URL,
        headers=headers,
        json={
            "adaptive_personalisation": True,
        },
    )

    assert privacy.status_code == 200

    response = client.post(
        f"{BASE_URL}/recommendations",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data[
        "enabled"
    ] is True

    assert len(
        data[
            "recommendations"
        ]
    ) >= 2


def test_feedback_and_history(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "personal5@aksess.app",
    )

    client.put(
        PRIVACY_URL,
        headers=headers,
        json={
            "adaptive_personalisation": True,
        },
    )

    generated = client.post(
        f"{BASE_URL}/recommendations",
        headers=headers,
    ).json()

    recommendation_id = (
        generated[
            "recommendations"
        ][0]["id"]
    )

    feedback = client.patch(
        (
            f"{BASE_URL}/recommendations/"
            f"{recommendation_id}/feedback"
        ),
        headers=headers,
        json={
            "feedback": "helpful",
        },
    )

    assert feedback.status_code == 200

    assert feedback.json()[
        "feedback"
    ] == "helpful"

    history = client.get(
        f"{BASE_URL}/history",
        headers=headers,
    )

    assert history.status_code == 200

    assert len(
        history.json()[
            "recommendations"
        ]
    ) >= 1


def test_reset_personalisation(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "personal6@aksess.app",
    )

    client.put(
        f"{BASE_URL}/preferences",
        headers=headers,
        json={
            "preferred_focus_minutes": 45,
        },
    )

    response = client.delete(
        f"{BASE_URL}/reset",
        headers=headers,
    )

    assert response.status_code == 200

    preferences = client.get(
        f"{BASE_URL}/preferences",
        headers=headers,
    )

    assert preferences.json()[
        "preferred_focus_minutes"
    ] == 25
