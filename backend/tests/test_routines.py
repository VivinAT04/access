from datetime import date

from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
ROUTINE_URL = "/api/v1/routines"


def auth_headers(
    client: TestClient,
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email":
                "routine@aksess.app",
            "full_name":
                "Routine User",
            "password":
                "StrongPassword123!",
        },
    )

    response = client.post(
        TOKEN_URL,
        data={
            "username":
                "routine@aksess.app",
            "password":
                "StrongPassword123!",
        },
    )

    return {
        "Authorization":
            "Bearer "
            + response.json()[
                "access_token"
            ]
    }


def create_routine(
    client: TestClient,
    headers: dict[str, str],
) -> dict[str, object]:
    response = client.post(
        ROUTINE_URL,
        headers=headers,
        json={
            "title": "Morning routine",
            "category": "morning",
            "steps": [
                {
                    "title": "Drink water",
                    "position": 0,
                },
                {
                    "title": "Plan the day",
                    "position": 1,
                },
            ],
        },
    )

    assert response.status_code == 201

    return response.json()


def test_create_and_list_routines(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    routine = create_routine(
        client,
        headers,
    )

    assert len(
        routine["steps"]
    ) == 2

    response = client.get(
        ROUTINE_URL,
        headers=headers,
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_start_and_complete_routine(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    routine = create_routine(
        client,
        headers,
    )

    response = client.post(
        (
            f"{ROUTINE_URL}/"
            f"{routine['id']}/start"
        ),
        headers=headers,
        params={
            "run_date":
                date.today().isoformat()
        },
    )

    assert response.status_code == 201

    run = response.json()

    for step in run["steps"]:
        completion = client.patch(
            (
                f"{ROUTINE_URL}/"
                f"run-steps/{step['id']}"
                "/complete"
            ),
            headers=headers,
            params={
                "completed": True
            },
        )

        assert (
            completion.status_code
            == 200
        )

    assert completion.json()[
        "status"
    ] == "completed"

    assert completion.json()[
        "progress_percentage"
    ] == 100


def test_duplicate_routine(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    routine = create_routine(
        client,
        headers,
    )

    response = client.post(
        (
            f"{ROUTINE_URL}/"
            f"{routine['id']}/duplicate"
        ),
        headers=headers,
    )

    assert response.status_code == 201
    assert response.json()[
        "title"
    ].endswith("copy")


def test_delete_routine(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    routine = create_routine(
        client,
        headers,
    )

    response = client.delete(
        (
            f"{ROUTINE_URL}/"
            f"{routine['id']}"
        ),
        headers=headers,
    )

    assert response.status_code == 204
