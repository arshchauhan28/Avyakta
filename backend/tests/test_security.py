import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.security import hash_password, verify_password, hash_token, generate_secure_token


@pytest.mark.asyncio
async def test_argon2_hashing_and_unicode_passwords():
    # Long passphrase with spaces and unicode
    plain = "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन 2026!"
    hashed = hash_password(plain)
    assert hashed != plain
    assert hashed.startswith("$argon2id$")
    assert verify_password(plain, hashed) is True
    assert verify_password("wrong password", hashed) is False


@pytest.mark.asyncio
async def test_token_hashing_is_deterministic():
    token = generate_secure_token(32)
    hash1 = hash_token(token)
    hash2 = hash_token(token)
    assert hash1 == hash2
    assert len(hash1) == 64  # SHA-256 hex digest


@pytest.mark.asyncio
async def test_signup_validation_rejects_short_password(client: AsyncClient, db_session: AsyncSession):
    # Minimum password length is 12 chars
    payload = {
        "full_name": "Short Pass User",
        "email": "shortpass@test.com",
        "username": "shortpassuser",
        "password": "short",
        "confirm_password": "short",
    }
    resp = await client.post("/api/v1/auth/signup", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_signup_validation_rejects_invalid_username_characters(client: AsyncClient, db_session: AsyncSession):
    payload = {
        "full_name": "Invalid User",
        "email": "invaliduser@test.com",
        "username": "user with spaces!",
        "password": "ValidPassword1234!",
        "confirm_password": "ValidPassword1234!",
    }
    resp = await client.post("/api/v1/auth/signup", json=payload)
    assert resp.status_code == 422
