import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    delete,
    select,
)
from sqlalchemy.orm import Session

from app.models.privacy_preference import (
    PrivacyPreference,
)
from app.models.wearable import (
    HeartRateBaseline,
    HeartRateSample,
    WearableDevice,
    WearableSignal,
)
from app.wearables.engine import (
    analyse_heart_rate,
)
from app.wearables.schemas import (
    HeartRateSampleCreate,
    WearableDeviceCreate,
)


BASELINE_SAMPLE_LIMIT = 20
MIN_BASELINE_SAMPLES = 5


def wearable_privacy_enabled(
    database: Session,
    user_id: uuid.UUID,
) -> bool:
    preference = database.scalar(
        select(
            PrivacyPreference
        ).where(
            PrivacyPreference.user_id
            == user_id
        )
    )

    if preference is None:
        return False

    return bool(
        preference.wearable_data_enabled
    )


def create_device(
    database: Session,
    user_id: uuid.UUID,
    payload: WearableDeviceCreate,
) -> WearableDevice:
    device = WearableDevice(
        user_id=user_id,
        provider=payload.provider,
        device_name=payload.device_name.strip(),
        external_device_id=(
            payload.external_device_id
        ),
        is_connected=True,
        last_synced_at=datetime.now(
            timezone.utc
        ),
    )

    database.add(
        device
    )

    database.commit()

    database.refresh(
        device
    )

    return device


def list_devices(
    database: Session,
    user_id: uuid.UUID,
) -> list[
    WearableDevice
]:
    statement = (
        select(
            WearableDevice
        )
        .where(
            WearableDevice.user_id
            == user_id
        )
        .order_by(
            WearableDevice.created_at.desc()
        )
    )

    return list(
        database.scalars(
            statement
        )
    )


def recent_samples(
    database: Session,
    user_id: uuid.UUID,
    limit: int = 50,
) -> list[
    HeartRateSample
]:
    statement = (
        select(
            HeartRateSample
        )
        .where(
            HeartRateSample.user_id
            == user_id
        )
        .order_by(
            HeartRateSample.measured_at.desc()
        )
        .limit(
            limit
        )
    )

    return list(
        database.scalars(
            statement
        )
    )


def calculate_baseline(
    database: Session,
    user_id: uuid.UUID,
) -> HeartRateBaseline:
    samples = recent_samples(
        database=database,
        user_id=user_id,
        limit=BASELINE_SAMPLE_LIMIT,
    )

    sample_count = len(
        samples
    )

    if sample_count == 0:
        baseline_value = 0.0
    else:
        baseline_value = round(
            sum(
                sample.bpm
                for sample in samples
            )
            / sample_count,
            1,
        )

    baseline = database.scalar(
        select(
            HeartRateBaseline
        ).where(
            HeartRateBaseline.user_id
            == user_id
        )
    )

    if baseline is None:
        baseline = HeartRateBaseline(
            user_id=user_id,
        )

    baseline.baseline_bpm = (
        baseline_value
    )

    baseline.sample_count = (
        sample_count
    )

    baseline.calculated_at = (
        datetime.now(
            timezone.utc
        )
    )

    database.add(
        baseline
    )

    database.commit()

    database.refresh(
        baseline
    )

    return baseline


def get_baseline(
    database: Session,
    user_id: uuid.UUID,
) -> HeartRateBaseline:
    baseline = database.scalar(
        select(
            HeartRateBaseline
        ).where(
            HeartRateBaseline.user_id
            == user_id
        )
    )

    if baseline is None:
        return calculate_baseline(
            database=database,
            user_id=user_id,
        )

    return baseline


def add_sample(
    database: Session,
    user_id: uuid.UUID,
    payload: HeartRateSampleCreate,
) -> HeartRateSample:
    if payload.device_id is not None:
        device = database.get(
            WearableDevice,
            payload.device_id,
        )

        if (
            device is None
            or device.user_id
            != user_id
        ):
            raise ValueError(
                "Wearable device not found."
            )

    sample = HeartRateSample(
        user_id=user_id,
        device_id=payload.device_id,
        bpm=payload.bpm,
        source=payload.source,
        measured_at=payload.measured_at,
    )

    database.add(
        sample
    )

    database.commit()

    database.refresh(
        sample
    )

    baseline_before = get_baseline(
        database=database,
        user_id=user_id,
    )

    if (
        baseline_before.sample_count
        >= MIN_BASELINE_SAMPLES
        and baseline_before.baseline_bpm
        > 0
    ):
        analysis = analyse_heart_rate(
            bpm=sample.bpm,
            baseline_bpm=(
                baseline_before.baseline_bpm
            ),
            threshold_percentage=(
                baseline_before
                .threshold_percentage
            ),
        )

        if analysis.elevated:
            signal = WearableSignal(
                user_id=user_id,
                heart_rate_sample_id=sample.id,
                signal_type="elevated-arousal",
                severity=analysis.severity,
                baseline_bpm=(
                    baseline_before
                    .baseline_bpm
                ),
                observed_bpm=sample.bpm,
                percentage_above_baseline=(
                    analysis
                    .percentage_above_baseline
                ),
            )

            database.add(
                signal
            )

            database.commit()

    calculate_baseline(
        database=database,
        user_id=user_id,
    )

    return sample


def recent_signals(
    database: Session,
    user_id: uuid.UUID,
    limit: int = 20,
) -> list[
    WearableSignal
]:
    statement = (
        select(
            WearableSignal
        )
        .where(
            WearableSignal.user_id
            == user_id
        )
        .order_by(
            WearableSignal.created_at.desc()
        )
        .limit(
            limit
        )
    )

    return list(
        database.scalars(
            statement
        )
    )


def latest_signal(
    database: Session,
    user_id: uuid.UUID,
) -> WearableSignal | None:
    return database.scalar(
        select(
            WearableSignal
        )
        .where(
            WearableSignal.user_id
            == user_id
        )
        .order_by(
            WearableSignal.created_at.desc()
        )
        .limit(
            1
        )
    )


def delete_wearable_data(
    database: Session,
    user_id: uuid.UUID,
) -> None:
    database.execute(
        delete(
            WearableSignal
        ).where(
            WearableSignal.user_id
            == user_id
        )
    )

    database.execute(
        delete(
            HeartRateSample
        ).where(
            HeartRateSample.user_id
            == user_id
        )
    )

    database.execute(
        delete(
            HeartRateBaseline
        ).where(
            HeartRateBaseline.user_id
            == user_id
        )
    )

    database.execute(
        delete(
            WearableDevice
        ).where(
            WearableDevice.user_id
            == user_id
        )
    )

    database.commit()
