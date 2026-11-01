from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.dependencies import get_current_user
from backend.app.database.base import utc_now
from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.models.preference import UserPreference
from backend.app.schemas.user import UserRead, UserPreferenceRead, UserPreferenceUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserRead)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return UserRead.model_validate(current_user)


@router.get("/me/preferences", response_model=UserPreferenceRead)
async def get_my_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UserPreference).where(UserPreference.user_id == current_user.id)
    res = await db.execute(stmt)
    pref = res.scalar_one_or_none()
    if not pref:
        pref = UserPreference(user_id=current_user.id, language="en", theme="light")
        db.add(pref)
        await db.flush()
    return UserPreferenceRead.model_validate(pref)


@router.patch("/me/preferences", response_model=UserPreferenceRead)
async def update_my_preferences(
    req: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UserPreference).where(UserPreference.user_id == current_user.id)
    res = await db.execute(stmt)
    pref = res.scalar_one_or_none()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    if req.language is not None and req.language in ["en", "hi"]:
        pref.language = req.language
    if req.theme is not None and req.theme in ["light", "dark", "parchment"]:
        pref.theme = req.theme

    pref.updated_at = utc_now()
    await db.flush()
    return UserPreferenceRead.model_validate(pref)
