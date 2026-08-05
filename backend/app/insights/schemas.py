from datetime import date

from pydantic import BaseModel, Field


class DailyInsightPoint(BaseModel):
    date: date
    day_label: str

    mood_average: float | None = None
    energy_average: float | None = None
    stress_average: float | None = None

    mood_checkins: int = 0
    focus_minutes: int = 0
    focus_sessions: int = 0
    reflections: int = 0


class InsightSummary(BaseModel):
    period_start: date
    period_end: date

    total_focus_minutes: int = 0
    total_focus_sessions: int = 0
    total_mood_checkins: int = 0
    total_reflections: int = 0

    average_mood: float | None = None
    average_energy: float | None = None
    average_stress: float | None = None

    most_focused_day: str | None = None
    most_focused_minutes: int = 0


class ReflectionInsightsResponse(BaseModel):
    days: list[DailyInsightPoint]

    summary: InsightSummary

    suggestions: list[str] = Field(
        default_factory=list,
    )
