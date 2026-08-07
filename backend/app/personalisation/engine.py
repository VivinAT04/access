from dataclasses import dataclass


@dataclass(frozen=True)
class RecommendationDraft:
    recommendation_type: str
    title: str
    message: str
    reason: str
    action_url: str


def build_recommendations(
    preferred_focus_minutes: int,
    preferred_support_style: str,
    preferred_energy_level: str,
    preferred_prompt_style: str,
) -> list[RecommendationDraft]:
    recommendations: list[
        RecommendationDraft
    ] = []

    if preferred_energy_level == "low":
        recommendations.append(
            RecommendationDraft(
                recommendation_type="focus",
                title="Try a shorter focus block",
                message=(
                    "A shorter session may feel easier to start. "
                    f"Try {min(preferred_focus_minutes, 15)} minutes."
                ),
                reason=(
                    "You selected a lower-energy preference, so "
                    "Aksess is suggesting a smaller starting step."
                ),
                action_url="/focus",
            )
        )

    elif preferred_energy_level == "high":
        recommendations.append(
            RecommendationDraft(
                recommendation_type="focus",
                title="Use your energy for a focused block",
                message=(
                    f"Try a {preferred_focus_minutes}-minute "
                    "focus session while your energy feels available."
                ),
                reason=(
                    "You selected a higher-energy preference."
                ),
                action_url="/focus",
            )
        )

    else:
        recommendations.append(
            RecommendationDraft(
                recommendation_type="focus",
                title="Use your preferred focus length",
                message=(
                    f"Try a {preferred_focus_minutes}-minute "
                    "focus session when you are ready."
                ),
                reason=(
                    "This matches the focus duration you selected."
                ),
                action_url="/focus",
            )
        )

    if preferred_support_style == "calm-first":
        recommendations.append(
            RecommendationDraft(
                recommendation_type="calm",
                title="Start with a calming tool",
                message=(
                    "Consider a short breathing or grounding exercise "
                    "before choosing your next task."
                ),
                reason=(
                    "You selected calm-first support."
                ),
                action_url="/calm",
            )
        )

    elif preferred_support_style == "routine-first":
        recommendations.append(
            RecommendationDraft(
                recommendation_type="routine",
                title="Use a familiar routine",
                message=(
                    "A familiar routine can reduce the number of "
                    "decisions needed to get started."
                ),
                reason=(
                    "You selected routine-first support."
                ),
                action_url="/routines",
            )
        )

    elif preferred_support_style == "focus-first":
        recommendations.append(
            RecommendationDraft(
                recommendation_type="tasks",
                title="Choose one small task",
                message=(
                    "Pick one concrete task and start with the "
                    "smallest useful action."
                ),
                reason=(
                    "You selected focus-first support."
                ),
                action_url="/tasks",
            )
        )

    else:
        recommendations.append(
            RecommendationDraft(
                recommendation_type="wellbeing",
                title="Choose what feels most useful",
                message=(
                    "You can start with focus, calm, routines or a "
                    "wellbeing check-in depending on what you need."
                ),
                reason=(
                    "You selected balanced support."
                ),
                action_url="/dashboard",
            )
        )

    if preferred_prompt_style == "structured":
        recommendations.append(
            RecommendationDraft(
                recommendation_type="structure",
                title="Use task breakdown",
                message=(
                    "Break the next task into smaller steps before "
                    "starting."
                ),
                reason=(
                    "You selected structured prompts."
                ),
                action_url="/tasks",
            )
        )

    elif preferred_prompt_style == "gentle":
        recommendations.append(
            RecommendationDraft(
                recommendation_type="wellbeing",
                title="Keep the next step small",
                message=(
                    "Choose a next step that feels manageable rather "
                    "than trying to finish everything at once."
                ),
                reason=(
                    "You selected gentle prompts."
                ),
                action_url="/dashboard",
            )
        )

    else:
        recommendations.append(
            RecommendationDraft(
                recommendation_type="focus",
                title="Next step",
                message=(
                    "Choose one task and begin."
                ),
                reason=(
                    "You selected concise prompts."
                ),
                action_url="/tasks",
            )
        )

    return recommendations
