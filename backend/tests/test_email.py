import json
import pytest
from backend.app.services.email_service import EmailService
from backend.app.core.config import settings

def test_verification_email_templates_english_and_hindi(tmp_path):
    svc = EmailService()
    svc.emails_dir = tmp_path

    # English verification
    assert svc.send_verification_email("user1@example.com", "arjuna", "sample-tok-123", lang="en") is True
    en_file = next(tmp_path.glob("verification_*.json"))
    en_data = json.loads(en_file.read_text(encoding="utf-8"))
    assert en_data["to"] == "user1@example.com"
    assert en_data["subject"] == "Verify Your Avyakta Account"
    assert "Welcome to Avyakta!" in en_data["body"]
    assert "sample-tok-123" in en_data["body"]

    # Hindi verification
    assert svc.send_verification_email("user2@example.com", "partha", "sample-tok-456", lang="hi") is True
    hi_files = [f for f in tmp_path.glob("verification_*.json") if f != en_file]
    assert len(hi_files) == 1
    hi_data = json.loads(hi_files[0].read_text(encoding="utf-8"))
    assert hi_data["to"] == "user2@example.com"
    assert hi_data["subject"] == "अपना Avyakta खाता सत्यापित करें"
    assert "Avyakta में आपका स्वागत है!" in hi_data["body"]
    assert "sample-tok-456" in hi_data["body"]

def test_password_reset_email_templates_english_and_hindi(tmp_path):
    svc = EmailService()
    svc.emails_dir = tmp_path

    # English reset
    assert svc.send_password_reset_email("user1@example.com", "arjuna", "sample-reset-123", lang="en") is True
    en_file = next(tmp_path.glob("password_reset_*.json"))
    en_data = json.loads(en_file.read_text(encoding="utf-8"))
    assert en_data["to"] == "user1@example.com"
    assert en_data["subject"] == "Reset Your Avyakta Password"
    assert "sample-reset-123" in en_data["body"]

    # Hindi reset
    assert svc.send_password_reset_email("user2@example.com", "partha", "sample-reset-456", lang="hi") is True
    hi_files = [f for f in tmp_path.glob("password_reset_*.json") if f != en_file]
    assert len(hi_files) == 1
    hi_data = json.loads(hi_files[0].read_text(encoding="utf-8"))
    assert hi_data["to"] == "user2@example.com"
    assert hi_data["subject"] == "अपना Avyakta पासवर्ड रीसेट करें"
    assert "sample-reset-456" in hi_data["body"]
