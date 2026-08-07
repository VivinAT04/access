from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"

VOICE_URL = "/api/v1/voice"

PRIVACY_URL = (
    "/api/v1/privacy/preferences"
)


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
                "Voice User",

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

    assert (
        response.status_code
        == 200
    )

    token = response.json()[
        "access_token"
    ]

    return {
        "Authorization":
            f"Bearer {token}",
    }


def test_voice_requires_auth(
    client: TestClient,
) -> None:
    response = client.get(
        f"{VOICE_URL}/preferences"
    )

    assert (
        response.status_code
        == 401
    )


def test_voice_privacy_off_by_default(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "voice1@aksess.app",
    )

    response = client.get(
        f"{VOICE_URL}/privacy",
        headers=headers,
    )

    assert (
        response.status_code
        == 200
    )

    assert (
        response.json()[
            "enabled"
        ]
        is False
    )


def test_enable_voice_privacy(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "voice2@aksess.app",
    )

    privacy = client.put(
        PRIVACY_URL,
        headers=headers,
        json={
            "voice_processing_enabled":
                True,
        },
    )

    assert (
        privacy.status_code
        == 200
    )

    response = client.get(
        f"{VOICE_URL}/privacy",
        headers=headers,
    )

    assert (
        response.json()[
            "enabled"
        ]
        is True
    )


def test_default_voice_preferences(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "voice3@aksess.app",
    )

    response = client.get(
        f"{VOICE_URL}/preferences",
        headers=headers,
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data[
            "speech_rate"
        ]
        == 0.95
    )

    assert (
        data[
            "language"
        ]
        == "en-GB"
    )


def test_update_voice_preferences(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "voice4@aksess.app",
    )

    response = client.put(
        f"{VOICE_URL}/preferences",
        headers=headers,
        json={
            "language":
                "ta-IN",

            "speech_rate":
                0.8,

            "speech_pitch":
                1.1,

            "speech_volume":
                0.75,

            "auto_read_guidance":
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
            "language"
        ]
        == "ta-IN"
    )

    assert (
        data[
            "speech_rate"
        ]
        == 0.8
    )


def test_voice_guides(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "voice5@aksess.app",
    )

    response = client.get(
        f"{VOICE_URL}/guides",
        headers=headers,
    )

    assert (
        response.status_code
        == 200
    )

    guides = response.json()[
        "guides"
    ]

    assert (
        len(guides)
        >= 5
    )

    ids = {
        guide[
            "id"
        ]
        for guide in guides
    }

    assert (
        "calm-breathing"
        in ids
    )
