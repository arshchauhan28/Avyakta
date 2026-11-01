import uuid
from typing import Optional
from sqlalchemy import String, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base, GUID, UTCDateTime, utc_now


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    created_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime, default=utc_now, nullable=False)
    expires_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime, nullable=False, index=True)
    revoked_at: Mapped[Optional[UTCDateTime]] = mapped_column(UTCDateTime, nullable=True)

    user = relationship("User", back_populates="sessions")

    @property
    def is_active(self) -> bool:
        now = utc_now()
        return self.revoked_at is None and self.expires_at > now


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    created_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime, default=utc_now, nullable=False)
    expires_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime, nullable=False, index=True)
    consumed_at: Mapped[Optional[UTCDateTime]] = mapped_column(UTCDateTime, nullable=True)

    user = relationship("User", back_populates="verification_tokens")

    @property
    def is_valid(self) -> bool:
        now = utc_now()
        return self.consumed_at is None and self.expires_at > now


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    created_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime, default=utc_now, nullable=False)
    expires_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime, nullable=False, index=True)
    consumed_at: Mapped[Optional[UTCDateTime]] = mapped_column(UTCDateTime, nullable=True)

    user = relationship("User", back_populates="reset_tokens")

    @property
    def is_valid(self) -> bool:
        now = utc_now()
        return self.consumed_at is None and self.expires_at > now
