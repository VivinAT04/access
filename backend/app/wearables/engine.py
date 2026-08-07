from dataclasses import dataclass


@dataclass(frozen=True)
class HeartRateAnalysis:
    elevated: bool

    percentage_above_baseline: float

    severity: str

    explanation: str

    suggestion: str


def analyse_heart_rate(
    bpm: int,
    baseline_bpm: float,
    threshold_percentage: float,
) -> HeartRateAnalysis:
    if baseline_bpm <= 0:
        return HeartRateAnalysis(
            elevated=False,
            percentage_above_baseline=0.0,
            severity="none",
            explanation=(
                "There is not enough baseline data yet."
            ),
            suggestion=(
                "Continue collecting normal resting readings "
                "before using heart-rate comparisons."
            ),
        )

    percentage = (
        (bpm - baseline_bpm)
        / baseline_bpm
        * 100
    )

    rounded_percentage = round(
        percentage,
        1,
    )

    if (
        rounded_percentage
        < threshold_percentage
    ):
        return HeartRateAnalysis(
            elevated=False,
            percentage_above_baseline=(
                rounded_percentage
            ),
            severity="none",
            explanation=(
                "This reading is not substantially above "
                "your recent baseline."
            ),
            suggestion=(
                "No action is required. Use Aksess tools "
                "only if they feel useful."
            ),
        )

    if rounded_percentage >= 40:
        severity = "high"
    elif rounded_percentage >= 30:
        severity = "moderate"
    else:
        severity = "notice"

    return HeartRateAnalysis(
        elevated=True,
        percentage_above_baseline=(
            rounded_percentage
        ),
        severity=severity,
        explanation=(
            "This heart-rate reading is above your "
            "recent personal baseline. This can happen "
            "for many reasons, including movement, "
            "caffeine, excitement or exertion. "
            "It is not a diagnosis of stress or anxiety."
        ),
        suggestion=(
            "If you are resting and would like support, "
            "consider a short breathing, grounding or "
            "quiet break."
        ),
    )
