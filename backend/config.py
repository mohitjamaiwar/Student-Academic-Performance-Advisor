import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Preferred for Supabase: postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
    DATABASE_URL = os.getenv("DATABASE_URL", "")

    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "5432"))
    DB_NAME = os.getenv("DB_NAME", "postgres")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")

    LOW_MARKS_THRESHOLD = int(os.getenv("LOW_MARKS_THRESHOLD", "50"))
    MEDIUM_MARKS_THRESHOLD = int(os.getenv("MEDIUM_MARKS_THRESHOLD", "70"))
    LOW_ATTENDANCE_THRESHOLD = int(os.getenv("LOW_ATTENDANCE_THRESHOLD", "75"))
    LOW_STUDY_HOURS_THRESHOLD = float(os.getenv("LOW_STUDY_HOURS_THRESHOLD", "3"))
    LOW_ASSIGNMENT_THRESHOLD = int(os.getenv("LOW_ASSIGNMENT_THRESHOLD", "70"))
