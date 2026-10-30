"""
Database engine configuration and session provider using SQLAlchemy 2.0.
"""

import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.models import Base

# Database URL from environment variable or standard PostgreSQL default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/aicte_complaints"
)

# Engine configuration with connection pooling for high-throughput government portals
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    echo=os.getenv("SQL_DEBUG", "false").lower() == "true"
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)


def init_db() -> None:
    """Create all tables in the database if not already present."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session and safely closes it
    upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
