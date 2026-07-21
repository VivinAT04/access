from app.db.base import Base
from app.db.database import engine

from app.models import AccessibilityPreference, User  # noqa: F401


def create_database_tables() -> None:
    Base.metadata.create_all(bind=engine)
