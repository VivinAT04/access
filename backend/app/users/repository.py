import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(
    database: Session,
    email: str,
) -> User | None:
    statement = select(User).where(
        User.email == email.lower()
    )

    return database.scalar(statement)


def get_user_by_id(
    database: Session,
    user_id: uuid.UUID,
) -> User | None:
    statement = select(User).where(
        User.id == user_id
    )

    return database.scalar(statement)


def create_user(
    database: Session,
    *,
    email: str,
    full_name: str,
    hashed_password: str,
) -> User:
    user = User(
        email=email.lower(),
        full_name=full_name.strip(),
        hashed_password=hashed_password,
    )

    database.add(user)
    database.commit()
    database.refresh(user)

    return user
