from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
PREFERENCES_URL = "/api/v1/accessibility/preferences"


def create_authenticated_headers(
    client: TestClient,
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email": "accessibility@aksess.app",
            "full_name": "Accessibility User",
            "password": "StrongPassword123!",
        },
    )

    response = client.post(
        TOKEN_URL,
        data={
            "username": "accessibility@aksess.app",
            "password": "StrongPassword123!",
        },
    )

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


def test_preferences_require_authentication(
    client: TestClient,
) -> None:
    response = client.get(PREFERENCES_URL)

    assert response.status_code == 401


def test_default_preferences_are_created(
    client: TestClient,
) -> None:
    headers = create_authenticated_headers(client)

    response = client.get(
        PREFERENCES_URL,
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["font_size"] == "medium"
    assert data["high_contrast"] is False
    assert data["reduced_motion"] is False
    assert data["dyslexia_friendly_font"] is False
    assert data["increased_spacing"] is False
    assert data["simplified_interface"] is False
    assert data["screen_reader_optimised"] is False


def test_preferences_are_not_duplicated(
    client: TestClient,
) -> None:
    headers = create_authenticated_headers(client)

    first_response = client.get(
        PREFERENCES_URL,
        headers=headers,
    )

    second_response = client.get(
        PREFERENCES_URL,
        headers=headers,
    )

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert (
        first_response.json()["id"]
        == second_response.json()["id"]
    )


def test_preferences_can_be_updated(
    client: TestClient,
) -> None:
    headers = create_authenticated_headers(client)

    response = client.put(
        PREFERENCES_URL,
        headers=headers,
        json={
            "font_size": "large",
            "high_contrast": True,
            "reduced_motion": True,
            "increased_spacing": True,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["font_size"] == "large"
    assert data["high_contrast"] is True
    assert data["reduced_motion"] is True
    assert data["increased_spacing"] is True


def test_invalid_font_size_is_rejected(
    client: TestClient,
) -> None:
    headers = create_authenticated_headers(client)

    response = client.put(
        PREFERENCES_URL,
        headers=headers,
        json={
            "font_size": "enormous",
        },
    )

    assert response.status_code == 422
