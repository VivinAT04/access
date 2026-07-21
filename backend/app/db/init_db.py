from app.db.base import Base
from app.db.database import engine

# Import models so SQLAlchemy registers their tables.
from app.models import User  # noqa: F401


def create_database_tables() -> None:
    Base.metadata.create_all(bind=engine)
