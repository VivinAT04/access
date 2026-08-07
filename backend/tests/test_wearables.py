from datetime import datetime, timezone

from fastapi.testclient import TestClient


REGISTER_URL = "/api/v1/auth/register"
TOKEN_URL = "/api/v1/auth/token"

BASE_URL = "/api/v1/wearables"

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
            "email": email,
            "full_name": "Wearable User",
            "password": "StrongPassword123!",
        },
    )

    response = client.post(
        TOKEN_URL,
        data={
            "username": email,
            "password": "StrongPassword123!",
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


def enable_wearables(
    client: TestClient,
    headers: dict[str, str],
) -> None:
    response = client.put(
        PRIVACY_URL,
        headers=headers,
        json={
            "wearable_data_enabled":
                True,
        },
    )

    assert (
        response.status_code
        == 200
    )


def test_wearables_require_auth(
    client: TestClient,
) -> None:
    response = client.get(
        f"{BASE_URL}/dashboard"
    )

    assert (
        response.status_code
        == 401
    )


def test_wearable_privacy_off_by_default(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "wearable1@aksess.app",
    )

    response = client.get(
        f"{BASE_URL}/privacy",
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


def test_cannot_add_sample_without_consent(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "wearable2@aksess.app",
    )

    response = client.post(
        f"{BASE_URL}/heart-rate",
        headers=headers,
        json={
            "bpm": 72,
            "measured_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),
        },
    )

    assert (
        response.status_code
        == 403
    )


def test_connect_manual_device(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "wearable3@aksess.app",
    )

    enable_wearables(
        client,
        headers,
    )

    response = client.post(
        f"{BASE_URL}/devices",
        headers=headers,
        json={
            "provider":
                "manual",

            "device_name":
                "Test Watch",
        },
    )

    assert (
        response.status_code
        == 200
    )

    assert (
        response.json()[
            "device_name"
        ]
        == "Test Watch"
    )


def test_add_heart_rate_sample(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "wearable4@aksess.app",
    )

    enable_wearables(
        client,
        headers,
    )

    response = client.post(
        f"{BASE_URL}/heart-rate",
        headers=headers,
        json={
            "bpm":
                70,

            "measured_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),
        },
    )

    assert (
        response.status_code
        == 200
    )

    assert (
        response.json()[
            "bpm"
        ]
        == 70
    )


def test_baseline_becomes_ready(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "wearable5@aksess.app",
    )

    enable_wearables(
        client,
        headers,
    )

    for bpm in [
        68,
        70,
        69,
        71,
        70,
    ]:
        response = client.post(
            f"{BASE_URL}/heart-rate",
            headers=headers,
            json={
                "bpm":
                    bpm,

                "measured_at":
                    datetime.now(
                        timezone.utc
                    ).isoformat(),
            },
        )

        assert (
            response.status_code
            == 200
        )

    dashboard = client.get(
        f"{BASE_URL}/dashboard",
        headers=headers,
    )

    assert (
        dashboard.status_code
        == 200
    )

    baseline = dashboard.json()[
        "baseline"
    ]

    assert (
        baseline[
            "ready"
        ]
        is True
    )

    assert (
        baseline[
            "sample_count"
        ]
        >= 5
    )


def test_elevated_arousal_signal(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "wearable6@aksess.app",
    )

    enable_wearables(
        client,
        headers,
    )

    for bpm in [
        68,
        69,
        70,
        71,
        69,
        70,
    ]:
        client.post(
            f"{BASE_URL}/heart-rate",
            headers=headers,
            json={
                "bpm":
                    bpm,

                "measured_at":
                    datetime.now(
                        timezone.utc
                    ).isoformat(),
            },
        )

    high = client.post(
        f"{BASE_URL}/heart-rate",
        headers=headers,
        json={
            "bpm":
                105,

            "measured_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),
        },
    )

    assert (
        high.status_code
        == 200
    )

    dashboard = client.get(
        f"{BASE_URL}/dashboard",
        headers=headers,
    )

    signals = dashboard.json()[
        "recent_signals"
    ]

    assert (
        len(signals)
        >= 1
    )

    assert (
        signals[0][
            "signal_type"
        ]
        == "elevated-arousal"
    )


def test_delete_wearable_data(
    client: TestClient,
) -> None:
    headers = headers_for(
        client,
        "wearable7@aksess.app",
    )

    enable_wearables(
        client,
        headers,
    )

    client.post(
        f"{BASE_URL}/heart-rate",
        headers=headers,
        json={
            "bpm":
                75,

            "measured_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),
        },
    )

    response = client.delete(
        f"{BASE_URL}/data",
        headers=headers,
    )

    assert (
        response.status_code
        == 200
    )

    history = client.get(
        f"{BASE_URL}/heart-rate",
        headers=headers,
    )

    assert (
        history.json()
        == []
    )
