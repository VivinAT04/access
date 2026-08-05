from datetime import (
    date,
    datetime,
    timedelta,
    timezone,
)

from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"
INSIGHTS_URL = "/api/v1/insights/weekly"
MOOD_URL = "/api/v1/mood-checkins"
FOCUS_URL = "/api/v1/focus-sessions"
REFLECTION_URL = "/api/v1/reflections"


def auth_headers(
    client: TestClient,
    email: str = "insights@aksess.app",
) -> dict[str, str]:
    client.post(
        REGISTER_URL,
        json={
            "email": email,
            "full_name":
                "Insights User",
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


def test_empty_week_returns_seven_days(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    response = client.get(
        INSIGHTS_URL,
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["days"]) == 7

    assert (
        data["summary"][
            "total_focus_minutes"
        ]
        == 0
    )

    assert (
        data["summary"][
            "total_mood_checkins"
        ]
        == 0
    )

    assert len(
        data["suggestions"]
    ) >= 1


def test_weekly_mood_averages(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    client.post(
        MOOD_URL,
        headers=headers,
        json={
            "mood_score": 4,
            "energy_level": 3,
            "stress_level": 2,
            "emotions": [
                "Calm",
            ],
            "note": None,
        },
    )

    client.post(
        MOOD_URL,
        headers=headers,
        json={
            "mood_score": 2,
            "energy_level": 5,
            "stress_level": 4,
            "emotions": [
                "Tired",
            ],
            "note": None,
        },
    )

    response = client.get(
        INSIGHTS_URL,
        headers=headers,
    )

    assert response.status_code == 200

    summary = response.json()[
        "summary"
    ]

    assert (
        summary[
            "total_mood_checkins"
        ]
        == 2
    )

    assert (
        summary[
            "average_mood"
        ]
        == 3.0
    )

    assert (
        summary[
            "average_energy"
        ]
        == 4.0
    )

    assert (
        summary[
            "average_stress"
        ]
        == 3.0
    )


def test_completed_focus_is_counted(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    now = datetime.now(
        timezone.utc,
    )

    response = client.post(
        FOCUS_URL,
        headers=headers,
        json={
            "task_id": None,
            "intention":
                "Review insight test",
            "notes": None,
            "planned_minutes": 25,
            "completed_minutes": 18,
            "status": "completed",
            "started_at":
                (
                    now
                    - timedelta(
                        minutes=18,
                    )
                ).isoformat(),
            "completed_at":
                now.isoformat(),
        },
    )

    assert response.status_code == 201

    insights_response = client.get(
        INSIGHTS_URL,
        headers=headers,
    )

    assert (
        insights_response
        .status_code
        == 200
    )

    summary = (
        insights_response
        .json()["summary"]
    )

    assert (
        summary[
            "total_focus_minutes"
        ]
        == 18
    )

    assert (
        summary[
            "total_focus_sessions"
        ]
        == 1
    )


def test_reflection_is_counted(
    client: TestClient,
) -> None:
    headers = auth_headers(client)

    today = date.today()

    response = client.post(
        REFLECTION_URL,
        headers=headers,
        json={
            "reflection_date":
                today.isoformat(),
            "good_thing":
                "I completed a test.",
            "challenge":
                "I needed to stay patient.",
            "accomplishment":
                "I finished the endpoint.",
            "note": None,
        },
    )

    assert response.status_code == 201

    insights_response = client.get(
        INSIGHTS_URL,
        headers=headers,
    )

    assert (
        insights_response
        .status_code
        == 200
    )

    assert (
        insights_response
        .json()["summary"][
            "total_reflections"
        ]
        == 1
    )


def test_users_have_separate_insights(
    client: TestClient,
) -> None:
    first_headers = auth_headers(
        client,
        "insights-one@aksess.app",
    )

    second_headers = auth_headers(
        client,
        "insights-two@aksess.app",
    )

    client.post(
        MOOD_URL,
        headers=first_headers,
        json={
            "mood_score": 5,
            "energy_level": 5,
            "stress_level": 1,
            "emotions": [
                "Happy",
            ],
            "note": None,
        },
    )

    response = client.get(
        INSIGHTS_URL,
        headers=second_headers,
    )

    assert response.status_code == 200

    assert (
        response.json()[
            "summary"
        ][
            "total_mood_checkins"
        ]
        == 0
    )
