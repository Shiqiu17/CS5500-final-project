"""Database setup and utilities for the WhatToDo application."""
import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()

DEFAULT_SQLITE_URL = "sqlite:///./whattodo.db"
TARGET_DB = "what-to-do-db"


class Base(DeclarativeBase):
    pass


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)


def ensure_postgres_database(url: str, db_name: str) -> str:
    """
    If using PostgreSQL, ensure the target database exists.
    Returns a URL pointing to the target database.
    """
    if not url.startswith("postgresql"):
        return url

    base_url = url.rsplit("/", 1)[0]
    admin_url = f"{base_url}/postgres"

    engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")

    try:
        with engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :db"),
                {"db": db_name},
            ).scalar()

            if not exists:
                conn.execute(text(f'CREATE DATABASE "{db_name}"'))
    finally:
        engine.dispose()

    return f"{base_url}/{db_name}"


def create_db_engine():
    url = get_database_url()
    resolved_url = ensure_postgres_database(url, TARGET_DB)

    connect_args = (
        {"check_same_thread": False}
        if resolved_url.startswith("sqlite")
        else {}
    )

    return create_engine(resolved_url, connect_args=connect_args)


engine = create_db_engine()

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


def init_db() -> None:
    import app.models.user  # noqa: F401
    import app.models.saved_event  # noqa: F401
    import app.models.planner  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
