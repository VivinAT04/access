from fastapi import APIRouter

from app.auth.dependencies import (
    CurrentUserDependency,
)
from app.support_resources.repository import (
    list_expert_support,
    list_resources,
    read_safeguarding,
)
from app.support_resources.schemas import (
    ExpertSupportEntry,
    SafeguardingGuide,
    SupportResource,
)


router = APIRouter(
    prefix="/support",
    tags=["Wellbeing support"],
)


@router.get(
    "/resources",
    response_model=list[SupportResource],
)
def read_resources(
    current_user: CurrentUserDependency,
) -> list[SupportResource]:
    del current_user

    return list_resources()


@router.get(
    "/experts",
    response_model=list[ExpertSupportEntry],
)
def read_experts(
    current_user: CurrentUserDependency,
) -> list[ExpertSupportEntry]:
    del current_user

    return list_expert_support()


@router.get(
    "/safeguarding",
    response_model=SafeguardingGuide,
)
def read_safeguarding_guide(
    current_user: CurrentUserDependency,
) -> SafeguardingGuide:
    del current_user

    return read_safeguarding()
