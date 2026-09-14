import os
from dotenv import load_dotenv, find_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv(find_dotenv())

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "jian.db"))

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    # Fix postgres:// -> postgresql:// for SQLAlchemy if needed (Render/Neon/Supabase)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    print(f"[DATABASE] Connecting to PostgreSQL database at: {DATABASE_URL.split('@')[-1]}")
    engine = create_engine(DATABASE_URL)
else:
    print(f"[DATABASE] Connecting to local SQLite database at: {DB_PATH}")
    engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
