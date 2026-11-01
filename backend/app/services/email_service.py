import json
import logging
import smtplib
import ssl
import hashlib
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional
from backend.app.core.config import settings, BASE_DIR

logger = logging.getLogger("avyakta.email")


class EmailService:
    def __init__(self):
        self.emails_dir = BASE_DIR / "data" / "emails"
        self.emails_dir.mkdir(parents=True, exist_ok=True)

    @property
    def backend(self) -> str:
        return settings.EMAIL_BACKEND.lower()

    def send_verification_email(
        self, to_email: str, username: str, token: str, lang: str = "en"
    ) -> bool:
        """Send account activation email with verification link in English or Hindi."""
        verify_url = f"{settings.FRONTEND_ORIGIN}/verify-email?token={token}"

        if lang == "hi":
            subject = "अपना Avyakta खाता सत्यापित करें"
            text_content = f"""Avyakta में आपका स्वागत है!

अपना खाता सक्रिय करने और अपनी अध्ययन प्रगति सुरक्षित रखने के लिए कृपया अपना ईमेल पता सत्यापित करें।

सत्यापन लिंक:
{verify_url}

यह लिंक {settings.VERIFICATION_TOKEN_EXPIRE_HOURS} घंटे के लिए वैध है और केवल एक बार उपयोग किया जा सकता है।

यदि आपने Avyakta पर खाता नहीं बनाया है, तो आप इस ईमेल को अनदेखा कर सकते हैं।

सादर,
The Avyakta Team
"""
        else:
            subject = "Verify Your Avyakta Account"
            text_content = f"""Welcome to Avyakta!

Please verify your email address to activate your account and securely save your learning progress.

Verification Link:
{verify_url}

This link is valid for {settings.VERIFICATION_TOKEN_EXPIRE_HOURS} hours and can only be used once.

If you did not create an account on Avyakta, you can safely ignore this email.

With reverence,
The Avyakta Team
"""

        # Professional bilingual Neo-Brutalist HTML template
        html_content = f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #faf8f5; color: #1e1e1e; padding: 24px 12px; margin: 0; }}
    .card {{ max-width: 560px; margin: 0 auto; background: #ffffff; border: 3px solid #1e1e1e; box-shadow: 6px 6px 0 #1e1e1e; padding: 32px 28px; }}
    .badge {{ display: inline-block; background: #1e1e1e; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; margin-bottom: 12px; }}
    .title {{ font-size: 24px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 6px 0; color: #1e1e1e; }}
    .subtitle {{ color: #15803d; font-size: 13px; font-weight: 700; margin-bottom: 24px; }}
    .greeting {{ font-size: 16px; font-weight: 700; margin-bottom: 12px; }}
    .body-text {{ font-size: 14px; line-height: 1.6; color: #333333; margin-bottom: 24px; }}
    .btn-container {{ text-align: left; margin: 28px 0; }}
    .btn {{ display: inline-block; background: #22c55e; color: #1e1e1e !important; font-weight: 800; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border: 2px solid #1e1e1e; box-shadow: 4px 4px 0 #1e1e1e; }}
    .fallback {{ font-size: 12px; color: #666666; word-break: break-all; margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cccccc; }}
    .footer {{ margin-top: 28px; font-size: 11px; color: #888888; border-top: 2px solid #1e1e1e; padding-top: 16px; }}
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Avyakta · श्रीमद्भगवद्गीता</span>
    <h1 class="title">{"अपना खाता सत्यापित करें" if lang == "hi" else "Verify Your Account"}</h1>
    <div class="subtitle">The Journey Through the Gita · आत्मज्ञान की यात्रा</div>
    
    <div class="greeting">{"नमस्ते" if lang == "hi" else "Welcome to Avyakta!"} <strong>{username}</strong>,</div>
    
    <div class="body-text">
      {"Avyakta में आपका स्वागत है! अपना खाता सक्रिय करने और अपनी अध्ययन प्रगति सुरक्षित रखने के लिए कृपया अपना ईमेल पता सत्यापित करें।" if lang == "hi" else "Please verify your email address to activate your account and securely save your learning progress."}
    </div>

    <div class="btn-container">
      <a href="{verify_url}" class="btn" target="_blank">
        {"ईमेल सत्यापित करें" if lang == "hi" else "Verify Email"}
      </a>
    </div>

    <div class="fallback">
      {"यदि ऊपर दिया गया बटन काम नहीं कर रहा है, तो इस लिंक को अपने ब्राउज़र में कॉपी करें:" if lang == "hi" else "If the button above does not work, copy and paste this link into your browser:"}<br>
      <a href="{verify_url}" style="color: #15803d; text-decoration: underline;">{verify_url}</a>
    </div>

    <div class="footer">
      {"यह लिंक केवल एक बार उपयोग के लिए है और 24 घंटे में समाप्त हो जाएगा।" if lang == "hi" else f"This single-use link expires in {settings.VERIFICATION_TOKEN_EXPIRE_HOURS} hours. If you did not create an Avyakta account, please ignore this email."}
    </div>
  </div>
</body>
</html>"""

        return self._deliver(
            to_email=to_email,
            subject=subject,
            text=text_content,
            html=html_content,
            token=token,
            email_type="verification",
        )

    def send_password_reset_email(
        self, to_email: str, username: str, token: str, lang: str = "en"
    ) -> bool:
        """Send password recovery link to user's verified email."""
        reset_url = f"{settings.FRONTEND_ORIGIN}/reset-password?token={token}"

        if lang == "hi":
            subject = "अपना Avyakta पासवर्ड रीसेट करें"
            text_content = f"""नमस्ते {username},

हमें आपके Avyakta खाते का पासवर्ड रीसेट करने का अनुरोध प्राप्त हुआ है।
नया पासवर्ड सेट करने के लिए नीचे दिए गए लिंक पर क्लिक करें:

{reset_url}

यह लिंक {settings.RESET_TOKEN_EXPIRE_MINUTES} मिनट के लिए वैध है और केवल एक बार उपयोग किया जा सकता है।

यदि आपने पासवर्ड रीसेट का अनुरोध नहीं किया है, तो कृपया इस ईमेल को अनदेखा करें। आपका खाता सुरक्षित है।

सादर,
The Avyakta Team
"""
        else:
            subject = "Reset Your Avyakta Password"
            text_content = f"""Namaste {username},

We received a request to reset your Avyakta account password.
Click the following link to establish a new password:

{reset_url}

This link is valid for {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes and can only be used once.

If you did not request a password reset, please ignore this email. Your account remains secure.

With reverence,
The Avyakta Team
"""

        html_content = f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #faf8f5; color: #1e1e1e; padding: 24px 12px; margin: 0; }}
    .card {{ max-width: 560px; margin: 0 auto; background: #ffffff; border: 3px solid #1e1e1e; box-shadow: 6px 6px 0 #1e1e1e; padding: 32px 28px; }}
    .badge {{ display: inline-block; background: #1e1e1e; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; margin-bottom: 12px; }}
    .title {{ font-size: 24px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 6px 0; color: #1e1e1e; }}
    .subtitle {{ color: #b45309; font-size: 13px; font-weight: 700; margin-bottom: 24px; }}
    .greeting {{ font-size: 16px; font-weight: 700; margin-bottom: 12px; }}
    .body-text {{ font-size: 14px; line-height: 1.6; color: #333333; margin-bottom: 24px; }}
    .btn-container {{ text-align: left; margin: 28px 0; }}
    .btn {{ display: inline-block; background: #facc15; color: #1e1e1e !important; font-weight: 800; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border: 2px solid #1e1e1e; box-shadow: 4px 4px 0 #1e1e1e; }}
    .fallback {{ font-size: 12px; color: #666666; word-break: break-all; margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cccccc; }}
    .footer {{ margin-top: 28px; font-size: 11px; color: #888888; border-top: 2px solid #1e1e1e; padding-top: 16px; }}
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Avyakta · सुरक्षा</span>
    <h1 class="title">{"पासवर्ड रीसेट करें" if lang == "hi" else "Reset Your Password"}</h1>
    <div class="subtitle">Password Recovery · पासवर्ड पुनर्प्राप्ति</div>
    
    <div class="greeting">{"नमस्ते" if lang == "hi" else "Namaste"} <strong>{username}</strong>,</div>
    
    <div class="body-text">
      {"हमें आपके Avyakta खाते का पासवर्ड रीसेट करने का अनुरोध प्राप्त हुआ है। नया पासवर्ड सेट करने के लिए नीचे क्लिक करें:" if lang == "hi" else "We received a request to reset your Avyakta account password. Click below to establish a new password:"}
    </div>

    <div class="btn-container">
      <a href="{reset_url}" class="btn" target="_blank">
        {"पासवर्ड रीसेट करें" if lang == "hi" else "Reset Password"}
      </a>
    </div>

    <div class="fallback">
      {"यदि बटन काम नहीं कर रहा है, तो इस लिंक को ब्राउज़र में खोलें:" if lang == "hi" else "If the button does not work, copy and paste this link into your browser:"}<br>
      <a href="{reset_url}" style="color: #b45309; text-decoration: underline;">{reset_url}</a>
    </div>

    <div class="footer">
      {"यह लिंक केवल 60 मिनट के लिए मान्य है और एकल उपयोग है। यदि आपने यह अनुरोध नहीं किया है, तो इसे अनदेखा करें।" if lang == "hi" else f"This single-use link expires in {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes. If you did not request a password reset, your account remains secure."}
    </div>
  </div>
</body>
</html>"""

        return self._deliver(
            to_email=to_email,
            subject=subject,
            text=text_content,
            html=html_content,
            token=token,
            email_type="password_reset",
        )

    def _deliver(
        self,
        to_email: str,
        subject: str,
        text: str,
        html: str,
        token: str,
        email_type: str,
    ) -> bool:
        """Deliver via SMTP if configured, or record locally in data/emails/."""
        if self.backend == "smtp" and settings.SMTP_HOST:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = settings.EMAIL_FROM
                msg["To"] = to_email
                msg.attach(MIMEText(text, "plain", "utf-8"))
                msg.attach(MIMEText(html, "html", "utf-8"))

                context = ssl.create_default_context()
                with smtplib.SMTP(
                    settings.SMTP_HOST, settings.SMTP_PORT, timeout=15
                ) as server:
                    server.ehlo()
                    if settings.SMTP_USE_TLS:
                        server.starttls(context=context)
                        server.ehlo()
                    if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                        server.login(
                            settings.SMTP_USERNAME, settings.SMTP_PASSWORD
                        )
                    server.sendmail(
                        settings.EMAIL_FROM, [to_email], msg.as_string()
                    )
                logger.info("Successfully delivered %s email to recipient via SMTP", email_type)
                # Keep local record in dev for inspection
                if settings.DEBUG:
                    self._save_to_file(to_email, subject, text, token, email_type)
                return True
            except Exception as e:
                logger.error("SMTP delivery failure for %s email: %s", email_type, type(e).__name__)
                # Always record to local file on failure so development testing is never permanently blocked
                self._save_to_file(to_email, subject, text, token, email_type)
                return False
        else:
            # File / Local development mode
            self._save_to_file(to_email, subject, text, token, email_type)
            return True

    def _save_to_file(
        self, to_email: str, subject: str, text: str, token: str, email_type: str
    ) -> None:
        record = {
            "to": to_email,
            "subject": subject,
            "token": token,
            "type": email_type,
            "body": text,
        }
        token_sig = hashlib.sha256(token.encode("utf-8")).hexdigest()[:10]
        file_path = self.emails_dir / f"{email_type}_{token_sig}_{time.time_ns()}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(record, f, indent=2, ensure_ascii=False)
        logger.info("Recorded %s email locally at %s", email_type, file_path.name)


email_service = EmailService()
