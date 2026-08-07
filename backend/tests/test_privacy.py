from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"

PREFERENCES_URL = (
    "/api/v1/privacy/preferences"
)

SUMMARY_URL = (
    "/api/v1/privacy/summary"
)


def create_headers(
    client: TestClient,
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email":
                "privacy@aksess.app",
            "full_name":
                "Privacy User",
            "password":
                "StrongPassword123!",
        },
    )

    response = client.post(
        TOKEN_URL,
        data={
            "username":
                "privacy@aksess.app",
            "password":
                "StrongPassword123!",
        },
    )

    token = (
        response.json()[
            "access_token"
        ]
    )

    return {
        "Authorization":
            f"Bearer {token}",
    }


def test_privacy_requires_authentication(
    client: TestClient,
) -> None:
    response = client.get(
        PREFERENCES_URL
    )

    assert (
        response.status_code
        == 401
    )


def test_default_privacy_preferences(
    client: TestClient,
) -> None:
    headers = create_headers(
        client
    )

    response = client.get(
        PREFERENCES_URL,
        headers=headers,
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data[
            "adaptive_personalisation"
        ]
        is False
    )

    assert (
        data[
            "wearable_data_enabled"
        ]
        is False
    )

    assert (
        data[
            "voice_processing_enabled"
        ]
        is False
    )

    assert (
        data[
            "research_data_sharing"
        ]
        is False
    )


def test_privacy_preferences_update(
    client: TestClient,
) -> None:
    headers = create_headers(
        client
    )

    response = client.put(
        PREFERENCES_URL,
        headers=headers,
        json={
            "adaptive_personalisation":
                True,
            "voice_processing_enabled":
                True,
        },
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data[
            "adaptive_personalisation"
        ]
        is True
    )

    assert (
        data[
            "voice_processing_enabled"
        ]
        is True
    )


def test_privacy_summary(
    client: TestClient,
) -> None:
    headers = create_headers(
        client
    )

    response = client.get(
        SUMMARY_URL,
        headers=headers,
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert len(
        data["categories"]
    ) >= 4
