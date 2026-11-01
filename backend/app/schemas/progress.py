from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class TaskCompleteRequest(BaseModel):
    level_id: str = Field(..., pattern=r"^(1[0-8]|[1-9])\.(7[0-2]|[1-6]?[0-9])$")
    task_id: str = Field(..., pattern=r"^(task[1-3]|reading|understanding|challenge)$")
    perfect_challenge: Optional[bool] = False

    def model_post_init(self, __context):
        mapping = {"reading": "task1", "understanding": "task2", "challenge": "task3"}
        if self.task_id in mapping:
            self.task_id = mapping[self.task_id]


class ProgressRead(BaseModel):
    current_level_id: str
    completed_levels: List[str]
    total_xp: int
    rank_id: str
    rank_title: str
    rank_title_sanskrit: str
    achievements: List[str]
    level_progress: Dict[str, List[str]]
    updated_at: datetime


class GuestImportRequest(BaseModel):
    version: int = 2
    currentLevelId: str = Field(default="1.1")
    completedLevels: List[str] = Field(default_factory=list)
    levelProgress: Dict[str, List[str]] = Field(default_factory=dict)
    achievements: List[str] = Field(default_factory=list)
    totalXP: int = Field(default=0)
    rank: Optional[str] = None


class GuestImportResponse(BaseModel):
    success: bool
    imported_levels_count: int
    verified_xp_awarded: int
    achievements_unlocked: List[str]
    message: str
