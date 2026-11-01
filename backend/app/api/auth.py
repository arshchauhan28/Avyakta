from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.core.dependencies import get_client_ip, get_current_user_optional, get_current_user
from backend.app.core.rate_limiter import rate_limiter
from backend.app.database.session import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AuthMessageResponse,
    SessionUserResponse,
)
from backend.app.schemas.user import UserRead
from backend.app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthMessageResponse)
async def signup(
    req: SignupRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    ip = get_client_ip(request)
    if not rate_limiter.is_allowed("signup", ip, settings.RATE_LIMIT_SIGNUP_ATTEMPTS, settings.RATE_LIMIT_SIGNUP_WINDOW_MINUTES * 60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMITED", "message": "Too many signup attempts. Please try again later."},
        )

    try:
        user, _, email_sent = await auth_service.signup(db, req)
    except ValueError as e:
        code = str(e)
        if code == "USERNAME_TAKEN":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"code": "USERNAME_TAKEN", "message": "This username is already taken."})
        elif code == "EMAIL_TAKEN":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"code": "EMAIL_TAKEN", "message": "An account with this email already exists."})
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"code": "BAD_REQUEST", "message": str(e)})

    if not email_sent and settings.EMAIL_BACKEND == "smtp":
        return AuthMessageResponse(
            success=True,
            message="Account created, but verification email delivery failed via SMTP. Please try resending verification or check SMTP configuration.",
            code="SIGNUP_SUCCESS_EMAIL_FAILED",
        )

    return AuthMessageResponse(
        success=True,
        message="Account created successfully. Please check your email to verify your account.",
        code="SIGNUP_SUCCESS",
    )


@router.post("/verify-email", response_model=AuthMessageResponse)
async def verify_email(
    req: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    success = await auth_service.verify_email(db, req.token)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_TOKEN", "message": "Verification link is invalid or has expired."},
        )

    return AuthMessageResponse(
        success=True,
        message="Email verified successfully. You can now log in.",
        code="EMAIL_VERIFIED",
    )


@router.post("/resend-verification", response_model=AuthMessageResponse)
async def resend_verification(
    req: ResendVerificationRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    ip = get_client_ip(request)
    if not rate_limiter.is_allowed("resend", ip, 3, 300):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMITED", "message": "Too many requests. Please wait a few minutes before resending."},
        )

    await auth_service.resend_verification(db, req.email)
    return AuthMessageResponse(
        success=True,
        message="If an unverified account exists with this email, a verification link has been sent.",
        code="RESEND_SENT",
    )


@router.post("/login", response_model=SessionUserResponse)
async def login(
    req: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    ip = get_client_ip(request)
    if not rate_limiter.is_allowed("login", ip, settings.RATE_LIMIT_LOGIN_ATTEMPTS, settings.RATE_LIMIT_LOGIN_WINDOW_MINUTES * 60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMITED", "message": "Too many failed login attempts. Please wait 15 minutes."},
        )

    try:
        user, session_token = await auth_service.login(db, req.username, req.password)
    except ValueError as e:
        code = str(e)
        if code == "EMAIL_UNVERIFIED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "EMAIL_UNVERIFIED", "message": "Please verify your email before logging in. Check your inbox for the activation link."},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_CREDENTIALS", "message": "Invalid username or password."},
            )

    # Set secure HttpOnly session cookie
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=session_token,
        max_age=settings.SESSION_EXPIRE_DAYS * 86400,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        domain=settings.SESSION_COOKIE_DOMAIN,
        path="/",
    )

    return SessionUserResponse(
        authenticated=True,
        user=UserRead.model_validate(user),
    )


@router.post("/logout", response_model=AuthMessageResponse)
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    session_token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if session_token:
        await auth_service.logout(db, session_token)

    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        domain=settings.SESSION_COOKIE_DOMAIN,
        path="/",
    )

    return AuthMessageResponse(
        success=True,
        message="Logged out successfully.",
        code="LOGOUT_SUCCESS",
    )


@router.post("/forgot-password", response_model=AuthMessageResponse)
async def forgot_password(
    req: ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    ip = get_client_ip(request)
    if not rate_limiter.is_allowed("forgot_password", ip, settings.RATE_LIMIT_RESET_ATTEMPTS, settings.RATE_LIMIT_RESET_WINDOW_MINUTES * 60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "RATE_LIMITED", "message": "Too many password reset requests. Please try again later."},
        )

    await auth_service.forgot_password(db, req.email)
    return AuthMessageResponse(
        success=True,
        message="If this email is registered and verified, password reset instructions have been sent.",
        code="RESET_EMAIL_SENT",
    )


@router.post("/reset-password", response_model=AuthMessageResponse)
async def reset_password(
    req: ResetPasswordRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    success = await auth_service.reset_password(db, req.token, req.password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_RESET_TOKEN", "message": "Password reset link is invalid or has expired."},
        )

    # Invalidate session cookie on client
    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        domain=settings.SESSION_COOKIE_DOMAIN,
        path="/",
    )

    return AuthMessageResponse(
        success=True,
        message="Password has been reset successfully. Please log in with your new password.",
        code="PASSWORD_RESET_SUCCESS",
    )


@router.get("/me", response_model=SessionUserResponse)
async def get_current_session(
    user: Optional[User] = Depends(get_current_user_optional),
):
    if not user:
        return SessionUserResponse(authenticated=False, user=None)
    return SessionUserResponse(
        authenticated=True,
        user=UserRead.model_validate(user),
    )
