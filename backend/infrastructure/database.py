from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator
import os

# Allow overriding for tests or docker
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://kolozus:kolozus_strong_password@localhost:5432/kolozus_main")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
