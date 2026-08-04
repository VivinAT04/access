import uuid
from datetime import date

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    Response,
    status,
)
from sqlalchemy.exc import IntegrityError

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.reflections.repository import (
    create_reflection,
    delete_reflection,
    get_reflection_by_date,
    get_reflection_by_id,
    get_reflection_summary,
    list_reflections,
    update_reflection,
)
from app.reflections.schemas import (
    ReflectionCreate,
    ReflectionResponse,
    ReflectionSummaryResponse,
    ReflectionUpdate,
)


router = APIRouter(
    prefix="/reflections",
    tags=["Daily Reflections"],
)


@router.post(
    "",
    response_model=ReflectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_daily_reflection(
    payload: ReflectionCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> ReflectionResponse:
    existing = get_reflection_by_date(
        database=database,
        user_id=current_user.id,
        reflection_date=(
            payload.reflection_date
        ),
    )

    if existing is not None:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "A reflection already exists "
                "for this date."
            ),
        )

    try:
        reflection = create_reflection(
            database=database,
            user_id=current_user.id,
            payload=payload,
        )
    except IntegrityError as error:
        database.rollback()

        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "A reflection already exists "
                "for this date."
            ),
        ) from error

    return ReflectionResponse.model_validate(
        reflection
    )


@router.get(
    "",
    response_model=list[
        ReflectionResponse
    ],
)
def read_reflections(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    limit: int = Query(
        default=30,
        ge=1,
        le=100,
    ),
) -> list[ReflectionResponse]:
    reflections = list_reflections(
        database=database,
        user_id=current_user.id,
        limit=limit,
    )

    return [
        ReflectionResponse.model_validate(
            reflection
        )
        for reflection in reflections
    ]


@router.get(
    "/summary",
    response_model=(
        ReflectionSummaryResponse
    ),
)
def read_reflection_summary(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    today: date = Query(
        default_factory=date.today
    ),
) -> ReflectionSummaryResponse:
    summary = get_reflection_summary(
        database=database,
        user_id=current_user.id,
        today=today,
    )

    return ReflectionSummaryResponse(
        **summary
    )


@router.put(
    "/{reflection_id}",
    response_model=ReflectionResponse,
)
def edit_reflection(
    reflection_id: uuid.UUID,
    payload: ReflectionUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> ReflectionResponse:
    reflection = get_reflection_by_id(
        database=database,
        user_id=current_user.id,
        reflection_id=reflection_id,
    )

    if reflection is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Reflection not found."
            ),
        )

    updated = update_reflection(
        database=database,
        reflection=reflection,
        payload=payload,
    )

    return ReflectionResponse.model_validate(
        updated
    )


@router.delete(
    "/{reflection_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_reflection(
    reflection_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> Response:
    reflection = get_reflection_by_id(
        database=database,
        user_id=current_user.id,
        reflection_id=reflection_id,
    )

    if reflection is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Reflection not found."
            ),
        )

    delete_reflection(
        database=database,
        reflection=reflection,
    )

    return Response(
        status_code=(
            status.HTTP_204_NO_CONTENT
        )
    )
