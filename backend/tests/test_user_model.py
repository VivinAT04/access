from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.models.user import User


engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSession = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)


def test_create_user() -> None:
    Base.metadata.create_all(bind=engine)

    with TestingSession() as database:
        user = User(
            email="test@aksess.app",
            full_name="Test User",
            hashed_password="temporary-hashed-password",
        )

        database.add(user)
        database.commit()
        database.refresh(user)

        saved_user = database.scalar(
            select(User).where(User.email == "test@aksess.app")
        )

        assert saved_user is not None
        assert saved_user.email == "test@aksess.app"
        assert saved_user.full_name == "Test User"
        assert saved_user.is_active is True
        assert saved_user.is_verified is False
        assert saved_user.id is not None
