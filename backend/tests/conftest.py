import asyncio
import os
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# Point settings to dedicated in-memory or file test DB before importing app
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["EMAIL_BACKEND"] = "file"
os.environ["APP_ENV"] = "test"

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import logging
logging.getLogger("aiosqlite").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy").setLevel(logging.WARNING)

from backend.app.core.config import settings
from backend.app.database.base import Base
from backend.app.database.session import get_db
from backend.app.main import app

# Create test async engine
test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(autouse=True)
def clean_emails():
    """Clean test email directory before each test."""
    emails_dir = Path(__file__).resolve().parent.parent / "data" / "emails"
    emails_dir.mkdir(parents=True, exist_ok=True)
    for f in emails_dir.glob("*.json"):
        try:
            f.unlink()
        except Exception:
            pass
    yield


def get_email_token_for(email: str, email_type: str = "verification") -> str:
    import json
    emails_dir = Path(__file__).resolve().parent.parent / "data" / "emails"
    matching = []
    for f in emails_dir.glob(f"{email_type}_*.json"):
        try:
            with open(f, "r", encoding="utf-8") as fp:
                data = json.load(fp)
                if data.get("to") == email:
                    matching.append((f.stat().st_mtime, data.get("token")))
        except Exception:
            pass
    if not matching:
        raise ValueError(f"No {email_type} email found for {email}")
    matching.sort(key=lambda x: x[0])
    return matching[-1][1]


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        try:
            yield db_session
            await db_session.commit()
        except Exception:
            await db_session.rollback()
            raise

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

    app.dependency_overrides.clear()
