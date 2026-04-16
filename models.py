"""Database models for Vitamin Deficiency Detection System."""
from datetime import datetime
from flask_login import UserMixin
from extensions import db


class User(UserMixin, db.Model):
    """User account model."""
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    reports = db.relationship("DetectionReport", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email}>"


class DetectionReport(db.Model):
    """Stores each detection result for a user."""
    __tablename__ = "detection_reports"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    symptom = db.Column(db.String(80), nullable=False)
    vitamin_category = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Report {self.symptom} - {self.vitamin_category}>"


class PasswordResetToken(db.Model):
    """Token for password reset flow."""
    __tablename__ = "password_reset_tokens"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token = db.Column(db.String(256), nullable=False, unique=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship("User", backref=db.backref("reset_tokens", lazy="dynamic"))
    
    @property
    def is_valid(self):
        return not self.used and datetime.utcnow() < self.expires_at
