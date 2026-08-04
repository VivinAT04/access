from app.db.base import Base
from app.db.database import engine

from app.models import (  # noqa: F401
    Reminder,
    RoutineStep,
    RoutineRunStep,
    RoutineRun,
    Routine,
    AnxietySession,
    AccessibilityPreference,
    FocusSession,
    MoodCheckin,
    Reflection,
    Subtask,
    Task,
    User,
)


def create_database_tables() -> None:
    Base.metadata.create_all(
        bind=engine
    )
