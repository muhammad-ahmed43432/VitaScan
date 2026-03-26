"""Vitamin Deficiency Detection System - Flask Application."""
import io
from pathlib import Path

import cv2
import numpy as np
import torch
from flask import Flask, flash, redirect, render_template, request, send_file, url_for
from PIL import Image
from torchvision import transforms

from config import Config
from extensions import db, login_manager
from mapping import symptom_to_deficiency
from model import load_model, predict_image
from models import DetectionReport, User
from auth_utils import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_reset_token,
    consume_reset_token,
    get_valid_reset_token,
)
from flask_login import current_user, login_required, login_user, logout_user

# Create app
app = Flask(__name__)
app.config.from_object(Config)
# Ensure instance folder exists for SQLite DB
Path(app.instance_path).mkdir(parents=True, exist_ok=True)

# Initialize extensions
db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = "login"
login_manager.login_message = "Please log in to use the detection feature."
login_manager.login_message_category = "info"


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Load model once at startup
model = load_model()
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])


def is_blurry(image, threshold=100):
    image_np = np.array(image)
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var() < threshold


# -------- Routes --------

@app.route("/")
def home():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    return render_template("index.html")


@app.route("/signup", methods=["GET", "POST"])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        full_name = request.form.get("full_name", "").strip()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm_password", "")

        errors = []
        if not email:
            errors.append("Email is required.")
        if not full_name:
            errors.append("Full name is required.")
        if not password:
            errors.append("Password is required.")
        elif password != confirm:
            errors.append("Passwords do not match.")

        valid, pw_errors = validate_password_strength(password)
        if not valid:
            errors.extend(pw_errors)

        if User.query.filter_by(email=email).first():
            errors.append("An account with this email already exists.")

        if errors:
            for err in errors:
                flash(err, "error")
            return render_template("signup.html")

        user = User(
            email=email,
            full_name=full_name,
            password_hash=hash_password(password)
        )
        db.session.add(user)
        db.session.commit()
        flash("Account created successfully. Please log in.", "success")
        return redirect(url_for("login"))

    return render_template("signup.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        user = User.query.filter_by(email=email).first()
        if user and verify_password(user.password_hash, password):
            login_user(user)
            next_url = request.args.get("next") or url_for("dashboard")
            return redirect(next_url)
        flash("Invalid email or password.", "error")
    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("home"))


@app.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        user = User.query.filter_by(email=email).first()
        if user:
            token = create_reset_token(user)
            reset_url = url_for("reset_password", token=token, _external=True)
            flash(
                "If an account exists with that email, a reset link has been generated. "
                "Use the link below (or check your email in production):",
                "info"
            )
            return render_template("forgot_password.html", reset_url=reset_url, show_link=True)
        flash("If an account exists with that email, a reset link has been sent.", "info")
        return redirect(url_for("login"))
    return render_template("forgot_password.html")


@app.route("/reset-password/<token>", methods=["GET", "POST"])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    if request.method == "GET":
        t = get_valid_reset_token(token)
        if not t:
            flash("Invalid or expired reset link. Please request a new one.", "error")
            return redirect(url_for("forgot_password"))
        return render_template("reset_password.html", token=token)
    # POST
    user = consume_reset_token(token)
    if not user:
        flash("Invalid or expired reset link. Please request a new one.", "error")
        return redirect(url_for("forgot_password"))
    password = request.form.get("password", "")
    confirm = request.form.get("confirm_password", "")
    if not password or password != confirm:
        flash("Passwords do not match or are empty.", "error")
        return render_template("reset_password.html", token=token)
    valid, pw_errors = validate_password_strength(password)
    if not valid:
        for err in pw_errors:
            flash(err, "error")
        return render_template("reset_password.html", token=token)
    user.password_hash = hash_password(password)
    db.session.commit()
    flash("Password updated. Please log in.", "success")
    return redirect(url_for("login"))


@app.route("/dashboard")
@login_required
def dashboard():
    reports = DetectionReport.query.filter_by(user_id=current_user.id).order_by(
        DetectionReport.created_at.desc()
    ).limit(10).all()
    return render_template("dashboard.html", reports=reports)


@app.route("/predict", methods=["POST"])
@login_required
def predict():
    if "file" not in request.files:
        flash("No file uploaded.", "error")
        return redirect(url_for("dashboard"))

    file = request.files["file"]
    if file.filename == "":
        flash("No file selected.", "error")
        return redirect(url_for("dashboard"))

    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        width, height = image.size
        # Relaxed for testing with small/low-quality images (min 50x50)
        if width < 50 or height < 50:
            flash("Image too small. Minimum 50×50 pixels required.", "error")
            return redirect(url_for("dashboard"))
        # Blur check disabled for testing - enable by uncommenting:
        # if is_blurry(image):
        #     flash("Image is too blurry. Please upload a clearer photo.", "error")
        #     return redirect(url_for("dashboard"))

        image_tensor = transform(image).unsqueeze(0)
        result = predict_image(model, image_tensor, threshold=0.75)
        if result["status"] == "rejected":
            flash(result["message"], "error")
            return redirect(url_for("dashboard"))

        predicted_class = result["predicted_class"]
        confidence = result["confidence"]
        vitamin_category = symptom_to_deficiency[predicted_class]

        report = DetectionReport(
            user_id=current_user.id,
            symptom=predicted_class,
            vitamin_category=vitamin_category,
            confidence=confidence
        )
        db.session.add(report)
        db.session.commit()

        return redirect(url_for("report", report_id=report.id))
    except Exception as e:
        flash(f"Error: {str(e)}", "error")
        return redirect(url_for("dashboard"))


@app.route("/report/<int:report_id>")
@login_required
def report(report_id):
    r = DetectionReport.query.get_or_404(report_id)
    if r.user_id != current_user.id:
        flash("Report not found.", "error")
        return redirect(url_for("dashboard"))
    return render_template("report.html", report=r)


@app.route("/report/<int:report_id>/download")
@login_required
def download_report(report_id):
    r = DetectionReport.query.get_or_404(report_id)
    if r.user_id != current_user.id:
        flash("Report not found.", "error")
        return redirect(url_for("dashboard"))

    content, mimetype, ext = _generate_report(r)
    return send_file(
        io.BytesIO(content),
        mimetype=mimetype,
        as_attachment=True,
        download_name=f"Vitamin_Report_{r.id}_{r.created_at.strftime('%Y%m%d')}.{ext}"
    )


def _generate_report(report):
    """Generate report. Returns (content_bytes, mimetype, extension). Prefer PDF, fallback HTML."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.enums import TA_CENTER

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        title_style = ParagraphStyle(
            name="Title", parent=styles["Heading1"], alignment=TA_CENTER
        )
        story.append(Paragraph("Vitamin Deficiency Detection Report", title_style))
        story.append(Spacer(1, 0.5 * inch))
        story.append(Paragraph(f"<b>Patient:</b> {report.user.full_name}", styles["Normal"]))
        story.append(Paragraph(f"<b>Date:</b> {report.created_at.strftime('%B %d, %Y')}", styles["Normal"]))
        story.append(Spacer(1, 0.3 * inch))
        story.append(Paragraph(f"<b>Detected Symptom:</b> {report.symptom.replace('_', ' ').title()}", styles["Normal"]))
        story.append(Paragraph(f"<b>Vitamin Category:</b> {report.vitamin_category}", styles["Normal"]))
        story.append(Paragraph(f"<b>Confidence:</b> {report.confidence:.1f}%", styles["Normal"]))
        story.append(Spacer(1, 0.5 * inch))
        story.append(Paragraph("This report is AI-generated. Consult a healthcare professional for diagnosis.", styles["Normal"]))
        doc.build(story)
        return (buffer.getvalue(), "application/pdf", "pdf")
    except ImportError:
        pass
    html = _generate_report_html_fallback(report)
    return (html.encode("utf-8"), "text/html", "html")


def _generate_report_html_fallback(report):
    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>Report</title></head>
    <body><h1>Report</h1><p>Patient: {report.user.full_name}</p>
    <p>Date: {report.created_at.strftime('%B %d, %Y')}</p>
    <p>Symptom: {report.symptom.replace('_', ' ').title()}</p>
    <p>Category: {report.vitamin_category}</p>
    <p>Confidence: {report.confidence:.1f}%</p></body></html>"""
    return html


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

