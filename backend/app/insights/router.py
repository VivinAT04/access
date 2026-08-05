from datetime import date

from fastapi import (
    APIRouter,
    Query,
)

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.insights.repository import (
    build_weekly_insights,
)
from app.insights.schemas import (
    ReflectionInsightsResponse,
)


router = APIRouter(
    prefix="/insights",
    tags=["Reflection insights"],
)


@router.get(
    "/weekly",
    response_model=ReflectionInsightsResponse,
)
def read_weekly_insights(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    end_date: date | None = Query(
        default=None,
    ),
) -> ReflectionInsightsResponse:
    return build_weekly_insights(
        database=database,
        user_id=current_user.id,
        end_date=end_date,
    )
