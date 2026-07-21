from sqlalchemy import select

from app.models.user import User
from tests.conftest import TestingSessionLocal


def test_create_user() -> None:
    with TestingSessionLocal() as database:
        user = User(
            email="test@aksess.app",
            full_name="Test User",
            hashed_password="temporary-password-hash",
        )

        database.add(user)
        database.commit()
        database.refresh(user)

        saved_user = database.scalar(
            select(User).where(
                User.email == "test@aksess.app"
            )
        )

        assert saved_user is not None
        assert saved_user.id is not None
        assert saved_user.full_name == "Test User"
        assert saved_user.is_active is True
        assert saved_user.is_verified is False
