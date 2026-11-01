from typing import Optional
from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import auth_service


def get_client_ip(request: Request) -> str:
    """Extract client IP safely from headers or connection."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Retrieve user if valid session cookie is present, otherwise return None."""
    session_token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not session_token:
        # Also check Authorization: Bearer <token> for testing/API clients
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:].strip()

    if not session_token:
        return None

    return await auth_service.get_user_from_session(db, session_token)


async def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional),
) -> User:
    """Require an authenticated user session."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Authentication required."},
        )
    return user


async def get_verified_current_user(
    user: User = Depends(get_current_user),
) -> User:
    """Require an authenticated and email-verified user."""
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "EMAIL_UNVERIFIED", "message": "Email verification is required."},
        )
    return user
