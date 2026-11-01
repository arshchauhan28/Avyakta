import os
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "avyakta-super-secret-development-key-change-in-production-min32chars"
    SERVER_HOST: str = "127.0.0.1"
    SERVER_PORT: int = 8000
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # Database: SQLite default, PostgreSQL fully supported
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/avyakta.db"
    DIRECT_DATABASE_URL: Optional[str] = None

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        elif url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql+asyncpg://"):
            return url.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
        return url

    @property
    def sync_direct_database_url(self) -> str:
        url = self.DIRECT_DATABASE_URL or self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        elif url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql+asyncpg://"):
            return url.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
        elif url.startswith("sqlite+aiosqlite://"):
            return url.replace("sqlite+aiosqlite://", "sqlite://", 1)
        return url

    # Session Cookie Settings
    SESSION_COOKIE_NAME: str = "avyakta_session"
    SESSION_COOKIE_SECURE: bool = False
    SESSION_COOKIE_SAMESITE: str = "lax"
    SESSION_COOKIE_DOMAIN: Optional[str] = None
    SESSION_EXPIRE_DAYS: int = 14

    # Email Delivery
    EMAIL_BACKEND: str = "file"  # 'file', 'smtp', or 'console'
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_USE_TLS: bool = True
    EMAIL_FROM: str = "Avyakta <no-reply@avyakta.app>"

    # Security & Rate Limiting
    RATE_LIMIT_LOGIN_ATTEMPTS: int = 5
    RATE_LIMIT_LOGIN_WINDOW_MINUTES: int = 15
    RATE_LIMIT_RESET_ATTEMPTS: int = 3
    RATE_LIMIT_RESET_WINDOW_MINUTES: int = 60
    RATE_LIMIT_SIGNUP_ATTEMPTS: int = 5
    RATE_LIMIT_SIGNUP_WINDOW_MINUTES: int = 60

    # Verification and Reset Token Expirations
    VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24
    RESET_TOKEN_EXPIRE_MINUTES: int = 60

    @property
    def cors_origins(self) -> List[str]:
        origins = [self.FRONTEND_ORIGIN.rstrip("/")]
        if "localhost" in self.FRONTEND_ORIGIN:
            origins.extend([
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3001",
                "http://localhost:8000",
                "http://127.0.0.1:8000",
            ])
        return list(set(origins))


settings = Settings()
