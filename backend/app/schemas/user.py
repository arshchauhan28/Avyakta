import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: str
    username: str
    is_verified: bool
    created_at: datetime


class UserPreferenceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    language: str
    theme: str
    updated_at: datetime


class UserPreferenceUpdate(BaseModel):
    language: Optional[str] = None
    theme: Optional[str] = None
