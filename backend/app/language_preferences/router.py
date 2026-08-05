from fastapi import APIRouter

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.language_preferences.repository import (
    get_or_create_preference,
    update_preference,
)
from app.language_preferences.schemas import (
    LanguagePreferenceResponse,
    LanguagePreferenceUpdate,
)


router = APIRouter(
    prefix="/language-preferences",
    tags=["Language and reading support"],
)


@router.get(
    "",
    response_model=LanguagePreferenceResponse,
)
def read_language_preference(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> LanguagePreferenceResponse:
    return get_or_create_preference(
        database=database,
        user_id=current_user.id,
    )


@router.put(
    "",
    response_model=LanguagePreferenceResponse,
)
def edit_language_preference(
    payload: LanguagePreferenceUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> LanguagePreferenceResponse:
    preference = get_or_create_preference(
        database=database,
        user_id=current_user.id,
    )

    return update_preference(
        database=database,
        preference=preference,
        payload=payload,
    )
