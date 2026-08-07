from dataclasses import dataclass


@dataclass(frozen=True)
class ScreeningResult:
    status: str
    reason: str | None


HARASSMENT_PATTERNS = (
    "kill yourself",
    "you are worthless",
    "you are useless",
    "i hate you",
    "go die",
)


CRISIS_PATTERNS = (
    "i want to die",
    "i want to kill myself",
    "suicide plan",
    "end my life",
    "hurt myself",
)


SPAM_PATTERNS = (
    "click this link",
    "guaranteed money",
    "crypto investment",
    "buy followers",
)


def screen_community_content(
    text: str,
) -> ScreeningResult:
    cleaned = (
        text
        .strip()
        .lower()
    )

    if any(
        pattern in cleaned
        for pattern
        in HARASSMENT_PATTERNS
    ):
        return ScreeningResult(
            status="pending_review",
            reason=(
                "Possible harassment or harmful "
                "language detected."
            ),
        )

    if any(
        pattern in cleaned
        for pattern
        in CRISIS_PATTERNS
    ):
        return ScreeningResult(
            status="pending_review",
            reason=(
                "Possible urgent-safety language "
                "detected. Human review recommended."
            ),
        )

    if any(
        pattern in cleaned
        for pattern
        in SPAM_PATTERNS
    ):
        return ScreeningResult(
            status="pending_review",
            reason=(
                "Possible spam detected."
            ),
        )

    return ScreeningResult(
        status="published",
        reason=None,
    )
