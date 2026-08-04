import uuid

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    Response,
    status,
)

from app.anxiety_sessions.repository import (
    create_anxiety_session,
    delete_anxiety_session,
    get_anxiety_session,
    get_anxiety_summary,
    list_anxiety_sessions,
)
from app.anxiety_sessions.schemas import (
    AnxietySessionCreate,
    AnxietySessionResponse,
    AnxietySummaryResponse,
)
from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)


router = APIRouter(
    prefix="/anxiety-sessions",
    tags=["Anxiety and Grounding"],
)


@router.post(
    "",
    response_model=AnxietySessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_session(
    payload: AnxietySessionCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> AnxietySessionResponse:
    session = create_anxiety_session(
        database=database,
        user_id=current_user.id,
        payload=payload,
    )

    return AnxietySessionResponse.model_validate(
        session
    )


@router.get(
    "",
    response_model=list[
        AnxietySessionResponse
    ],
)
def read_sessions(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    limit: int = Query(
        default=30,
        ge=1,
        le=100,
    ),
) -> list[AnxietySessionResponse]:
    sessions = list_anxiety_sessions(
        database=database,
        user_id=current_user.id,
        limit=limit,
    )

    return [
        AnxietySessionResponse.model_validate(
            session
        )
        for session in sessions
    ]


@router.get(
    "/summary",
    response_model=AnxietySummaryResponse,
)
def read_summary(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> AnxietySummaryResponse:
    summary = get_anxiety_summary(
        database=database,
        user_id=current_user.id,
    )

    return AnxietySummaryResponse(
        **summary
    )


@router.delete(
    "/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_session(
    session_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> Response:
    session = get_anxiety_session(
        database=database,
        user_id=current_user.id,
        session_id=session_id,
    )

    if session is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Anxiety session not found."
            ),
        )

    delete_anxiety_session(
        database=database,
        session=session,
    )

    return Response(
        status_code=(
            status.HTTP_204_NO_CONTENT
        )
    )
