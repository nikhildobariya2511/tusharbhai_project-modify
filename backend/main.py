from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import sys

from database import Base, engine
from auth.router import router as auth_router
from reports.router import router as reports_router, public_router
from pdf.router import router as pdf_router
from models import *
from auto_migrate import run_alembic_migrations
from dotenv import load_dotenv

load_dotenv()


if os.getenv("ENV") != "production":
    Base.metadata.create_all(bind=engine)
    run_alembic_migrations()
else:
    # Production: run migrations only
    import subprocess
    subprocess.run(["python", "-m", "alembic", "upgrade", "head"], check=False)

app = FastAPI(title="IGI FastAPI Backend")

# -------------------------
# STATIC DIRECTORIES
# -------------------------
OUTPUT_DIR = "output"
UPLOAD_DIR = "uploads"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount public folders
app.mount("/files", StaticFiles(directory=OUTPUT_DIR), name="files")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000","https://igi.org.pe","https://api.igi.org.pe","https://www.igi.org.pe","https://www.api.igi.org.pe","http://127.0.0.1:8000","http://192.168.56.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# ROUTERS
# -------------------------
app.include_router(auth_router)
app.include_router(reports_router)
app.include_router(public_router)
app.include_router(pdf_router)

@app.get("/")
def home():
    return {"message": "IGI FastAPI Backend running with Auth, Reports & PDF endpoints"}
