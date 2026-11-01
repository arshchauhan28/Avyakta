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
async def test_server_authoritative_progression_and_anti_replay(client: AsyncClient, db_session: AsyncSession):
    await create_and_verify_user(client, "seeker_one", "seeker1@test.com")
    await client.post(
        "/api/v1/auth/login",
        json={"username": "seeker_one", "password": "MasterTestPassword123!"},
    )

    # Initial progress should be at 1.1 with 0 XP
    init_res = await client.get("/api/v1/progress/me")
    assert init_res.status_code == 200
    data = init_res.json()
    assert data["current_level_id"] == "1.1"
    assert data["total_xp"] == 0
    assert data["completed_levels"] == []

    # Attempting to complete locked level 1.5 fails
    locked_res = await client.post(
        "/api/v1/progress/me/tasks",
        json={"level_id": "1.5", "task_id": "task1"},
    )
    assert locked_res.status_code == 400
    assert locked_res.json()["detail"]["code"] == "LEVEL_LOCKED"

    # Complete Task 1 on 1.1
    t1_res = await client.post(
        "/api/v1/progress/me/tasks",
        json={"level_id": "1.1", "task_id": "task1"},
    )
    assert t1_res.status_code == 200
    assert "task1" in t1_res.json()["level_progress"]["1.1"]
    assert t1_res.json()["total_xp"] == 0  # not yet fully complete

    # Complete Task 2 on 1.1
    t2_res = await client.post(
        "/api/v1/progress/me/tasks",
        json={"level_id": "1.1", "task_id": "task2"},
    )
    assert t2_res.status_code == 200
    assert t2_res.json()["total_xp"] == 0

    # Complete Task 3 with perfect challenge
    t3_res = await client.post(
        "/api/v1/progress/me/tasks",
        json={"level_id": "1.1", "task_id": "task3", "perfect_challenge": True},
    )
    assert t3_res.status_code == 200
    progress = t3_res.json()
    assert "1.1" in progress["completed_levels"]
    assert progress["current_level_id"] == "1.2"
    # Base 20 XP + 5 XP perfect bonus = 25 XP
    assert progress["total_xp"] == 25
    assert "first-step" in progress["achievements"]

    # Replay 1.1 tasks: should give 0 extra XP (no duplicate reward)
    replay_res = await client.post(
        "/api/v1/progress/me/tasks",
        json={"level_id": "1.1", "task_id": "task3", "perfect_challenge": True},
    )
    assert replay_res.status_code == 200
    assert replay_res.json()["total_xp"] == 25


@pytest.mark.asyncio
async def test_guest_import_validation_and_xp_recalculation(client: AsyncClient, db_session: AsyncSession):
    await create_and_verify_user(client, "migrator_user", "migrator@test.com")
    await client.post(
        "/api/v1/auth/login",
        json={"username": "migrator_user", "password": "MasterTestPassword123!"},
    )

    # Malicious guest data with fabricated 999999 XP
    guest_payload = {
        "version": 2,
        "currentLevelId": "1.3",
        "completedLevels": ["1.1", "1.2"],
        "levelProgress": {
            "1.1": ["task1", "task2", "task3"],
            "1.2": ["task1", "task2", "task3"],
        },
        "achievements": ["first-step"],
        "totalXP": 999999,  # Server must reject this fabricated XP!
        "rank": "Gunatita",
    }

    import_res = await client.post("/api/v1/progress/me/import-guest", json=guest_payload)
    assert import_res.status_code == 200
    import_data = import_res.json()
    assert import_data["success"] is True
    assert import_data["imported_levels_count"] == 2
    # Server recalculated verified XP: 20 XP for 1.1 + 20 XP for 1.2 = 40 XP
    assert import_data["verified_xp_awarded"] == 40

    # Verify cloud progress reflects verified values
    prog_res = await client.get("/api/v1/progress/me")
    assert prog_res.status_code == 200
    assert prog_res.json()["total_xp"] == 40
    assert prog_res.json()["completed_levels"] == ["1.1", "1.2"]
    assert prog_res.json()["current_level_id"] == "1.3"


@pytest.mark.asyncio
async def test_user_data_isolation(client: AsyncClient, db_session: AsyncSession):
    # Create User A
    await create_and_verify_user(client, "user_alpha", "alpha@test.com")
    await client.post(
        "/api/v1/auth/login",
        json={"username": "user_alpha", "password": "MasterTestPassword123!"},
    )
    # Complete 1.1 for User A
    await client.post("/api/v1/progress/me/tasks", json={"level_id": "1.1", "task_id": "task1"})
    await client.post("/api/v1/progress/me/tasks", json={"level_id": "1.1", "task_id": "task2"})
    await client.post("/api/v1/progress/me/tasks", json={"level_id": "1.1", "task_id": "task3"})
    alpha_prog = (await client.get("/api/v1/progress/me")).json()
    assert alpha_prog["total_xp"] == 20
    await client.post("/api/v1/auth/logout")

    # Create User B
    await create_and_verify_user(client, "user_beta", "beta@test.com")
    await client.post(
        "/api/v1/auth/login",
        json={"username": "user_beta", "password": "MasterTestPassword123!"},
    )
    beta_prog = (await client.get("/api/v1/progress/me")).json()
    # User B must have 0 XP and no completed levels!
    assert beta_prog["total_xp"] == 0
    assert beta_prog["completed_levels"] == []
    assert beta_prog["current_level_id"] == "1.1"
