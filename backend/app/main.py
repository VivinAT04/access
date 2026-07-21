from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.init_db import create_database_tables


@asynccontextmanager
async def lifespan(
    _: FastAPI,
) -> AsyncIterator[None]:
    create_database_tables()
    yield


app = FastAPI(
    title=settings.app_name,
    description=(
        "Backend API for the Aksess wellbeing platform"
    ),
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.web_app_url,
        settings.mobile_app_url,
        "http://localhost:19006",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "Aksess API is running",
        "status": "healthy",
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}
