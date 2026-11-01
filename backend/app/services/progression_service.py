import uuid
from typing import Dict, List, Optional, Tuple, Set
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.base import utc_now
from backend.app.models.user import User
from backend.app.models.progress import UserProgress
from backend.app.models.xp import UserXP, XPLedger
from backend.app.models.achievement import UserAchievement
from backend.app.schemas.progress import ProgressRead

CHAPTER_VERSE_COUNTS: Dict[int, int] = {
    1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 7: 30, 8: 28, 9: 34,
    10: 42, 11: 55, 12: 20, 13: 34, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78
}

CHAPTER_STARTS: Dict[int, int] = {}
curr = 1
for ch, count in CHAPTER_VERSE_COUNTS.items():
    CHAPTER_STARTS[ch] = curr
    curr += count


def level_id_to_global_index(level_id: str) -> Optional[int]:
    try:
        parts = level_id.split(".")
        ch, v = int(parts[0]), int(parts[1])
        if ch not in CHAPTER_VERSE_COUNTS:
            return None
        if v < 1 or v > CHAPTER_VERSE_COUNTS[ch]:
            return None
        return CHAPTER_STARTS[ch] + (v - 1)
    except Exception:
        return None


def global_index_to_level_id(index: int) -> Optional[str]:
    if index < 1 or index > 700:
        return None
    for ch, start in sorted(CHAPTER_STARTS.items(), key=lambda x: x[0], reverse=True):
        if index >= start:
            v = index - start + 1
            return f"{ch}.{v}"
    return None


def calculate_rank(total_xp: int) -> Tuple[str, str, str]:
    """Returns (rank_id, title_english, title_sanskrit)"""
    if total_xp >= 7000:
        return "paramahamsa", "Paramahamsa", "परमहंस"
    elif total_xp >= 5000:
        return "sthitaprajna", "Sthitaprajna", "स्थितप्रज्ञ"
    elif total_xp >= 3000:
        return "yogarudha", "Yogarudha", "योगारूढ"
    elif total_xp >= 1500:
        return "viveki", "Viveki", "विवेकी"
    elif total_xp >= 750:
        return "vidyarthi", "Vidyarthi", "विद्यार्थी"
    elif total_xp >= 250:
        return "sadhaka", "Sadhaka", "साधक"
    else:
        return "jijnasu", "Jijnasu", "जिज्ञासु"


class ProgressionService:
    async def get_or_create_user_xp(self, db: AsyncSession, user_id: uuid.UUID) -> UserXP:
        stmt = select(UserXP).where(UserXP.user_id == user_id)
        res = await db.execute(stmt)
        user_xp = res.scalar_one_or_none()
        if not user_xp:
            user_xp = UserXP(user_id=user_id, total_xp=0, rank_id="jijnasu")
            db.add(user_xp)
            await db.flush()
        return user_xp

    async def get_user_progress(self, db: AsyncSession, user_id: uuid.UUID) -> ProgressRead:
        # Load all progress records
        stmt = select(UserProgress).where(UserProgress.user_id == user_id)
        res = await db.execute(stmt)
        records = res.scalars().all()

        level_progress: Dict[str, List[str]] = {}
        completed_levels: List[str] = []
        highest_global_index = 0

        for r in records:
            level_progress[r.level_id] = r.completed_tasks or []
            if r.is_completed:
                completed_levels.append(r.level_id)
                g_idx = level_id_to_global_index(r.level_id)
                if g_idx and g_idx > highest_global_index:
                    highest_global_index = g_idx

        # Calculate next unlocked level
        next_idx = min(700, highest_global_index + 1)
        current_level_id = global_index_to_level_id(next_idx) or "1.1"

        # Load achievements
        stmt_ach = select(UserAchievement.achievement_id).where(UserAchievement.user_id == user_id)
        ach_res = await db.execute(stmt_ach)
        achievements = list(ach_res.scalars().all())

        # Load XP
        user_xp = await self.get_or_create_user_xp(db, user_id)
        rank_id, rank_title, rank_sanskrit = calculate_rank(user_xp.total_xp)

        return ProgressRead(
            current_level_id=current_level_id,
            completed_levels=completed_levels,
            total_xp=user_xp.total_xp,
            rank_id=rank_id,
            rank_title=rank_title,
            rank_title_sanskrit=rank_sanskrit,
            achievements=achievements,
            level_progress=level_progress,
            updated_at=user_xp.updated_at,
        )

    async def complete_task(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        level_id: str,
        task_id: str,
        perfect_challenge: bool = False,
    ) -> ProgressRead:
        target_idx = level_id_to_global_index(level_id)
        if not target_idx:
            raise ValueError("INVALID_LEVEL_ID")

        # Verify level is unlocked
        progress = await self.get_user_progress(db, user_id)
        current_idx = level_id_to_global_index(progress.current_level_id) or 1
        if target_idx > current_idx and target_idx != 1:
            raise ValueError("LEVEL_LOCKED")

        # Fetch or create progress record for this level
        stmt = select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.level_id == level_id,
        )
        res = await db.execute(stmt)
        record = res.scalar_one_or_none()

        now = utc_now()
        if not record:
            record = UserProgress(
                user_id=user_id,
                level_id=level_id,
                completed_tasks=[task_id],
                is_completed=False,
            )
            db.add(record)
        else:
            tasks = list(record.completed_tasks or [])
            if task_id not in tasks:
                tasks.append(task_id)
                record.completed_tasks = tasks
                record.updated_at = now

        # Check if all 3 tasks are finished
        tasks_set = set(record.completed_tasks)
        if {"task1", "task2", "task3"}.issubset(tasks_set) and not record.is_completed:
            record.is_completed = True
            record.completed_at = now

            # 1. Base level completion XP (20 XP)
            await self._award_xp_if_new(db, user_id, 20, "level_completion", level_id)

            # 2. Perfect challenge bonus (5 XP)
            if perfect_challenge:
                await self._award_xp_if_new(db, user_id, 5, "perfect_challenge", level_id)

            # 3. Check chapter completion bonus (100 XP)
            ch = int(level_id.split(".")[0])
            total_verses_in_ch = CHAPTER_VERSE_COUNTS[ch]
            
            # Count completed in this chapter
            stmt_ch_count = select(func.count(UserProgress.id)).where(
                UserProgress.user_id == user_id,
                UserProgress.is_completed.is_(True),
                UserProgress.level_id.like(f"{ch}.%"),
            )
            ch_count_res = await db.execute(stmt_ch_count)
            completed_in_ch = ch_count_res.scalar() or 0

            if completed_in_ch >= total_verses_in_ch:
                await self._award_xp_if_new(db, user_id, 100, "chapter_completion", f"chapter_{ch}")
                await self._unlock_achievement_if_new(db, user_id, f"chapter_{ch}_complete")

            # 4. Special achievements
            if level_id == "1.1":
                await self._unlock_achievement_if_new(db, user_id, "first-step")
            elif level_id == "2.7":
                await self._unlock_achievement_if_new(db, user_id, "arjuna-surrender")
            elif level_id == "2.47":
                await self._unlock_achievement_if_new(db, user_id, "karmanye-vadhikaraste")
            elif level_id == "18.78":
                await self._unlock_achievement_if_new(db, user_id, "gita_complete")

        await db.flush()
        return await self.get_user_progress(db, user_id)

    async def _award_xp_if_new(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        amount: int,
        reason: str,
        level_id: Optional[str] = None,
    ) -> bool:
        stmt = select(XPLedger).where(
            XPLedger.user_id == user_id,
            XPLedger.reason == reason,
            XPLedger.level_id == level_id,
        )
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            return False

        ledger_entry = XPLedger(
            user_id=user_id,
            amount=amount,
            reason=reason,
            level_id=level_id,
        )
        db.add(ledger_entry)
        await db.flush()

        # Update UserXP total
        user_xp = await self.get_or_create_user_xp(db, user_id)
        user_xp.total_xp += amount
        rank_id, _, _ = calculate_rank(user_xp.total_xp)
        user_xp.rank_id = rank_id
        user_xp.updated_at = utc_now()
        return True

    async def _unlock_achievement_if_new(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        achievement_id: str,
    ) -> bool:
        stmt = select(UserAchievement).where(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_id == achievement_id,
        )
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            return False

        ach = UserAchievement(user_id=user_id, achievement_id=achievement_id)
        db.add(ach)
        await db.flush()
        return True


progression_service = ProgressionService()
