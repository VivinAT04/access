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
