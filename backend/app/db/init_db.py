from sqlalchemy import (
    inspect,
    text,
)

from app.db.base import Base
from app.db.database import (
    engine,
)

from app.models import (  # noqa: F401
    LanguagePreference,
    CompanionReward,
    CompanionProfile,
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
    PrivacyPreference,
    CommunityPost,
    CommunityComment,
    CommunityReaction,
    CommunityReport,
    CommunityModerationAction,
    Notification,
    NotificationPreference,
    PersonalisationEvent,
    PersonalisationPreference,
    PersonalisationRecommendation,
)


def migrate_accessibility_colours() -> None:
    with engine.begin() as connection:
        inspector = inspect(
            connection,
        )

        table_names = (
            inspector
            .get_table_names()
        )

        if (
            "accessibility_preferences"
            not in table_names
        ):
            return

        columns = {
            column["name"]
            for column
            in inspector.get_columns(
                "accessibility_preferences",
            )
        }

        if (
            "accent_colour"
            not in columns
        ):
            connection.execute(
                text(
                    """
                    ALTER TABLE
                    accessibility_preferences
                    ADD COLUMN
                    accent_colour VARCHAR(20)
                    NOT NULL
                    DEFAULT '#6d5dfc'
                    """
                )
            )

        if (
            "surface_colour"
            not in columns
        ):
            connection.execute(
                text(
                    """
                    ALTER TABLE
                    accessibility_preferences
                    ADD COLUMN
                    surface_colour VARCHAR(20)
                    NOT NULL
                    DEFAULT '#ffffff'
                    """
                )
            )


def create_database_tables() -> None:
    Base.metadata.create_all(
        bind=engine,
    )

    migrate_accessibility_colours()
