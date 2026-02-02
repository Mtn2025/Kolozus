import sys
import os

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from infrastructure.database import engine, Base
from adapters.orm import ProductModel, ProductSectionModel, EditorialProfileModel

def reset_product_tables():
    print("Dropping Product tables (if exist)...")
    try:
        ProductSectionModel.__table__.drop(engine)
        ProductModel.__table__.drop(engine)
        EditorialProfileModel.__table__.drop(engine)
    except Exception as e:
        print(f"Warning dropping tables: {e}")

    print("Re-creating Product tables with new schema...")
    Base.metadata.create_all(bind=engine)
    print("Tables reset successfully.")

if __name__ == "__main__":
    reset_product_tables()
