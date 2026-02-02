import sys
import os

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from infrastructure.database import engine, Base
from adapters.orm import EditorialProfileModel, ProductModel, ProductSectionModel

def create_product_tables():
    print("Creating Product tables in database...")
    # This only creates tables that don't satisfy the schema, 
    # but since they are new, it should work fine with create_all.
    # Note: create_all checks for existence of table, not columns.
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    create_product_tables()
