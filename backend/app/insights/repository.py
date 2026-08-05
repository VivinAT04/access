import uuid
from collections import defaultdict
from datetime import (
    date,
    datetime,
    time,
    timedelta,
    timezone,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.insights.schemas import (
    DailyInsightPoint,
    InsightSummary,
    ReflectionInsightsResponse,
)
from app.models.focus_session import FocusSession
from app.models.mood_checkin import MoodCheckin
from app.models.reflection import Reflection


def rounded_average(
    values: list[int],
) -> float | None:
    if not values:
        return None

    return round(
        sum(values) / len(values),
        1,
    )


def day_key(
    value: datetime,
) -> date:
    if value.tzinfo is None:
        return value.date()

    return value.astimezone(
        timezone.utc,
    ).date()


def build_suggestions(
    days: list[DailyInsightPoint],
    summary: InsightSummary,
) -> list[str]:
    suggestions: list[str] = []

    if (
        summary.total_focus_sessions == 0
        and summary.total_mood_checkins == 0
        and summary.total_reflections == 0
    ):
        return [
            (
                "There is no pressure to create a full week "
                "of data. One short check-in or focus session "
                "is enough to begin noticing patterns."
            ),
            (
                "Try recording how you feel once today. "
                "Small entries still count."
            ),
        ]

    if (
        summary.average_stress is not None
        and summary.average_stress >= 4
    ):
        suggestions.append(
            (
                "Your recent check-ins show higher stress. "
                "A shorter focus session or grounding break "
                "may feel more manageable."
            )
        )
    elif (
        summary.average_stress is not None
        and summary.average_stress <= 2
    ):
        suggestions.append(
            (
                "Your recorded stress has generally been "
                "lower this week. Notice which routines or "
                "environments may have supported that."
            )
        )

    if (
        summary.average_energy is not None
        and summary.average_energy <= 2.5
    ):
        suggestions.append(
            (
                "Your recorded energy has been lower this "
                "week. Consider smaller tasks and more "
                "frequent pauses."
            )
        )
    elif (
        summary.average_energy is not None
        and summary.average_energy >= 4
    ):
        suggestions.append(
            (
                "Your recorded energy has been relatively "
                "strong. This may be a useful time for one "
                "important but realistic task."
            )
        )

    if summary.most_focused_day is not None:
        suggestions.append(
            (
                f"{summary.most_focused_day} was your most "
                f"focused day with "
                f"{summary.most_focused_minutes} minutes. "
                "You could gently compare what made that "
                "day feel workable."
            )
        )

    active_focus_days = sum(
        1
        for day in days
        if day.focus_minutes > 0
    )

    if (
        summary.total_focus_minutes > 0
        and active_focus_days >= 4
    ):
        suggestions.append(
            (
                "You completed focused work on several days "
                "this week. Consistency can include short "
                "sessions and does not require a perfect "
                "streak."
            )
        )

    if (
        summary.total_reflections == 0
        and (
            summary.total_focus_sessions > 0
            or summary.total_mood_checkins > 0
        )
    ):
        suggestions.append(
            (
                "You have activity recorded but no reflection "
                "this week. One sentence about what helped "
                "would be enough."
            )
        )
    elif summary.total_reflections >= 4:
        suggestions.append(
            (
                "You reflected on several days this week. "
                "That gives you a useful record without "
                "requiring long-form journaling."
            )
        )

    mood_days = [
        day
        for day in days
        if day.mood_average is not None
    ]

    if len(mood_days) >= 4:
        midpoint = max(
            1,
            len(mood_days) // 2,
        )

        earlier_values = [
            day.mood_average
            for day in mood_days[:midpoint]
            if day.mood_average is not None
        ]

        later_values = [
            day.mood_average
            for day in mood_days[midpoint:]
            if day.mood_average is not None
        ]

        if earlier_values and later_values:
            earlier = sum(
                earlier_values
            ) / len(earlier_values)

            later = sum(
                later_values
            ) / len(later_values)

            if later >= earlier + 0.6:
                suggestions.append(
                    (
                        "Your recorded mood was higher later "
                        "in the week than earlier in the week."
                    )
                )
            elif later <= earlier - 0.6:
                suggestions.append(
                    (
                        "Your recorded mood was lower later "
                        "in the week. Consider keeping the "
                        "next steps lighter and more flexible."
                    )
                )

    if not suggestions:
        suggestions.append(
            (
                "Your week shows a mixture of experiences. "
                "Keep observing gently rather than trying to "
                "make every day look the same."
            )
        )

    return suggestions[:5]


def build_weekly_insights(
    database: Session,
    user_id: uuid.UUID,
    end_date: date | None = None,
) -> ReflectionInsightsResponse:
    period_end = end_date or date.today()

    period_start = (
        period_end
        - timedelta(days=6)
    )

    start_datetime = datetime.combine(
        period_start,
        time.min,
        tzinfo=timezone.utc,
    )

    end_datetime = datetime.combine(
        period_end
        + timedelta(days=1),
        time.min,
        tzinfo=timezone.utc,
    )

    mood_records = list(
        database.scalars(
            select(
                MoodCheckin
            ).where(
                MoodCheckin.user_id
                == user_id,
                MoodCheckin.created_at
                >= start_datetime,
                MoodCheckin.created_at
                < end_datetime,
            )
        ).all()
    )

    focus_records = list(
        database.scalars(
            select(
                FocusSession
            ).where(
                FocusSession.user_id
                == user_id,
                FocusSession.status
                == "completed",
                FocusSession.completed_at
                .is_not(None),
                FocusSession.completed_at
                >= start_datetime,
                FocusSession.completed_at
                < end_datetime,
            )
        ).all()
    )

    reflection_records = list(
        database.scalars(
            select(
                Reflection
            ).where(
                Reflection.user_id
                == user_id,
                Reflection.reflection_date
                >= period_start,
                Reflection.reflection_date
                <= period_end,
            )
        ).all()
    )

    mood_by_day: dict[
        date,
        list[MoodCheckin],
    ] = defaultdict(list)

    focus_by_day: dict[
        date,
        list[FocusSession],
    ] = defaultdict(list)

    reflections_by_day: dict[
        date,
        list[Reflection],
    ] = defaultdict(list)

    for record in mood_records:
        mood_by_day[
            day_key(record.created_at)
        ].append(record)

    for record in focus_records:
        completed_at = (
            record.completed_at
        )

        if completed_at is None:
            continue

        focus_by_day[
            day_key(completed_at)
        ].append(record)

    for record in reflection_records:
        reflections_by_day[
            record.reflection_date
        ].append(record)

    days: list[
        DailyInsightPoint
    ] = []

    for offset in range(7):
        current_date = (
            period_start
            + timedelta(days=offset)
        )

        current_moods = (
            mood_by_day[current_date]
        )

        current_focus = (
            focus_by_day[current_date]
        )

        current_reflections = (
            reflections_by_day[
                current_date
            ]
        )

        days.append(
            DailyInsightPoint(
                date=current_date,
                day_label=(
                    current_date.strftime(
                        "%a",
                    )
                ),
                mood_average=(
                    rounded_average(
                        [
                            record.mood_score
                            for record
                            in current_moods
                        ]
                    )
                ),
                energy_average=(
                    rounded_average(
                        [
                            record.energy_level
                            for record
                            in current_moods
                        ]
                    )
                ),
                stress_average=(
                    rounded_average(
                        [
                            record.stress_level
                            for record
                            in current_moods
                        ]
                    )
                ),
                mood_checkins=len(
                    current_moods
                ),
                focus_minutes=sum(
                    max(
                        0,
                        record.completed_minutes,
                    )
                    for record
                    in current_focus
                ),
                focus_sessions=len(
                    current_focus
                ),
                reflections=len(
                    current_reflections
                ),
            )
        )

    all_moods = [
        record.mood_score
        for record in mood_records
    ]

    all_energy = [
        record.energy_level
        for record in mood_records
    ]

    all_stress = [
        record.stress_level
        for record in mood_records
    ]

    total_focus_minutes = sum(
        day.focus_minutes
        for day in days
    )

    most_focused = max(
        days,
        key=lambda day: (
            day.focus_minutes
        ),
    )

    most_focused_day = (
        most_focused.day_label
        if most_focused.focus_minutes
        > 0
        else None
    )

    summary = InsightSummary(
        period_start=period_start,
        period_end=period_end,
        total_focus_minutes=(
            total_focus_minutes
        ),
        total_focus_sessions=sum(
            day.focus_sessions
            for day in days
        ),
        total_mood_checkins=len(
            mood_records
        ),
        total_reflections=len(
            reflection_records
        ),
        average_mood=(
            rounded_average(
                all_moods
            )
        ),
        average_energy=(
            rounded_average(
                all_energy
            )
        ),
        average_stress=(
            rounded_average(
                all_stress
            )
        ),
        most_focused_day=(
            most_focused_day
        ),
        most_focused_minutes=(
            most_focused.focus_minutes
            if most_focused_day
            is not None
            else 0
        ),
    )

    return ReflectionInsightsResponse(
        days=days,
        summary=summary,
        suggestions=build_suggestions(
            days=days,
            summary=summary,
        ),
    )
