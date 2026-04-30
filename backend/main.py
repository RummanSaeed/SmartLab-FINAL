from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session

import os
import json

from database import get_db

# ----------------------
# App Initialization
# ----------------------
app = FastAPI(title="SmartLab API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------
# Config
# ----------------------
BASE_DIR = os.path.dirname(__file__)
DATASETS_DIR = os.path.join(BASE_DIR, "../datasets")

# ----------------------
# Health & Root
# ----------------------

@app.get("/")
def root():
    return {
        "message": "SmartLab Backend API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# ----------------------
# Experiments (JSON fallback)
# ----------------------

@app.get("/experiments")
def list_experiments():
    experiments = []

    if os.path.exists(DATASETS_DIR):
        for fname in os.listdir(DATASETS_DIR):
            if fname.endswith(".json"):
                try:
                    with open(os.path.join(DATASETS_DIR, fname), encoding="utf-8") as f:
                        data = json.load(f)

                    experiments.append({
                        "id": data.get("id"),
                        "title": data.get("title"),
                        "subject": data.get("subject"),
                        "class": data.get("class")
                    })
                except Exception:
                    continue

    return {"experiments": experiments}

# =====================================================
# SCHEMAS
# =====================================================

class UserCreate(BaseModel):
    email: str
    name: str
    role: str = "student"
    password: str
    subject: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    status: str
    subject: Optional[str]
    created_at: datetime

class AssignmentCreate(BaseModel):
    teacher_id: str
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    class_level: Optional[str] = None
    due_date: Optional[datetime] = None

class NoticeCreate(BaseModel):
    title: str
    content: str
    type: str = "general"
    priority: str = "normal"
    created_by: str

class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    type: str
    url: Optional[str] = None
    file_size: Optional[str] = None
    uploaded_by: str

class StudentHistoryCreate(BaseModel):
    student_id: str
    experiment_id: str
    action: str
    score: Optional[float] = None
    time_spent: Optional[int] = None
    feedback: Optional[str] = None

class SubmissionCreate(BaseModel):
    assignment_id: str
    student_id: str
    content: Optional[str] = None
    file_url: Optional[str] = None

# =====================================================
# USER ROUTES
# =====================================================

@app.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    raise NotImplementedError

@app.get("/users")
def list_users(role: Optional[str] = None, db: Session = Depends(get_db)):
    raise NotImplementedError

@app.get("/users/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    raise NotImplementedError

# =====================================================
# ASSIGNMENTS
# =====================================================

@app.post("/assignments")
def create_assignment(data: AssignmentCreate, db: Session = Depends(get_db)):
    raise NotImplementedError

@app.get("/assignments")
def list_assignments(teacher_id: Optional[str] = None, db: Session = Depends(get_db)):
    raise NotImplementedError

@app.get("/assignments/{assignment_id}")
def get_assignment(assignment_id: str, db: Session = Depends(get_db)):
    raise NotImplementedError

# =====================================================
# NOTICES
# =====================================================

@app.post("/notices")
def create_notice(data: NoticeCreate, db: Session = Depends(get_db)):
    raise NotImplementedError

@app.get("/notices")
def list_notices(type: Optional[str] = None, db: Session = Depends(get_db)):
    raise NotImplementedError

# =====================================================
# RESOURCES
# =====================================================

@app.post("/resources")
def create_resource(data: ResourceCreate, db: Session = Depends(get_db)):
    raise NotImplementedError

@app.get("/resources")
def list_resources(subject: Optional[str] = None, type: Optional[str] = None, db: Session = Depends(get_db)):
    raise NotImplementedError

# =====================================================
# STUDENT HISTORY
# =====================================================

@app.post("/student-history")
def create_history(data: StudentHistoryCreate, db: Session = Depends(get_db)):
    raise NotImplementedError

@app.get("/student-history/{student_id}")
def get_history(student_id: str, db: Session = Depends(get_db)):
    raise NotImplementedError

# =====================================================
# SUBMISSIONS
# =====================================================

@app.post("/submissions")
def create_submission(data: SubmissionCreate, db: Session = Depends(get_db)):
    raise NotImplementedError

@app.get("/submissions")
def list_submissions(
    assignment_id: Optional[str] = None,
    student_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    raise NotImplementedError

# =====================================================
# DASHBOARD
# =====================================================

@app.get("/stats/dashboard")
def dashboard_stats(db: Session = Depends(get_db)):
    raise NotImplementedError

# =====================================================
# RUN
# =====================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
