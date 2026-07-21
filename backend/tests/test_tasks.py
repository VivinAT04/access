from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
TASKS_URL = "/api/v1/tasks"


def create_headers(
    client: TestClient,
    email: str = "tasks@aksess.app",
) -> dict[str, str]:
    password = "StrongPassword123!"

    register_response = client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name": "Task User",
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

    token = token_response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


def create_task(
    client: TestClient,
    headers: dict[str, str],
    title: str = "Finish assignment",
) -> dict[str, object]:
    response = client.post(
        TASKS_URL,
        headers=headers,
        json={
            "title": title,
            "description": "Complete the final section.",
            "priority": "high",
            "status": "pending",
            "due_date": "2026-08-01T12:00:00Z",
        },
    )

    assert response.status_code == 201

    return response.json()


def test_tasks_require_authentication(
    client: TestClient,
) -> None:
    response = client.get(TASKS_URL)

    assert response.status_code == 401


def test_create_task(
    client: TestClient,
) -> None:
    headers = create_headers(client)

    task = create_task(
        client=client,
        headers=headers,
    )

    assert task["title"] == "Finish assignment"
    assert task["priority"] == "high"
    assert task["status"] == "pending"
    assert task["is_completed"] is False


def test_list_tasks(
    client: TestClient,
) -> None:
    headers = create_headers(client)

    create_task(
        client=client,
        headers=headers,
        title="First task",
    )

    create_task(
        client=client,
        headers=headers,
        title="Second task",
    )

    response = client.get(
        TASKS_URL,
        headers=headers,
    )

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_filter_tasks_by_status(
    client: TestClient,
) -> None:
    headers = create_headers(client)

    first_task = create_task(
        client=client,
        headers=headers,
        title="Pending task",
    )

    second_task = create_task(
        client=client,
        headers=headers,
        title="Completed task",
    )

    client.patch(
        (
            f"{TASKS_URL}/{second_task['id']}"
            "/complete?completed=true"
        ),
        headers=headers,
    )

    response = client.get(
        f"{TASKS_URL}?status=completed",
        headers=headers,
    )

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] != first_task["id"]
    assert response.json()[0]["status"] == "completed"


def test_read_single_task(
    client: TestClient,
) -> None:
    headers = create_headers(client)
    task = create_task(client, headers)

    response = client.get(
        f"{TASKS_URL}/{task['id']}",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["id"] == task["id"]


def test_update_task(
    client: TestClient,
) -> None:
    headers = create_headers(client)
    task = create_task(client, headers)

    response = client.put(
        f"{TASKS_URL}/{task['id']}",
        headers=headers,
        json={
            "title": "Updated assignment",
            "priority": "urgent",
            "status": "in-progress",
        },
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Updated assignment"
    assert response.json()["priority"] == "urgent"
    assert response.json()["status"] == "in-progress"


def test_complete_and_reopen_task(
    client: TestClient,
) -> None:
    headers = create_headers(client)
    task = create_task(client, headers)

    completed_response = client.patch(
        (
            f"{TASKS_URL}/{task['id']}"
            "/complete?completed=true"
        ),
        headers=headers,
    )

    assert completed_response.status_code == 200
    assert completed_response.json()["is_completed"] is True
    assert completed_response.json()["status"] == "completed"

    reopened_response = client.patch(
        (
            f"{TASKS_URL}/{task['id']}"
            "/complete?completed=false"
        ),
        headers=headers,
    )

    assert reopened_response.status_code == 200
    assert reopened_response.json()["is_completed"] is False
    assert reopened_response.json()["status"] == "pending"


def test_delete_task(
    client: TestClient,
) -> None:
    headers = create_headers(client)
    task = create_task(client, headers)

    delete_response = client.delete(
        f"{TASKS_URL}/{task['id']}",
        headers=headers,
    )

    assert delete_response.status_code == 204

    read_response = client.get(
        f"{TASKS_URL}/{task['id']}",
        headers=headers,
    )

    assert read_response.status_code == 404


def test_users_cannot_access_other_users_tasks(
    client: TestClient,
) -> None:
    owner_headers = create_headers(
        client,
        "task-owner@aksess.app",
    )

    other_headers = create_headers(
        client,
        "other-user@aksess.app",
    )

    task = create_task(
        client,
        owner_headers,
    )

    response = client.get(
        f"{TASKS_URL}/{task['id']}",
        headers=other_headers,
    )

    assert response.status_code == 404


def test_task_summary(
    client: TestClient,
) -> None:
    headers = create_headers(client)

    create_task(
        client,
        headers,
        "Pending task",
    )

    completed_task = create_task(
        client,
        headers,
        "Completed task",
    )

    client.patch(
        (
            f"{TASKS_URL}/{completed_task['id']}"
            "/complete?completed=true"
        ),
        headers=headers,
    )

    response = client.get(
        f"{TASKS_URL}/summary",
        headers=headers,
    )

    assert response.status_code == 200

    summary = response.json()

    assert summary["total"] == 2
    assert summary["pending"] == 1
    assert summary["completed"] == 1


def test_invalid_priority_is_rejected(
    client: TestClient,
) -> None:
    headers = create_headers(client)

    response = client.post(
        TASKS_URL,
        headers=headers,
        json={
            "title": "Invalid task",
            "priority": "extreme",
        },
    )

    assert response.status_code == 422
