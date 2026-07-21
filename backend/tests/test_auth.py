from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
ME_URL = "/api/v1/auth/me"


def register_test_user(
    client: TestClient,
) -> dict[str, object]:
    response = client.post(
        REGISTER_URL,
        json={
            "email": "vivin@example.com",
            "full_name": "Vivin Thambidurai",
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 201

    return response.json()


def login_test_user(
    client: TestClient,
) -> str:
    response = client.post(
        TOKEN_URL,
        data={
            "username": "vivin@example.com",
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def test_register_user(
    client: TestClient,
) -> None:
    user = register_test_user(client)

    assert user["email"] == "vivin@example.com"
    assert user["full_name"] == "Vivin Thambidurai"
    assert user["is_active"] is True
    assert user["is_verified"] is False
    assert "hashed_password" not in user
    assert "password" not in user


def test_register_duplicate_email(
    client: TestClient,
) -> None:
    register_test_user(client)

    response = client.post(
        REGISTER_URL,
        json={
            "email": "VIVIN@example.com",
            "full_name": "Another User",
            "password": "AnotherPassword123!",
        },
    )

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "An account with this email already exists."
    )


def test_register_invalid_email(
    client: TestClient,
) -> None:
    response = client.post(
        REGISTER_URL,
        json={
            "email": "not-an-email",
            "full_name": "Test User",
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 422


def test_register_short_password(
    client: TestClient,
) -> None:
    response = client.post(
        REGISTER_URL,
        json={
            "email": "user@example.com",
            "full_name": "Test User",
            "password": "short",
        },
    )

    assert response.status_code == 422


def test_login_successfully(
    client: TestClient,
) -> None:
    register_test_user(client)

    response = client.post(
        TOKEN_URL,
        data={
            "username": "vivin@example.com",
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]


def test_login_with_incorrect_password(
    client: TestClient,
) -> None:
    register_test_user(client)

    response = client.post(
        TOKEN_URL,
        data={
            "username": "vivin@example.com",
            "password": "IncorrectPassword",
        },
    )

    assert response.status_code == 401


def test_get_current_user(
    client: TestClient,
) -> None:
    register_test_user(client)
    token = login_test_user(client)

    response = client.get(
        ME_URL,
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200
    assert response.json()["email"] == (
        "vivin@example.com"
    )
    assert response.json()["full_name"] == (
        "Vivin Thambidurai"
    )


def test_get_current_user_without_token(
    client: TestClient,
) -> None:
    response = client.get(ME_URL)

    assert response.status_code == 401


def test_get_current_user_with_invalid_token(
    client: TestClient,
) -> None:
    response = client.get(
        ME_URL,
        headers={
            "Authorization": "Bearer invalid-token"
        },
    )

    assert response.status_code == 401
