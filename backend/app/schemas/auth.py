import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from backend.app.schemas.user import UserRead

USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_]+$")


class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=12, max_length=128)
    confirm_password: str = Field(..., min_length=12, max_length=128)
    language: Optional[str] = Field(default="en", pattern=r"^(en|hi)$")

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        trimmed = v.strip()
        if len(trimmed) < 2:
            raise ValueError("Full name must be at least 2 characters.")
        return trimmed

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        trimmed = v.strip()
        if not USERNAME_REGEX.match(trimmed):
            raise ValueError("Username can only contain letters, numbers, and underscores.")
        return trimmed

    @model_validator(mode="after")
    def validate_passwords_match(self) -> "SignupRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class VerifyEmailRequest(BaseModel):
    token: str = Field(..., min_length=1)


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1)
    password: str = Field(..., min_length=12, max_length=128)
    confirm_password: str = Field(..., min_length=12, max_length=128)

    @model_validator(mode="after")
    def validate_passwords_match(self) -> "ResetPasswordRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class AuthMessageResponse(BaseModel):
    success: bool
    message: str
    code: Optional[str] = None


class SessionUserResponse(BaseModel):
    authenticated: bool
    user: Optional[UserRead] = None
