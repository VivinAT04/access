from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"

RESOURCES_URL = (
    "/api/v1/support/resources"
)

EXPERTS_URL = (
    "/api/v1/support/experts"
)

SAFEGUARDING_URL = (
    "/api/v1/support/safeguarding"
)


def create_headers(
    client: TestClient,
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email":
                "support@aksess.app",
            "full_name":
                "Support User",
            "password":
                "StrongPassword123!",
        },
    )

    response = client.post(
        TOKEN_URL,
        data={
            "username":
                "support@aksess.app",
            "password":
                "StrongPassword123!",
        },
    )

    token = response.json()[
        "access_token"
    ]

    return {
        "Authorization":
            f"Bearer {token}",
    }


def test_support_requires_authentication(
    client: TestClient,
) -> None:
    response = client.get(
        RESOURCES_URL
    )

    assert (
        response.status_code
        == 401
    )


def test_resources_returned(
    client: TestClient,
) -> None:
    headers = create_headers(
        client
    )

    response = client.get(
        RESOURCES_URL,
        headers=headers,
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert len(data) >= 4

    assert "title" in data[0]
    assert "content" in data[0]


def test_expert_directory(
    client: TestClient,
) -> None:
    headers = create_headers(
        client
    )

    response = client.get(
        EXPERTS_URL,
        headers=headers,
    )

    assert (
        response.status_code
        == 200
    )

    assert len(
        response.json()
    ) >= 3


def test_safeguarding_guide(
    client: TestClient,
) -> None:
    headers = create_headers(
        client
    )

    response = client.get(
        SAFEGUARDING_URL,
        headers=headers,
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        len(
            data["principles"]
        )
        >= 4
    )
