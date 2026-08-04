from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
TASK_URL = "/api/v1/tasks"
SUBTASK_URL = "/api/v1/subtasks"


def auth_headers(
    client: TestClient,
    email: str = "subtasks@aksess.app",
) -> dict[str, str]:
    password = "StrongPassword123!"

    register_response = client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name": "Subtask User",
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


def create_task(
    client: TestClient,
    headers: dict[str, str],
) -> dict[str, object]:
    response = client.post(
        TASK_URL,
        headers=headers,
        json={
            "title": "Complete project",
            "description": "Break it down.",
            "priority": "high",
            "status": "pending",
            "due_date": None,
        },
    )

    assert response.status_code == 201

    return response.json()


def create_subtask(
    client: TestClient,
    headers: dict[str, str],
    task_id: str,
    title: str = "Write introduction",
) -> dict[str, object]:
    response = client.post(
        SUBTASK_URL,
        headers=headers,
        json={
            "task_id": task_id,
            "title": title,
            "description": None,
        },
    )

    assert response.status_code == 201

    return response.json()


def test_subtasks_require_authentication(
    client: TestClient,
) -> None:
    response = client.get(
        SUBTASK_URL,
        params={
            "task_id":
                "00000000-0000-0000-0000-000000000000"
        },
    )

    assert response.status_code == 401


def test_create_and_list_subtasks(
    client: TestClient,
) -> None:
    headers = auth_headers(client)
    task = create_task(client, headers)

    create_subtask(
        client,
        headers,
        str(task["id"]),
    )

    response = client.get(
        SUBTASK_URL,
        headers=headers,
        params={
            "task_id": task["id"],
        },
    )

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0][
        "title"
    ] == "Write introduction"


def test_subtask_positions_are_automatic(
    client: TestClient,
) -> None:
    headers = auth_headers(client)
    task = create_task(client, headers)

    first = create_subtask(
        client,
        headers,
        str(task["id"]),
        "First step",
    )

    second = create_subtask(
        client,
        headers,
        str(task["id"]),
        "Second step",
    )

    assert first["position"] == 0
    assert second["position"] == 1


def test_complete_subtask_updates_progress(
    client: TestClient,
) -> None:
    headers = auth_headers(client)
    task = create_task(client, headers)

    first = create_subtask(
        client,
        headers,
        str(task["id"]),
        "First step",
    )

    create_subtask(
        client,
        headers,
        str(task["id"]),
        "Second step",
    )

    completion_response = client.patch(
        (
            f"{SUBTASK_URL}/"
            f"{first['id']}/complete"
        ),
        headers=headers,
        params={
            "completed": True,
        },
    )

    assert (
        completion_response.status_code
        == 200
    )

    progress_response = client.get(
        (
            f"{SUBTASK_URL}/progress/"
            f"{task['id']}"
        ),
        headers=headers,
    )

    assert progress_response.status_code == 200

    progress = progress_response.json()

    assert progress[
        "total_subtasks"
    ] == 2

    assert progress[
        "completed_subtasks"
    ] == 1

    assert progress[
        "progress_percentage"
    ] == 50


def test_completing_all_subtasks_completes_parent(
    client: TestClient,
) -> None:
    headers = auth_headers(client)
    task = create_task(client, headers)

    first = create_subtask(
        client,
        headers,
        str(task["id"]),
        "First step",
    )

    second = create_subtask(
        client,
        headers,
        str(task["id"]),
        "Second step",
    )

    for subtask in [
        first,
        second,
    ]:
        response = client.patch(
            (
                f"{SUBTASK_URL}/"
                f"{subtask['id']}/complete"
            ),
            headers=headers,
            params={
                "completed": True,
            },
        )

        assert response.status_code == 200

    task_response = client.get(
        f"{TASK_URL}/{task['id']}",
        headers=headers,
    )

    assert task_response.status_code == 200
    assert task_response.json()[
        "is_completed"
    ] is True

    assert task_response.json()[
        "status"
    ] == "completed"


def test_reopening_subtask_reopens_parent(
    client: TestClient,
) -> None:
    headers = auth_headers(client)
    task = create_task(client, headers)

    subtask = create_subtask(
        client,
        headers,
        str(task["id"]),
    )

    client.patch(
        (
            f"{SUBTASK_URL}/"
            f"{subtask['id']}/complete"
        ),
        headers=headers,
        params={
            "completed": True,
        },
    )

    reopen_response = client.patch(
        (
            f"{SUBTASK_URL}/"
            f"{subtask['id']}/complete"
        ),
        headers=headers,
        params={
            "completed": False,
        },
    )

    assert reopen_response.status_code == 200

    task_response = client.get(
        f"{TASK_URL}/{task['id']}",
        headers=headers,
    )

    assert task_response.json()[
        "is_completed"
    ] is False

    assert task_response.json()[
        "status"
    ] == "pending"


def test_update_subtask(
    client: TestClient,
) -> None:
    headers = auth_headers(client)
    task = create_task(client, headers)

    subtask = create_subtask(
        client,
        headers,
        str(task["id"]),
    )

    response = client.put(
        (
            f"{SUBTASK_URL}/"
            f"{subtask['id']}"
        ),
        headers=headers,
        json={
            "title": "Updated step",
            "description":
                "Updated description",
        },
    )

    assert response.status_code == 200
    assert response.json()[
        "title"
    ] == "Updated step"


def test_reorder_subtasks(
    client: TestClient,
) -> None:
    headers = auth_headers(client)
    task = create_task(client, headers)

    first = create_subtask(
        client,
        headers,
        str(task["id"]),
        "First",
    )

    second = create_subtask(
        client,
        headers,
        str(task["id"]),
        "Second",
    )

    response = client.patch(
        (
            f"{SUBTASK_URL}/reorder/"
            f"{task['id']}"
        ),
        headers=headers,
        json={
            "items": [
                {
                    "id": first["id"],
                    "position": 1,
                },
                {
                    "id": second["id"],
                    "position": 0,
                },
            ],
        },
    )

    assert response.status_code == 200
    assert response.json()[0][
        "id"
    ] == second["id"]


def test_delete_subtask(
    client: TestClient,
) -> None:
    headers = auth_headers(client)
    task = create_task(client, headers)

    subtask = create_subtask(
        client,
        headers,
        str(task["id"]),
    )

    response = client.delete(
        (
            f"{SUBTASK_URL}/"
            f"{subtask['id']}"
        ),
        headers=headers,
    )

    assert response.status_code == 204

    list_response = client.get(
        SUBTASK_URL,
        headers=headers,
        params={
            "task_id": task["id"],
        },
    )

    assert list_response.json() == []


def test_user_cannot_access_another_users_subtasks(
    client: TestClient,
) -> None:
    owner_headers = auth_headers(
        client,
        "subtask-owner@aksess.app",
    )

    other_headers = auth_headers(
        client,
        "subtask-other@aksess.app",
    )

    task = create_task(
        client,
        owner_headers,
    )

    subtask = create_subtask(
        client,
        owner_headers,
        str(task["id"]),
    )

    response = client.delete(
        (
            f"{SUBTASK_URL}/"
            f"{subtask['id']}"
        ),
        headers=other_headers,
    )

    assert response.status_code == 404
