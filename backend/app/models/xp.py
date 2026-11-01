import uuid
from typing import Optional
from sqlalchemy import Integer, String, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base, GUID, UTCDateTime, utc_now


class UserXP(Base):
    __tablename__ = "user_xp"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    total_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rank_id: Mapped[str] = mapped_column(String(32), default="jijnasu", nullable=False)
    updated_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="xp")


class XPLedger(Base):
    __tablename__ = "xp_ledger"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(64), nullable=False)
    level_id: Mapped[Optional[str]] = mapped_column(String(16), nullable=True, index=True)
    created_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="xp_ledger")

    __table_args__ = (
        # Idempotency constraint: a user can only receive XP once per reason + level_id
        UniqueConstraint("user_id", "reason", "level_id", name="uq_user_xp_reason_level"),
    )
