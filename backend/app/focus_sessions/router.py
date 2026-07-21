import uuid

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    Response,
    status,
)

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.focus_sessions.repository import (
    create_focus_session,
    delete_focus_session,
    get_focus_session,
    get_focus_summary,
    list_focus_sessions,
    task_belongs_to_user,
)
from app.focus_sessions.schemas import (
    FocusSessionCreate,
    FocusSessionResponse,
    FocusSummaryResponse,
)


router = APIRouter(
    prefix="/focus-sessions",
    tags=["Focus Sessions"],
)


@router.post(
    "",
    response_model=FocusSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_session(
    payload: FocusSessionCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> FocusSessionResponse:
    if (
        payload.task_id is not None and
        not task_belongs_to_user(
            database=database,
            user_id=current_user.id,
            task_id=payload.task_id,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Linked task not found.",
        )

    session = create_focus_session(
        database=database,
        user_id=current_user.id,
        payload=payload,
    )

    return FocusSessionResponse.model_validate(
        session
    )


@router.get(
    "",
    response_model=list[FocusSessionResponse],
)
def read_sessions(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
) -> list[FocusSessionResponse]:
    sessions = list_focus_sessions(
        database=database,
        user_id=current_user.id,
        limit=limit,
    )

    return [
        FocusSessionResponse.model_validate(
            session
        )
        for session in sessions
    ]


@router.get(
    "/summary",
    response_model=FocusSummaryResponse,
)
def read_summary(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> FocusSummaryResponse:
    summary = get_focus_summary(
        database=database,
        user_id=current_user.id,
    )

    return FocusSummaryResponse(
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
    session = get_focus_session(
        database=database,
        user_id=current_user.id,
        session_id=session_id,
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Focus session not found.",
        )

    delete_focus_session(
        database=database,
        session=session,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
