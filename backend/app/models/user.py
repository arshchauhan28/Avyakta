import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base, GUID, UTCDateTime, utc_now

if TYPE_CHECKING:
    from backend.app.models.auth import Session, EmailVerificationToken, PasswordResetToken
    from backend.app.models.progress import UserProgress
    from backend.app.models.xp import UserXP, XPLedger
    from backend.app.models.achievement import UserAchievement
    from backend.app.models.preference import UserPreference


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    normalized_email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    normalized_username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    
    email_verified_at: Mapped[Optional[UTCDateTime]] = mapped_column(UTCDateTime, nullable=True)
    created_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime, default=utc_now, nullable=False)
    updated_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    verification_tokens: Mapped[List["EmailVerificationToken"]] = relationship("EmailVerificationToken", back_populates="user", cascade="all, delete-orphan")
    reset_tokens: Mapped[List["PasswordResetToken"]] = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
    progress: Mapped[List["UserProgress"]] = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    xp: Mapped[Optional["UserXP"]] = relationship("UserXP", back_populates="user", uselist=False, cascade="all, delete-orphan")
    xp_ledger: Mapped[List["XPLedger"]] = relationship("XPLedger", back_populates="user", cascade="all, delete-orphan")
    achievements: Mapped[List["UserAchievement"]] = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    preferences: Mapped[Optional["UserPreference"]] = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")

    @property
    def is_verified(self) -> bool:
        return self.email_verified_at is not None

    def __repr__(self) -> str:
        return f"<User {self.username} ({self.email})>"
