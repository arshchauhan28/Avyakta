"""
Test XP Parity Contract between Frontend and Backend.

Canonical XP Rules:
- Level Completion: 20 XP base
- Perfect Challenge Bonus: 5 XP
- Replay: 0 XP
- Chapter Milestone Bonus: 100 XP
- Guest Import: Verified 20 XP per unique valid level, ignores client totalXP
- Guest Import Idempotency: Duplicate imports award 0 additional XP
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from backend.tests.conftest import get_email_token_for


async def create_and_verify_user(client: AsyncClient, username: str, email: str) -> None:
    signup_payload = {
        "full_name": f"Tester {username}",
        "email": email,
        "username": username,
        "password": "MasterTestPassword123!",
        "confirm_password": "MasterTestPassword123!",
    }
    signup_res = await client.post("/api/v1/auth/signup", json=signup_payload)
    assert signup_res.status_code == 200, f"Signup failed: {signup_res.text}"
    token = get_email_token_for(email, "verification")
    verif_res = await client.post("/api/v1/auth/verify-email", json={"token": token})
    assert verif_res.status_code == 200, f"Verification failed: {verif_res.text}"


@pytest.mark.asyncio
async def test_canonical_xp_normal_and_perfect_completion(client: AsyncClient, db_session: AsyncSession):
    """Verify normal completion awards 20 XP and perfect challenge adds 5 XP (total 25 XP)."""
    await create_and_verify_user(client, "xp_player_one", "xpplayer1@test.com")
    await client.post(
        "/api/v1/auth/login",
        json={"username": "xp_player_one", "password": "MasterTestPassword123!"},
    )

    # Level 1.1 normal completion (without perfect challenge)
    await client.post("/api/v1/progress/me/tasks", json={"level_id": "1.1", "task_id": "task1"})
    await client.post("/api/v1/progress/me/tasks", json={"level_id": "1.1", "task_id": "task2"})
    r1 = await client.post(
        "/api/v1/progress/me/tasks",
        json={"level_id": "1.1", "task_id": "task3", "perfect_challenge": False},
    )
    assert r1.status_code == 200
    prog1 = r1.json()
    assert prog1["total_xp"] == 20, "Normal level completion must award exactly 20 XP"

    # Level 1.2 completion WITH perfect challenge
    await client.post("/api/v1/progress/me/tasks", json={"level_id": "1.2", "task_id": "task1"})
    await client.post("/api/v1/progress/me/tasks", json={"level_id": "1.2", "task_id": "task2"})
    r2 = await client.post(
        "/api/v1/progress/me/tasks",
        json={"level_id": "1.2", "task_id": "task3", "perfect_challenge": True},
    )
    assert r2.status_code == 200
    prog2 = r2.json()
    # 20 from 1.1 + (20 base + 5 perfect) from 1.2 = 45 XP
    assert prog2["total_xp"] == 45, "Level with perfect challenge must award 20 + 5 = 25 XP"


@pytest.mark.asyncio
async def test_xp_replay_protection(client: AsyncClient, db_session: AsyncSession):
    """Verify replaying an already-completed level awards 0 additional XP."""
    await create_and_verify_user(client, "xp_player_replay", "xpreplay@test.com")
    await client.post(
        "/api/v1/auth/login",
        json={"username": "xp_player_replay", "password": "MasterTestPassword123!"},
    )

    # Complete 1.1
    await client.post("/api/v1/progress/me/tasks", json={"level_id": "1.1", "task_id": "task1"})
    await client.post("/api/v1/progress/me/tasks", json={"level_id": "1.1", "task_id": "task2"})
    res = await client.post(
        "/api/v1/progress/me/tasks",
        json={"level_id": "1.1", "task_id": "task3", "perfect_challenge": True},
    )
    assert res.json()["total_xp"] == 25

    # Replay all 3 tasks with perfect challenge
    await client.post("/api/v1/progress/me/tasks", json={"level_id": "1.1", "task_id": "task1"})
    await client.post("/api/v1/progress/me/tasks", json={"level_id": "1.1", "task_id": "task2"})
    replay_res = await client.post(
        "/api/v1/progress/me/tasks",
        json={"level_id": "1.1", "task_id": "task3", "perfect_challenge": True},
    )
    assert replay_res.status_code == 200
    assert replay_res.json()["total_xp"] == 25, "Replaying a completed level must award 0 additional XP"


@pytest.mark.asyncio
async def test_guest_import_canonical_xp_and_idempotency(client: AsyncClient, db_session: AsyncSession):
    """Verify guest import recalculates 20 XP per completed level, ignores client totalXP, and is idempotent."""
    await create_and_verify_user(client, "xp_migrator", "xpmigrator@test.com")
    await client.post(
        "/api/v1/auth/login",
        json={"username": "xp_migrator", "password": "MasterTestPassword123!"},
    )

    # 3 levels completed in guest mode, client claims 8888 XP
    guest_payload = {
        "version": 2,
        "currentLevelId": "1.4",
        "completedLevels": ["1.1", "1.2", "1.3"],
        "levelProgress": {
            "1.1": ["task1", "task2", "task3"],
            "1.2": ["task1", "task2", "task3"],
            "1.3": ["task1", "task2", "task3"],
        },
        "achievements": ["first-step"],
        "totalXP": 8888,
        "rank": "Gunatita",
    }

    import_res = await client.post("/api/v1/progress/me/import-guest", json=guest_payload)
    assert import_res.status_code == 200
    data = import_res.json()
    # 3 levels * 20 base XP = 60 XP
    assert data["verified_xp_awarded"] == 60
    assert data["imported_levels_count"] == 3

    # Check /progress/me
    p1 = await client.get("/api/v1/progress/me")
    assert p1.json()["total_xp"] == 60

    # Idempotent re-import: same payload should award 0 additional XP
    re_import_res = await client.post("/api/v1/progress/me/import-guest", json=guest_payload)
    assert re_import_res.status_code == 200
    re_data = re_import_res.json()
    assert re_data["verified_xp_awarded"] == 0
    assert re_data["imported_levels_count"] == 0

    p2 = await client.get("/api/v1/progress/me")
    assert p2.json()["total_xp"] == 60, "Duplicate guest import must not inflate XP"
