from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
from sqlalchemy.engine import make_url
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print
# Extract DB parts to auto-create database
def _create_database_if_not_exists():
    try:
        print("Starting database creation process...")
        
        # Parse the URL (remove SQLAlchemy driver suffix if present)
        url = make_url(DATABASE_URL.replace("+psycopg", ""))  # URL object
        db_name = url.database
        admin_url = f"postgresql://{url.username}:{url.password}@{url.host}"

        # Connect without db name using SQLAlchemy engine
        print(f"Connecting to the PostgreSQL server at {url.host}...")
        admin_engine = create_engine(admin_url, future=True)
        
        with admin_engine.connect() as conn:
            # Use autocommit/isolation level to allow CREATE DATABASE
            conn = conn.execution_options(isolation_level="AUTOCOMMIT")
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :d"), {"d": db_name}
            ).scalar()

            if not exists:
                print(f"📀 Database '{db_name}' not found → Creating now...")
                conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                print("✅ Database created")
            else:
                print(f"✅ Database '{db_name}' already exists")
        
        admin_engine.dispose()
    except Exception as e:
        print(f"⚠️ Database check/create failed: {e}")

# Auto-create DB
_create_database_if_not_exists()

# Normal SQLAlchemy setup
# Normal SQLAlchemy setup
print("Setting up SQLAlchemy engine and session manager...")
engine = create_engine(DATABASE_URL, echo=False, future=True)

# Log successful connection
try:
    # Try connecting to the database to confirm it’s accessible
    with engine.connect() as conn:
        print(f"✅ Successfully connected to the database '{conn.engine.url.database}'")
except OperationalError as e:
    print(f"⚠️ Database connection failed: {e}")

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
