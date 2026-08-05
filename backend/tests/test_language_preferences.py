from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"

LANGUAGE_URL = (
    "/api/v1/language-preferences"
)


def auth_headers(
    client: TestClient,
    email: str = "language@aksess.app",
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name":
                "Language User",
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


def test_default_language_preference(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    response = client.get(
        LANGUAGE_URL,
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["locale"] == "en-GB"

    assert data["direction"] == "auto"

    assert (
        data["letter_spacing"]
        == "normal"
    )

    assert (
        data["dyslexia_friendly"]
        is False
    )


def test_update_language_preference(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    response = client.put(
        LANGUAGE_URL,
        headers=headers,
        json={
            "locale": "ta-IN",
            "direction": "ltr",
            "letter_spacing":
                "relaxed",
            "dyslexia_friendly":
                True,
            "reading_guide": True,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["locale"] == "ta-IN"

    assert (
        data["letter_spacing"]
        == "relaxed"
    )

    assert (
        data["reading_guide"]
        is True
    )


def test_rtl_language_supported(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    response = client.put(
        LANGUAGE_URL,
        headers=headers,
        json={
            "locale": "ar-SA",
            "direction": "rtl",
        },
    )

    assert response.status_code == 200

    assert (
        response.json()[
            "direction"
        ]
        == "rtl"
    )


def test_custom_locale_supported(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    response = client.put(
        LANGUAGE_URL,
        headers=headers,
        json={
            "locale":
                "zh-Hant-TW",
        },
    )

    assert response.status_code == 200

    assert (
        response.json()[
            "locale"
        ]
        == "zh-Hant-TW"
    )


def test_invalid_locale_rejected(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    response = client.put(
        LANGUAGE_URL,
        headers=headers,
        json={
            "locale":
                "not a locale",
        },
    )

    assert response.status_code == 422


def test_users_have_separate_preferences(
    client: TestClient,
) -> None:
    first_headers = auth_headers(
        client,
        "language-one@aksess.app",
    )

    second_headers = auth_headers(
        client,
        "language-two@aksess.app",
    )

    client.put(
        LANGUAGE_URL,
        headers=first_headers,
        json={
            "locale": "ta-IN",
        },
    )

    response = client.get(
        LANGUAGE_URL,
        headers=second_headers,
    )

    assert response.status_code == 200

    assert (
        response.json()[
            "locale"
        ]
        == "en-GB"
    )
