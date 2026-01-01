from sqlalchemy import Column, Integer, String, DateTime, func, Index,Boolean
from database import Base
from datetime import datetime

# Optional: case-insensitive email with CITEXT on Postgres (CREATE EXTENSION citext;)
try:
    import importlib
    citext = importlib.import_module("citext")
    CIText = getattr(citext, "CIText")
    EmailType = CIText
except (ImportError, ModuleNotFoundError, AttributeError):
    EmailType = String  # fallback if extension not installed

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(EmailType if EmailType is not String else String(254), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    report_no = Column(String(32), unique=True, index=True, nullable=False)
    description = Column(String(4000), nullable=False)
    shape_and_cut = Column(String(255), nullable=False)
    tot_est_weight = Column(String(255), nullable=False)
    color = Column(String(64))
    clarity = Column(String(64))
    style_number = Column(String(255), index=True)
    image_filename = Column(String(512))
    comment = Column(String(1000))  # ✅ New field added
    isecopy = Column(Boolean, default=False)
    company_logo = Column(String, nullable=True)
    notice_image = Column(Boolean, default=False)
    igi_logo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_reports_style_created", "style_number", "created_at"),
    )

class UploadedPDF(Base):
    __tablename__ = "uploaded_pdfs"

    id = Column(Integer, primary_key=True, index=True)
    report_no = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)