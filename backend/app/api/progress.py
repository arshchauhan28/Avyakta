from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.dependencies import get_current_user, get_verified_current_user
from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.schemas.progress import (
    ProgressRead,
    TaskCompleteRequest,
    GuestImportRequest,
    GuestImportResponse,
)
from backend.app.services.progression_service import progression_service
from backend.app.services.guest_import_service import guest_import_service

router = APIRouter(prefix="/progress", tags=["Learning Progression"])


@router.get("/me", response_model=ProgressRead)
async def get_my_progress(
    current_user: User = Depends(get_verified_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full server-authoritative progress for the authenticated user."""
    return await progression_service.get_user_progress(db, current_user.id)


@router.post("/me/tasks", response_model=ProgressRead)
async def complete_task(
    req: TaskCompleteRequest,
    current_user: User = Depends(get_verified_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit completion of a task within a level.
    When task1, task2, and task3 are completed, the level is completed and verified XP is awarded.
    """
    try:
        updated = await progression_service.complete_task(
            db=db,
            user_id=current_user.id,
            level_id=req.level_id,
            task_id=req.task_id,
            perfect_challenge=bool(req.perfect_challenge),
        )
        return updated
    except ValueError as e:
        code = str(e)
        if code == "LEVEL_LOCKED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "LEVEL_LOCKED", "message": "This level is locked. Complete preceding levels sequentially."},
            )
        elif code == "INVALID_LEVEL_ID":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_LEVEL_ID", "message": "Invalid chapter or verse number."},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "BAD_REQUEST", "message": str(e)},
            )


@router.post("/me/import-guest", response_model=GuestImportResponse)
async def import_guest_progress(
    req: GuestImportRequest,
    current_user: User = Depends(get_verified_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Import and validate client LocalStorage progress into cloud account with server-verified XP."""
    return await guest_import_service.import_guest_progress(db, current_user, req)
