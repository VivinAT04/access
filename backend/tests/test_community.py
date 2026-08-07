from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
COMMUNITY_URL = "/api/v1/community"


def create_user(
    client: TestClient,
    email: str,
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name": (
                "Community User"
            ),
            "password": (
                "StrongPassword123!"
            ),
        },
    )

    response = client.post(
        TOKEN_URL,
        data={
            "username": email,
            "password": (
                "StrongPassword123!"
            ),
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


def create_post(
    client: TestClient,
    headers: dict[str, str],
) -> dict:
    response = client.post(
        f"{COMMUNITY_URL}/posts",
        headers=headers,
        json={
            "title":
                "A small focus win",
            "body":
                (
                    "I used a ten minute "
                    "timer and finished one "
                    "small task today."
                ),
            "category":
                "wins",
            "anonymous":
                False,
        },
    )

    assert (
        response.status_code
        == 201
    )

    return response.json()


def test_community_requires_authentication(
    client: TestClient,
) -> None:
    response = client.get(
        f"{COMMUNITY_URL}/posts"
    )

    assert (
        response.status_code
        == 401
    )


def test_create_and_read_post(
    client: TestClient,
) -> None:
    headers = create_user(
        client,
        "community1@aksess.app",
    )

    created = create_post(
        client,
        headers,
    )

    response = client.get(
        f"{COMMUNITY_URL}/posts",
        headers=headers,
    )

    assert (
        response.status_code
        == 200
    )

    posts = response.json()

    assert any(
        post["id"]
        == created["id"]
        for post
        in posts
    )


def test_anonymous_post_hides_name(
    client: TestClient,
) -> None:
    headers = create_user(
        client,
        "community2@aksess.app",
    )

    response = client.post(
        f"{COMMUNITY_URL}/posts",
        headers=headers,
        json={
            "title":
                "Sensory support",
            "body":
                (
                    "Lower brightness helped "
                    "me today."
                ),
            "category":
                "sensory",
            "anonymous":
                True,
        },
    )

    assert (
        response.status_code
        == 201
    )

    data = response.json()

    assert (
        data["author"][
            "is_anonymous"
        ]
        is True
    )

    assert (
        data["author"][
            "display_name"
        ].startswith(
            "Community member"
        )
    )


def test_add_comment_and_support(
    client: TestClient,
) -> None:
    headers = create_user(
        client,
        "community3@aksess.app",
    )

    post = create_post(
        client,
        headers,
    )

    comment_response = client.post(
        (
            f"{COMMUNITY_URL}/posts/"
            f"{post['id']}/comments"
        ),
        headers=headers,
        json={
            "body":
                "That sounds like a useful approach.",
            "anonymous":
                False,
        },
    )

    assert (
        comment_response.status_code
        == 201
    )

    support_response = client.patch(
        (
            f"{COMMUNITY_URL}/posts/"
            f"{post['id']}/support"
        ),
        headers=headers,
    )

    assert (
        support_response.status_code
        == 200
    )

    assert (
        support_response.json()[
            "supported"
        ]
        is True
    )


def test_report_post(
    client: TestClient,
) -> None:
    author_headers = create_user(
        client,
        "community4a@aksess.app",
    )

    reporter_headers = create_user(
        client,
        "community4b@aksess.app",
    )

    post = create_post(
        client,
        author_headers,
    )

    response = client.post(
        (
            f"{COMMUNITY_URL}/posts/"
            f"{post['id']}/report"
        ),
        headers=reporter_headers,
        json={
            "reason":
                "other",
            "details":
                "Please review this post.",
        },
    )

    assert (
        response.status_code
        == 201
    )

    assert (
        response.json()[
            "status"
        ]
        == "open"
    )


def test_harmful_language_is_held(
    client: TestClient,
) -> None:
    headers = create_user(
        client,
        "community5@aksess.app",
    )

    response = client.post(
        f"{COMMUNITY_URL}/posts",
        headers=headers,
        json={
            "title":
                "A difficult message",
            "body":
                "Someone told me you are worthless.",
            "category":
                "wellbeing",
            "anonymous":
                False,
        },
    )

    assert (
        response.status_code
        == 201
    )

    data = response.json()

    assert (
        data[
            "moderation_status"
        ]
        == "pending_review"
    )


def test_non_moderator_cannot_open_queue(
    client: TestClient,
) -> None:
    headers = create_user(
        client,
        "community6@aksess.app",
    )

    response = client.get(
        f"{COMMUNITY_URL}/moderation",
        headers=headers,
    )

    assert (
        response.status_code
        == 403
    )


def test_guidelines(
    client: TestClient,
) -> None:
    headers = create_user(
        client,
        "community7@aksess.app",
    )

    response = client.get(
        f"{COMMUNITY_URL}/guidelines",
        headers=headers,
    )

    assert (
        response.status_code
        == 200
    )

    assert len(
        response.json()[
            "rules"
        ]
    ) >= 5
