import uuid
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.database import get_db
from app.models.user import User
from app.users.repository import get_user_by_id


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/token"
)

DatabaseDependency = Annotated[
    Session,
    Depends(get_db),
]

TokenDependency = Annotated[
    str,
    Depends(oauth2_scheme),
]


def get_current_user(
    token: TokenDependency,
    database: DatabaseDependency,
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[ALGORITHM],
        )

        subject = payload.get("sub")

        if subject is None:
            raise credentials_exception

        user_id = uuid.UUID(subject)

    except (
        InvalidTokenError,
        ValueError,
    ) as error:
        raise credentials_exception from error

    user = get_user_by_id(
        database,
        user_id,
    )

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account is inactive.",
        )

    return user


CurrentUserDependency = Annotated[
    User,
    Depends(get_current_user),
]
