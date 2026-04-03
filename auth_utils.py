"""Authentication utilities: password hashing, validation, reset tokens."""
import re
import secrets
from typing import List, Tuple
from datetime import datetime, timedelta

from werkzeug.security import generate_password_hash, check_password_hash

from config import Config
from extensions import db
from models import User, PasswordResetToken


def hash_password(password: str) -> str:
    """Hash password using werkzeug."""
    return generate_password_hash(password, method="pbkdf2:sha256")


def verify_password(password_hash: str, password: str) -> bool:
    """Verify password against hash."""
    return check_password_hash(password_hash, password)


def validate_password_strength(password: str) -> Tuple[bool, List[str]]:
    """
    Validate password meets strength requirements.
    Returns (is_valid, list of error messages).
    """
    errors = []
    
    if len(password) < Config.PASSWORD_MIN_LENGTH:
        errors.append(f"Password must be at least {Config.PASSWORD_MIN_LENGTH} characters long.")
    
    if Config.PASSWORD_REQUIRE_UPPERCASE and not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter.")
    
    if Config.PASSWORD_REQUIRE_LOWERCASE and not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter.")
    
    if Config.PASSWORD_REQUIRE_DIGIT and not re.search(r"\d", password):
        errors.append("Password must contain at least one digit.")
    
    if Config.PASSWORD_REQUIRE_SPECIAL:
        special = re.escape(Config.PASSWORD_SPECIAL_CHARS)
        if not re.search(f"[{special}]", password):
            errors.append("Password must contain at least one special character (!@#$%^&* etc).")
    
    return (len(errors) == 0, errors)


def create_reset_token(user: User) -> str:
    """Create and store a password reset token. Returns the token string."""
    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(seconds=Config.RESET_TOKEN_EXPIRY)
    reset_record = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires
    )
    db.session.add(reset_record)
    db.session.commit()
    return token


def get_valid_reset_token(token_str: str):
    """Get a valid (unused, non-expired) reset token."""
    record = PasswordResetToken.query.filter_by(token=token_str).first()
    if record and record.is_valid:
        return record
    return None


def consume_reset_token(token_str: str):
    """Validate token, mark as used, and return the user. Returns None if invalid."""
    record = get_valid_reset_token(token_str)
    if not record:
        return None
    record.used = True
    db.session.commit()
    return record.user
