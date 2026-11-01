import uuid
from datetime import timedelta
from typing import Optional, Tuple
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.core.security import (
    hash_password,
    verify_password,
    generate_secure_token,
    hash_token,
)
from backend.app.database.base import utc_now
from backend.app.models.user import User
from backend.app.models.auth import Session, EmailVerificationToken, PasswordResetToken
from backend.app.models.xp import UserXP
from backend.app.models.preference import UserPreference
from backend.app.schemas.auth import SignupRequest
from backend.app.services.email_service import email_service


class AuthService:
    async def get_user_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        normalized = username.strip().lower()
        stmt = select(User).where(User.normalized_username == normalized)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_user_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        normalized = email.strip().lower()
        stmt = select(User).where(User.normalized_email == normalized)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def signup(self, db: AsyncSession, req: SignupRequest) -> Tuple[User, str]:
        """Create a new unverified user and issue a verification token."""
        normalized_username = req.username.strip().lower()
        normalized_email = req.email.strip().lower()

        # Database uniqueness check
        if await self.get_user_by_username(db, normalized_username):
            raise ValueError("USERNAME_TAKEN")
        if await self.get_user_by_email(db, normalized_email):
            raise ValueError("EMAIL_TAKEN")

        # Create user
        pwd_hash = hash_password(req.password)
        user = User(
            full_name=req.full_name.strip(),
            email=req.email.strip(),
            normalized_email=normalized_email,
            username=req.username.strip(),
            normalized_username=normalized_username,
            password_hash=pwd_hash,
            email_verified_at=None,
        )
        db.add(user)
        await db.flush()

        # Initialize XP & preferences
        user_xp = UserXP(user_id=user.id, total_xp=0, rank_id="jijnasu")
        user_lang = req.language if req.language in ("en", "hi") else "en"
        user_pref = UserPreference(user_id=user.id, language=user_lang, theme="light")
        db.add_all([user_xp, user_pref])

        # Generate single-use verification token
        raw_token = generate_secure_token(32)
        token_hash = hash_token(raw_token)
        expires_at = utc_now() + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)

        verif_token = EmailVerificationToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(verif_token)
        await db.flush()

        # Send verification email
        email_sent = email_service.send_verification_email(
            user.email, user.username, raw_token, lang=user_lang
        )

        return user, raw_token, email_sent

    async def verify_email(self, db: AsyncSession, raw_token: str) -> bool:
        """Validate verification token and activate account."""
        token_hash = hash_token(raw_token.strip())
        now = utc_now()

        stmt = select(EmailVerificationToken).where(
            EmailVerificationToken.token_hash == token_hash,
            EmailVerificationToken.consumed_at.is_(None),
            EmailVerificationToken.expires_at > now,
        )
        res = await db.execute(stmt)
        token_record = res.scalar_one_or_none()

        if not token_record:
            return False

        # Mark token consumed
        token_record.consumed_at = now

        # Activate user
        stmt_user = select(User).where(User.id == token_record.user_id)
        user_res = await db.execute(stmt_user)
        user = user_res.scalar_one_or_none()
        if user and not user.email_verified_at:
            user.email_verified_at = now

        # Invalidate any other pending verification tokens for this user
        stmt_invalidate = (
            update(EmailVerificationToken)
            .where(
                EmailVerificationToken.user_id == token_record.user_id,
                EmailVerificationToken.consumed_at.is_(None),
                EmailVerificationToken.id != token_record.id,
            )
            .values(consumed_at=now)
        )
        await db.execute(stmt_invalidate)
        await db.commit()

        return True

    async def resend_verification(self, db: AsyncSession, email: str) -> bool:
        """Resend activation link if account exists and is not yet verified."""
        user = await self.get_user_by_email(db, email)
        if not user or user.is_verified:
            # Generic response to prevent account enumeration
            return True

        now = utc_now()
        # Invalidate prior tokens
        stmt_invalidate = (
            update(EmailVerificationToken)
            .where(
                EmailVerificationToken.user_id == user.id,
                EmailVerificationToken.consumed_at.is_(None),
            )
            .values(consumed_at=now)
        )
        await db.execute(stmt_invalidate)

        # Create new token
        raw_token = generate_secure_token(32)
        token_hash = hash_token(raw_token)
        expires_at = now + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)

        verif_token = EmailVerificationToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(verif_token)
        await db.flush()

        # Fetch user's preferred language
        pref_stmt = select(UserPreference).where(UserPreference.user_id == user.id)
        pref_res = await db.execute(pref_stmt)
        pref = pref_res.scalar_one_or_none()
        user_lang = pref.language if pref else "en"

        email_sent = email_service.send_verification_email(
            user.email, user.username, raw_token, lang=user_lang
        )
        return email_sent

    async def login(self, db: AsyncSession, username: str, password: str) -> Tuple[User, str]:
        """Authenticate user by username and password, issuing an opaque session."""
        user = await self.get_user_by_username(db, username)
        if not user:
            raise ValueError("INVALID_CREDENTIALS")

        if not verify_password(password, user.password_hash):
            raise ValueError("INVALID_CREDENTIALS")

        if not user.is_verified:
            raise ValueError("EMAIL_UNVERIFIED")

        # Issue session
        raw_token = generate_secure_token(32)
        token_hash = hash_token(raw_token)
        expires_at = utc_now() + timedelta(days=settings.SESSION_EXPIRE_DAYS)

        session = Session(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(session)
        await db.flush()

        return user, raw_token

    async def logout(self, db: AsyncSession, session_token: str) -> bool:
        """Revoke a session."""
        token_hash = hash_token(session_token.strip())
        now = utc_now()

        stmt = (
            update(Session)
            .where(Session.token_hash == token_hash, Session.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        res = await db.execute(stmt)
        return res.rowcount > 0

    async def forgot_password(self, db: AsyncSession, email: str) -> bool:
        """Send password reset link to user's verified email."""
        user = await self.get_user_by_email(db, email)
        # Only verified accounts can reset password via email
        if not user or not user.is_verified:
            return True

        now = utc_now()
        # Invalidate older pending reset tokens
        stmt_invalidate = (
            update(PasswordResetToken)
            .where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.consumed_at.is_(None),
            )
            .values(consumed_at=now)
        )
        await db.execute(stmt_invalidate)

        # Create new reset token
        raw_token = generate_secure_token(32)
        token_hash = hash_token(raw_token)
        expires_at = now + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)

        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(reset_token)
        await db.flush()

        # Fetch user's preferred language
        pref_stmt = select(UserPreference).where(UserPreference.user_id == user.id)
        pref_res = await db.execute(pref_stmt)
        pref = pref_res.scalar_one_or_none()
        user_lang = pref.language if pref else "en"

        email_sent = email_service.send_password_reset_email(
            user.email, user.username, raw_token, lang=user_lang
        )
        return email_sent

    async def reset_password(self, db: AsyncSession, raw_token: str, new_password: str) -> bool:
        """Validate reset token, update password, and revoke all existing sessions."""
        token_hash = hash_token(raw_token.strip())
        now = utc_now()

        stmt = select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.consumed_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
        res = await db.execute(stmt)
        token_record = res.scalar_one_or_none()

        if not token_record:
            return False

        # Mark token consumed
        token_record.consumed_at = now

        # Update user password
        stmt_user = select(User).where(User.id == token_record.user_id)
        user_res = await db.execute(stmt_user)
        user = user_res.scalar_one_or_none()
        if not user:
            return False

        user.password_hash = hash_password(new_password)

        # Invalidate ALL active sessions for this user (security requirement)
        stmt_revoke_sessions = (
            update(Session)
            .where(Session.user_id == user.id, Session.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await db.execute(stmt_revoke_sessions)
        await db.commit()

        return True

    async def get_user_from_session(self, db: AsyncSession, session_token: str) -> Optional[User]:
        """Resolve authenticated User from session cookie token."""
        if not session_token:
            return None

        token_hash = hash_token(session_token.strip())
        now = utc_now()

        stmt = (
            select(User)
            .join(Session, Session.user_id == User.id)
            .where(
                Session.token_hash == token_hash,
                Session.revoked_at.is_(None),
                Session.expires_at > now,
            )
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()


auth_service = AuthService()
