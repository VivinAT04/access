from app.privacy.router import (
    router as privacy_router,
)
from app.support_resources.router import (
    router as support_resources_router,
)
from app.language_preferences.router import (
    router as language_preferences_router,
)
from app.insights.router import (
    router as insights_router,
)
from app.companion.router import (
    router as companion_router,
)
from app.reminders.router import (
    router as reminders_router,
)
from app.routines.router import (
    router as routines_router,
)
from app.anxiety_sessions.router import (
    router as anxiety_sessions_router,
)
from fastapi import APIRouter

from app.accessibility.router import (
    router as accessibility_router,
)
from app.auth.router import (
    router as auth_router,
)
from app.focus_sessions.router import (
    router as focus_sessions_router,
)
from app.mood_checkins.router import (
    router as mood_checkins_router,
)
from app.reflections.router import (
    router as reflections_router,
)
from app.subtasks.router import (
    router as subtasks_router,
)
from app.tasks.router import (
    router as tasks_router,
)


api_router = APIRouter(
    prefix="/api/v1"
)

api_router.include_router(
    auth_router
)
api_router.include_router(
    accessibility_router
)
api_router.include_router(
    tasks_router
)
api_router.include_router(
    focus_sessions_router
)
api_router.include_router(
    mood_checkins_router
)

api_router.include_router(
    reflections_router
)

api_router.include_router(
    anxiety_sessions_router
)

api_router.include_router(
    subtasks_router
)

api_router.include_router(
    routines_router
)

api_router.include_router(
    reminders_router
)

api_router.include_router(
    companion_router
)

api_router.include_router(
    insights_router
)

api_router.include_router(
    language_preferences_router
)

api_router.include_router(
    privacy_router
)

api_router.include_router(
    support_resources_router
)
