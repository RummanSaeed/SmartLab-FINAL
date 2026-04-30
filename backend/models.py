from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text, Float
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    name = Column(String)
    role = Column(String, default="student")  # student, teacher, admin
    password_hash = Column(String)
    status = Column(String, default="active")
    subject = Column(String)
    class_level = Column(String)  # 9, 10, 11, 12
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    subject = Column(String)
    class_level = Column(String)
    due_date = Column(DateTime)
    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    teacher = relationship("User", back_populates="assignments")

class Notice(Base):
    __tablename__ = "notices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    content = Column(Text)
    type = Column(String, default="general")
    priority = Column(String, default="normal")
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User")

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    subject = Column(String)
    type = Column(String)  # video, pdf, link, simulation
    url = Column(String)
    file_size = Column(String)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    uploader = relationship("User")

class LabExperiment(Base):
    __tablename__ = "lab_experiments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experiment_id = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    subject = Column(String)
    class_level = Column(String)
    description = Column(Text)
    category = Column(String)
    duration = Column(String)
    hazard_level = Column(String)
    steps = Column(JSON)
    tags = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class StudentHistory(Base):
    __tablename__ = "student_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    experiment_id = Column(String)
    action = Column(String)  # started, completed, viewed
    score = Column(Float)
    time_spent = Column(Integer)  # in seconds
    feedback = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("User", back_populates="history")

class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id"))
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    content = Column(Text)
    file_url = Column(String)
    score = Column(Float)
    feedback = Column(Text)
    status = Column(String, default="submitted")  # submitted, graded
    submitted_at = Column(DateTime, default=datetime.utcnow)
    graded_at = Column(DateTime)
    graded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    assignment = relationship("Assignment")
    student = relationship("User", foreign_keys=[student_id])
    grader = relationship("User", foreign_keys=[graded_by])

# Add relationships to User
User.assignments = relationship("Assignment", back_populates="teacher")
User.history = relationship("StudentHistory", back_populates="student")
