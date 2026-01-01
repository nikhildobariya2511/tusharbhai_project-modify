import subprocess
import os
from dotenv import load_dotenv

load_dotenv()

def run_alembic_migrations():
    try:
        print("🔄 Running Alembic migrations...")

        if os.getenv("ENV") != "production":
            # Dev only: generate new revision
            subprocess.run(["alembic", "revision", "--autogenerate", "-m", "auto"], check=True)

        # Always upgrade
        subprocess.run(["alembic", "upgrade", "head"], check=True)

        print("✅ Alembic migration complete.")
    except subprocess.CalledProcessError as e:
        print("❌ Alembic migration failed:")
        print(e)
