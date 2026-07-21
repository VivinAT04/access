from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from fastapi import Depends

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.auth.schemas import (
    TokenResponse,
    UserRegister,
    UserResponse,
)
from app.auth.service import (
    authenticate_user,
    register_user,
)
from app.core.security import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    registration: UserRegister,
    database: DatabaseDependency,
) -> UserResponse:
    try:
        user = register_user(
            database,
            email=registration.email,
            full_name=registration.full_name,
            password=registration.password,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    return UserResponse.model_validate(user)


@router.post(
    "/token",
    response_model=TokenResponse,
)
def login(
    form_data: Annotated[
        OAuth2PasswordRequestForm,
        Depends(),
    ],
    database: DatabaseDependency,
) -> TokenResponse:
    user = authenticate_user(
        database,
        email=form_data.username,
        password=form_data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=str(user.id)
    )

    return TokenResponse(
        access_token=access_token,
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def read_current_user(
    current_user: CurrentUserDependency,
) -> UserResponse:
    return UserResponse.model_validate(current_user)
