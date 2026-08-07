from fastapi import (
    APIRouter,
    HTTPException,
)

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.wearables.engine import (
    analyse_heart_rate,
)
from app.wearables.repository import (
    MIN_BASELINE_SAMPLES,
    add_sample,
    create_device,
    delete_wearable_data,
    get_baseline,
    latest_signal,
    list_devices,
    recent_samples,
    recent_signals,
    wearable_privacy_enabled,
)
from app.wearables.schemas import (
    HeartRateBaselineResponse,
    HeartRateSampleCreate,
    HeartRateSampleResponse,
    WearableAnalysisResponse,
    WearableDashboardResponse,
    WearableDeviceCreate,
    WearableDeviceResponse,
    WearablePrivacyResponse,
    WearableResetResponse,
)


router = APIRouter(
    prefix="/wearables",
    tags=["Wearables"],
)


@router.get(
    "/privacy",
    response_model=WearablePrivacyResponse,
)
def privacy_status(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> WearablePrivacyResponse:
    enabled = wearable_privacy_enabled(
        database=database,
        user_id=current_user.id,
    )

    return WearablePrivacyResponse(
        enabled=enabled,
        explanation=(
            "Wearable heart-rate processing is optional. "
            "Aksess compares readings with your recent "
            "personal baseline. It does not diagnose "
            "stress, anxiety or a medical condition."
        ),
    )


@router.post(
    "/devices",
    response_model=WearableDeviceResponse,
)
def connect_device(
    payload: WearableDeviceCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> WearableDeviceResponse:
    if not wearable_privacy_enabled(
        database=database,
        user_id=current_user.id,
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Wearable processing is disabled "
                "in your privacy settings."
            ),
        )

    return create_device(
        database=database,
        user_id=current_user.id,
        payload=payload,
    )


@router.get(
    "/devices",
    response_model=list[
        WearableDeviceResponse
    ],
)
def devices(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> list[
    WearableDeviceResponse
]:
    return list_devices(
        database=database,
        user_id=current_user.id,
    )


@router.post(
    "/heart-rate",
    response_model=HeartRateSampleResponse,
)
def create_heart_rate_sample(
    payload: HeartRateSampleCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> HeartRateSampleResponse:
    if not wearable_privacy_enabled(
        database=database,
        user_id=current_user.id,
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Wearable processing is disabled "
                "in your privacy settings."
            ),
        )

    try:
        return add_sample(
            database=database,
            user_id=current_user.id,
            payload=payload,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.get(
    "/heart-rate",
    response_model=list[
        HeartRateSampleResponse
    ],
)
def heart_rate_history(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> list[
    HeartRateSampleResponse
]:
    return recent_samples(
        database=database,
        user_id=current_user.id,
        limit=100,
    )


@router.get(
    "/dashboard",
    response_model=WearableDashboardResponse,
)
def dashboard(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> WearableDashboardResponse:
    baseline = get_baseline(
        database=database,
        user_id=current_user.id,
    )

    return WearableDashboardResponse(
        privacy_enabled=(
            wearable_privacy_enabled(
                database=database,
                user_id=current_user.id,
            )
        ),
        devices=list_devices(
            database=database,
            user_id=current_user.id,
        ),
        recent_samples=recent_samples(
            database=database,
            user_id=current_user.id,
            limit=30,
        ),
        recent_signals=recent_signals(
            database=database,
            user_id=current_user.id,
            limit=20,
        ),
        baseline=HeartRateBaselineResponse(
            baseline_bpm=(
                baseline.baseline_bpm
                if baseline.baseline_bpm > 0
                else None
            ),
            sample_count=(
                baseline.sample_count
            ),
            threshold_percentage=(
                baseline.threshold_percentage
            ),
            ready=(
                baseline.sample_count
                >= MIN_BASELINE_SAMPLES
            ),
        ),
    )


@router.get(
    "/analysis",
    response_model=WearableAnalysisResponse,
)
def analysis(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> WearableAnalysisResponse:
    samples = recent_samples(
        database=database,
        user_id=current_user.id,
        limit=1,
    )

    baseline = get_baseline(
        database=database,
        user_id=current_user.id,
    )

    baseline_response = (
        HeartRateBaselineResponse(
            baseline_bpm=(
                baseline.baseline_bpm
                if baseline.baseline_bpm > 0
                else None
            ),
            sample_count=(
                baseline.sample_count
            ),
            threshold_percentage=(
                baseline.threshold_percentage
            ),
            ready=(
                baseline.sample_count
                >= MIN_BASELINE_SAMPLES
            ),
        )
    )

    if (
        not samples
        or not baseline_response.ready
        or baseline.baseline_bpm <= 0
    ):
        return WearableAnalysisResponse(
            baseline=baseline_response,
            latest_sample=(
                samples[0]
                if samples
                else None
            ),
            latest_signal=None,
            possible_elevated_arousal=False,
            explanation=(
                "More heart-rate samples are needed "
                "before Aksess can compare readings "
                "with a personal baseline."
            ),
            suggestion=(
                "Add several normal readings while "
                "you are at rest."
            ),
        )

    latest = samples[0]

    result = analyse_heart_rate(
        bpm=latest.bpm,
        baseline_bpm=(
            baseline.baseline_bpm
        ),
        threshold_percentage=(
            baseline.threshold_percentage
        ),
    )

    signal = latest_signal(
        database=database,
        user_id=current_user.id,
    )

    return WearableAnalysisResponse(
        baseline=baseline_response,
        latest_sample=latest,
        latest_signal=signal,
        possible_elevated_arousal=(
            result.elevated
        ),
        explanation=(
            result.explanation
        ),
        suggestion=(
            result.suggestion
        ),
    )


@router.delete(
    "/data",
    response_model=WearableResetResponse,
)
def reset_data(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> WearableResetResponse:
    delete_wearable_data(
        database=database,
        user_id=current_user.id,
    )

    return WearableResetResponse(
        message=(
            "Wearable devices, heart-rate samples, "
            "baseline data and detected signals "
            "were deleted."
        )
    )
