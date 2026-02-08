from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator
import os

# URL de base de datos desde variable de entorno
DATABASE_URL = os.getenv("DATABASE_URL")

# Para producción, usar conexión pool
if DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verificar conexión antes de usar
        pool_recycle=3600,  # Reciclar conexiones cada hora
    )
else:
    # Fallback only for tests if absolutely needed, but usually we want env var
    # Keeping the old default for safety if env not set, but arguably should fail in prod
    DATABASE_URL = "postgresql://kolozus:kolozus_strong_password@localhost:5432/kolozus_main"
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
