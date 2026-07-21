from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
)
from app.models.user import User
from app.users.repository import (
    create_user,
    get_user_by_email,
)


def register_user(
    database: Session,
    *,
    email: str,
    full_name: str,
    password: str,
) -> User:
    existing_user = get_user_by_email(
        database,
        email,
    )

    if existing_user is not None:
        raise ValueError(
            "An account with this email already exists."
        )

    return create_user(
        database,
        email=email,
        full_name=full_name,
        hashed_password=hash_password(password),
    )


def authenticate_user(
    database: Session,
    *,
    email: str,
    password: str,
) -> User | None:
    user = get_user_by_email(
        database,
        email,
    )

    if user is None:
        return None

    if not verify_password(
        password,
        user.hashed_password,
    ):
        return None

    if not user.is_active:
        return None

    return user
