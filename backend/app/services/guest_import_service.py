import uuid
from typing import List, Dict, Set
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.base import utc_now
from backend.app.models.user import User
from backend.app.models.progress import UserProgress
from backend.app.schemas.progress import GuestImportRequest, GuestImportResponse
from backend.app.services.progression_service import (
    progression_service,
    level_id_to_global_index,
    CHAPTER_VERSE_COUNTS,
)


class GuestImportService:
    async def import_guest_progress(
        self,
        db: AsyncSession,
        user: User,
        data: GuestImportRequest,
    ) -> GuestImportResponse:
        """Safely import guest progress, validating levels and calculating verified XP."""
        # 1. Filter and validate completed levels
        valid_completed: List[str] = []
        for lvl in data.completedLevels:
            idx = level_id_to_global_index(lvl)
            if idx and 1 <= idx <= 700:
                if lvl not in valid_completed:
                    valid_completed.append(lvl)

        # Sort valid completed levels sequentially
        valid_completed.sort(key=lambda x: level_id_to_global_index(x) or 0)

        imported_count = 0
        now = utc_now()

        # Get initial XP to accurately measure incremental awarded XP
        initial_user_xp = await progression_service.get_or_create_user_xp(db, user.id)
        initial_xp = initial_user_xp.total_xp

        # 2. Upsert UserProgress records
        for lvl in valid_completed:
            stmt = select(UserProgress).where(
                UserProgress.user_id == user.id,
                UserProgress.level_id == lvl,
            )
            res = await db.execute(stmt)
            prog = res.scalar_one_or_none()

            raw_tasks = data.levelProgress.get(lvl, ["task1", "task2", "task3"])
            valid_tasks = [t for t in raw_tasks if t in ["task1", "task2", "task3"]]
            if not valid_tasks:
                valid_tasks = ["task1", "task2", "task3"]

            if not prog:
                prog = UserProgress(
                    user_id=user.id,
                    level_id=lvl,
                    completed_tasks=valid_tasks,
                    is_completed=True,
                    completed_at=now,
                )
                db.add(prog)
                imported_count += 1
            else:
                if not prog.is_completed:
                    prog.is_completed = True
                    prog.completed_tasks = ["task1", "task2", "task3"]
                    prog.completed_at = now
                    imported_count += 1

            # Award verified base XP (20 XP) if not already awarded
            await progression_service._award_xp_if_new(db, user.id, 20, "level_completion", lvl)

        # 3. Check chapter completion rewards
        completed_set = set(valid_completed)
        chapters_completed: List[int] = []
        for ch, count in CHAPTER_VERSE_COUNTS.items():
            ch_levels = {f"{ch}.{v}" for v in range(1, count + 1)}
            if ch_levels.issubset(completed_set):
                chapters_completed.append(ch)
                await progression_service._award_xp_if_new(
                    db, user.id, 100, "chapter_completion", f"chapter_{ch}"
                )
                await progression_service._unlock_achievement_if_new(
                    db, user.id, f"chapter_{ch}_complete"
                )

        # 4. Award standard milestone achievements if qualifying
        achievements_unlocked: List[str] = []
        if "1.1" in completed_set:
            if await progression_service._unlock_achievement_if_new(db, user.id, "first-step"):
                achievements_unlocked.append("first-step")
        if "2.7" in completed_set:
            if await progression_service._unlock_achievement_if_new(db, user.id, "arjuna-surrender"):
                achievements_unlocked.append("arjuna-surrender")
        if "2.47" in completed_set:
            if await progression_service._unlock_achievement_if_new(db, user.id, "karmanye-vadhikaraste"):
                achievements_unlocked.append("karmanye-vadhikaraste")
        if "18.78" in completed_set:
            if await progression_service._unlock_achievement_if_new(db, user.id, "gita_complete"):
                achievements_unlocked.append("gita_complete")

        await db.flush()

        # Load final calculated XP
        user_xp = await progression_service.get_or_create_user_xp(db, user.id)
        incremental_xp_awarded = user_xp.total_xp - initial_xp

        return GuestImportResponse(
            success=True,
            imported_levels_count=imported_count,
            verified_xp_awarded=incremental_xp_awarded,
            achievements_unlocked=achievements_unlocked,
            message=f"Successfully imported {len(valid_completed)} verified levels with server-verified XP.",
        )


guest_import_service = GuestImportService()
