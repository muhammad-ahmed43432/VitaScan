# 🧠 VitaScan – AI-Based Vitamin Deficiency Risk Screening System

VitaScan is a web-based AI screening platform designed to detect "visual signs associated with Vitamin A and Vitamin B12 deficiency risk" from uploaded images (e.g., eyes, lips, tongue, mouth, and skin).

It provides secure authentication, detection history tracking, and downloadable clinical-style reports.

> ⚠️ **Important Disclaimer:** 
> VitaScan is a **screening and risk indication tool**, not a diagnostic system.  
> Clinical evaluation and laboratory testing are required for final medical diagnosis.

---

# 📌 Table of Contents
- Project Overview  
- Key Features  
- System Architecture  
- Tech Stack  
- Project Structure  
- Installation  
- How to Run  
- Usage Flow  
- Model Classes & Interpretation  
- Database Schema  
- Configuration  
- Security Notes  
- Known Limitations  
- Future Enhancements  
- Troubleshooting  
- License  
- Acknowledgments  

# 📊 Project Overview

VitaScan integrates multiple components into a unified AI healthcare screening system:

- 🧩 **Flask Backend** – Web application logic and routing  
- 🤖 **PyTorch AI Model** – Image-based symptom classification  
- 🗄️ **SQLite Database** – User management and report storage  
- 📈 **Risk Mapping Engine** – Converts predictions into Vitamin A/B12 risk levels  
- 📄 **Report Generator** – Clinical-style downloadable reports  

The system is designed for **educational, research, and preliminary screening purposes**.

# ✨ Key Features

# 🔐 Authentication & Security
- User registration and login system  
- Password hashing for secure storage  
- Password reset via token-based system  
- Session-based authentication (Flask-Login)
- 
# 🧠 AI-Based Detection
- Image upload and preprocessing  
- ResNet-based inference model  
- Confidence score output  
- Risk classification (Low / Moderate / High)

# 📄 Reports
- Automated detection reports per analysis  
- User-specific history tracking  
- Downloadable reports (PDF via ReportLab / HTML fallback)

# 🎨 User Interface
- Responsive dashboard  
- Clean upload & result visualization  
- Protected detection workflow (login required)

# 📚 Additional Modules (Scope)
- Vitamin A & B12 educational blog system  

# 🏗️ System Architecture

VitaScan follows a layered architecture:

# 1. Presentation Layer
- HTML (Jinja2 templates)
- CSS-based UI
- User interaction pages (login, dashboard, reports)

# 2. Application Layer (Flask)
- Routing and API handling  
- Authentication logic  
- Request validation  
- Orchestration between modules  

# 3. AI Inference Layer
- PyTorch model loading  
- Image preprocessing  
- Feature extraction + classification  
- Risk interpretation mapping  

# 4. Data Layer
- SQLite database (`instance/vitamin_app.db`)  
- Stores users, reports, and reset tokens  

# 5. Reporting Layer
- PDF report generation (ReportLab)  
- HTML fallback reports  
# 🛠️ Tech Stack
- **Backend:** Flask  
- **Authentication:** Flask-Login  
- **Database:** Flask-SQLAlchemy (SQLite)  
- **Deep Learning:** PyTorch, torchvision  
- **Image Processing:** Pillow, OpenCV, NumPy  
- **Reporting:** ReportLab (PDF generation)  
- **Frontend:** HTML, CSS (Jinja2 templates)  

# 📁 Project Structure

VitaminApp/
├── app.py
├── auth_utils.py
├── config.py
├── extensions.py
├── mapping.py
├── model.py
├── models.py
├── requirements.txt
│
├── models/
│   └── finalized_resnet_best_model.pth
│
├── static/
│   └── css/
│       └── style.css
│
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── signup.html
│   ├── login.html
│   ├── dashboard.html
│   ├── report.html
│   ├── forgot_password.html
│   └── reset_password.html
│
└── instance/
    └── vitamin_app.db
