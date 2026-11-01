import uuid
from typing import Optional, List
from sqlalchemy import String, Boolean, JSON, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database.base import Base, GUID, UTCDateTime, utc_now


class UserProgress(Base):
    __tablename__ = "user_progress"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    level_id: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    
    # Store list of completed tasks, e.g. ["task1", "task2", "task3"]
    completed_tasks: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    
    completed_at: Mapped[Optional[UTCDateTime]] = mapped_column(UTCDateTime, nullable=True)
    updated_at: Mapped[UTCDateTime] = mapped_column(UTCDateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="progress")

    __table_args__ = (
        UniqueConstraint("user_id", "level_id", name="uq_user_level_progress"),
    )

    def __repr__(self) -> str:
        return f"<UserProgress user={self.user_id} level={self.level_id} done={self.is_completed}>"
