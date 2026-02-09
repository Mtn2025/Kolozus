from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator
import os

# Prioritize DATABASE_URL if set
DATABASE_URL = os.getenv("DATABASE_URL")

# If not set, construct from components (Coolify/Docker standard)
if not DATABASE_URL:
    postgres_user = os.getenv("POSTGRES_USER", "kolozus")
    postgres_password = os.getenv("POSTGRES_PASSWORD", "kolozus_strong_password")
    postgres_host = os.getenv("POSTGRES_HOST", "db") # Default to docker service name
    postgres_port = os.getenv("POSTGRES_PORT", "5432")
    postgres_db = os.getenv("POSTGRES_DB", "kolozus_main")
    
    DATABASE_URL = f"postgresql://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}"

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
