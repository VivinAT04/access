from fastapi import APIRouter

from app.accessibility.router import router as accessibility_router

from app.auth.router import router as auth_router


api_router = APIRouter(
    prefix="/api/v1"
)

api_router.include_router(auth_router)

api_router.include_router(accessibility_router)
