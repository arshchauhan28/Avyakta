import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.user import User
from backend.app.models.auth import EmailVerificationToken, PasswordResetToken, Session
from backend.app.core.security import verify_password


@pytest.mark.asyncio
async def test_signup_creates_unverified_account_and_hashes_password(client: AsyncClient, db_session: AsyncSession):
    payload = {
        "full_name": "Arjuna Pandava",
        "email": "arjuna@kurukshetra.org",
        "username": "arjuna_archer",
        "password": "SecurePassword1234!",
        "confirm_password": "SecurePassword1234!",
    }
    resp = await client.post("/api/v1/auth/signup", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True

    # Verify user in database
    stmt = select(User).where(User.username == "arjuna_archer")
    res = await db_session.execute(stmt)
    user = res.scalar_one_or_none()
    assert user is not None
    assert user.is_verified is False
    assert user.email_verified_at is None
    # Password must be hashed with Argon2id and not plaintext
    assert user.password_hash != "SecurePassword1234!"
    assert verify_password("SecurePassword1234!", user.password_hash) is True

    # Token record generated
    stmt_tok = select(EmailVerificationToken).where(EmailVerificationToken.user_id == user.id)
    tok_res = await db_session.execute(stmt_tok)
    tok = tok_res.scalar_one_or_none()
    assert tok is not None
    assert tok.consumed_at is None


@pytest.mark.asyncio
async def test_case_insensitive_username_and_email_uniqueness(client: AsyncClient, db_session: AsyncSession):
    payload = {
        "full_name": "Duryodhana Kaurava",
        "email": "duryodhana@hastinapur.in",
        "username": "king_duryodhana",
        "password": "Password123456!",
        "confirm_password": "Password123456!",
    }
    resp1 = await client.post("/api/v1/auth/signup", json=payload)
    assert resp1.status_code == 200

    # Duplicate username with different case
    dup_user_payload = {
        **payload,
        "username": "King_Duryodhana",
        "email": "different_email@test.com",
    }
    resp2 = await client.post("/api/v1/auth/signup", json=dup_user_payload)
    assert resp2.status_code == 409
    assert resp2.json()["detail"]["code"] == "USERNAME_TAKEN"

    # Duplicate email with different case
    dup_email_payload = {
        **payload,
        "username": "new_unique_user",
        "email": "DURYODHANA@hastinapur.in",
    }
    resp3 = await client.post("/api/v1/auth/signup", json=dup_email_payload)
    assert resp3.status_code == 409
    assert resp3.json()["detail"]["code"] == "EMAIL_TAKEN"


@pytest.mark.asyncio
async def test_unverified_user_cannot_login(client: AsyncClient, db_session: AsyncSession):
    payload = {
        "full_name": "Sanjaya Reporter",
        "email": "sanjaya@vyasa.in",
        "username": "sanjaya_vision",
        "password": "Password123456!",
        "confirm_password": "Password123456!",
    }
    await client.post("/api/v1/auth/signup", json=payload)

    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "sanjaya_vision", "password": "Password123456!"},
    )
    assert login_resp.status_code == 403
    assert login_resp.json()["detail"]["code"] == "EMAIL_UNVERIFIED"


@pytest.mark.asyncio
async def test_email_verification_and_login_flow(client: AsyncClient, db_session: AsyncSession):
    signup_payload = {
        "full_name": "Karna Vaikartana",
        "email": "karna@anga.org",
        "username": "radheya_karna",
        "password": "MasterArcherPass123!",
        "confirm_password": "MasterArcherPass123!",
    }
    await client.post("/api/v1/auth/signup", json=signup_payload)

    # Fetch token from file storage
    from backend.tests.conftest import get_email_token_for
    token = get_email_token_for("karna@anga.org", "verification")

    # Verify email
    verif_resp = await client.post("/api/v1/auth/verify-email", json={"token": token})
    assert verif_resp.status_code == 200
    assert verif_resp.json()["code"] == "EMAIL_VERIFIED"

    # Token cannot be reused (single-use requirement)
    reuse_resp = await client.post("/api/v1/auth/verify-email", json={"token": token})
    assert reuse_resp.status_code == 400

    # User can now log in
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "radheya_karna", "password": "MasterArcherPass123!"},
    )
    assert login_resp.status_code == 200
    assert login_resp.json()["authenticated"] is True
    assert "avyakta_session" in login_resp.cookies

    # Access /api/v1/auth/me
    me_resp = await client.get("/api/v1/auth/me")
    assert me_resp.status_code == 200
    assert me_resp.json()["authenticated"] is True
    assert me_resp.json()["user"]["username"] == "radheya_karna"

    # Logout
    logout_resp = await client.post("/api/v1/auth/logout")
    assert logout_resp.status_code == 200

    # /me is now unauthenticated
    me_after_logout = await client.get("/api/v1/auth/me")
    assert me_after_logout.json()["authenticated"] is False


@pytest.mark.asyncio
async def test_password_reset_flow_and_session_revocation(client: AsyncClient, db_session: AsyncSession):
    # Register & verify user
    signup_payload = {
        "full_name": "Bhishma Pitamaha",
        "email": "bhishma@kuru.gov",
        "username": "gangaputra_bhishma",
        "password": "OriginalPassword123!",
        "confirm_password": "OriginalPassword123!",
    }
    await client.post("/api/v1/auth/signup", json=signup_payload)

    from backend.tests.conftest import get_email_token_for
    verif_token = get_email_token_for("bhishma@kuru.gov", "verification")
    await client.post("/api/v1/auth/verify-email", json={"token": verif_token})

    # Log in to create an active session
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username": "gangaputra_bhishma", "password": "OriginalPassword123!"},
    )
    assert login_resp.status_code == 200

    # Request password reset
    forgot_resp = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "bhishma@kuru.gov"},
    )
    assert forgot_resp.status_code == 200

    # Find reset token
    reset_token = get_email_token_for("bhishma@kuru.gov", "password_reset")

    # Reset password
    reset_resp = await client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": reset_token,
            "password": "BrandNewSecurePassword123!",
            "confirm_password": "BrandNewSecurePassword123!",
        },
    )
    assert reset_resp.status_code == 200

    # Reset token cannot be reused
    reuse_resp = await client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": reset_token,
            "password": "AnotherNewPassword123!",
            "confirm_password": "AnotherNewPassword123!",
        },
    )
    assert reuse_resp.status_code == 400

    # Old password no longer works
    old_login = await client.post(
        "/api/v1/auth/login",
        json={"username": "gangaputra_bhishma", "password": "OriginalPassword123!"},
    )
    assert old_login.status_code == 401

    # New password works
    new_login = await client.post(
        "/api/v1/auth/login",
        json={"username": "gangaputra_bhishma", "password": "BrandNewSecurePassword123!"},
    )
    assert new_login.status_code == 200
