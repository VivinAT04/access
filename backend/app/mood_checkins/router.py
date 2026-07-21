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
from app.mood_checkins.repository import (
    create_mood_checkin,
    delete_mood_checkin,
    deserialize_emotions,
    get_mood_checkin,
    get_mood_summary,
    list_mood_checkins,
)
from app.mood_checkins.schemas import (
    MoodCheckinCreate,
    MoodCheckinResponse,
    MoodSummaryResponse,
)


router = APIRouter(
    prefix="/mood-checkins",
    tags=["Mood Check-ins"],
)


def to_response(
    checkin,
) -> MoodCheckinResponse:
    return MoodCheckinResponse(
        id=checkin.id,
        user_id=checkin.user_id,
        mood_score=checkin.mood_score,
        energy_level=checkin.energy_level,
        stress_level=checkin.stress_level,
        emotions=deserialize_emotions(
            checkin.emotions
        ),
        note=checkin.note,
        created_at=checkin.created_at,
    )


@router.post(
    "",
    response_model=MoodCheckinResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_checkin(
    payload: MoodCheckinCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> MoodCheckinResponse:
    checkin = create_mood_checkin(
        database=database,
        user_id=current_user.id,
        payload=payload,
    )

    return to_response(checkin)


@router.get(
    "",
    response_model=list[MoodCheckinResponse],
)
def read_checkins(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    limit: int = Query(
        default=30,
        ge=1,
        le=100,
    ),
) -> list[MoodCheckinResponse]:
    checkins = list_mood_checkins(
        database=database,
        user_id=current_user.id,
        limit=limit,
    )

    return [
        to_response(checkin)
        for checkin in checkins
    ]


@router.get(
    "/summary",
    response_model=MoodSummaryResponse,
)
def read_summary(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> MoodSummaryResponse:
    summary = get_mood_summary(
        database=database,
        user_id=current_user.id,
    )

    return MoodSummaryResponse(
        **summary
    )


@router.delete(
    "/{checkin_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_checkin(
    checkin_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> Response:
    checkin = get_mood_checkin(
        database=database,
        user_id=current_user.id,
        checkin_id=checkin_id,
    )

    if checkin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mood check-in not found.",
        )

    delete_mood_checkin(
        database=database,
        checkin=checkin,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
