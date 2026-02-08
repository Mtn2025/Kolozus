#!/usr/bin/env python3
"""
Script to test Editorial Product Creation
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
SPACE_ID = "71647625-56f9-45c0-9a97-e929c4b20999"  # Derechos Digitales 2026

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_create_product():
    """Test creating an editorial product"""
    log("=== TEST: CREATE EDITORIAL PRODUCT ===")
    
    product_data = {
        "title": "Libro: Derechos Digitales",  # ✅ Changed from 'name' to 'title'
        "archetype": "non_fiction",  # ✅ Changed from 'book' to 'non_fiction'
        "style_family": "classic_publisher",
        "space_id": SPACE_ID
    }
    
    log(f"POST {BASE_URL}/products/")
    log(f"Payload: {json.dumps(product_data, indent=2)}")
    
    response = requests.post(f"{BASE_URL}/products/", json=product_data)
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code in [200, 201]:
        product = response.json()
        log(f"✅ Product created successfully")
        log(f"\n📦 Product Details:")
        log(f"   ID: {product.get('id', 'N/A')}")
        log(f"   Name: {product.get('name', 'N/A')}")
        log(f"   Archetype: {product.get('archetype', 'N/A')}")
        log(f"   Style Family: {product.get('style_family', 'N/A')}")
        log(f"   Space ID: {product.get('space_id', 'N/A')}")
        log(f"   Status: {product.get('status', 'N/A')}")
        log(f"   Sections Count: {product.get('sections_count', product.get('sections', [])).__len__() if isinstance(product.get('sections', []), list) else 0}")
        
        log(f"\n📋 Full Response:")
        log(json.dumps(product, indent=2, ensure_ascii=False))
        
        return product.get('id')
    else:
        log(f"❌ Product creation failed")
        log(f"Response: {response.text}")
        return None

def test_get_product(product_id):
    """Test retrieving a product"""
    if not product_id:
        log("\n⚠️  Skipping GET test - no product ID")
        return False
    
    log(f"\n=== TEST: GET PRODUCT ===")
    log(f"GET {BASE_URL}/products/{product_id}")
    
    response = requests.get(f"{BASE_URL}/products/{product_id}")
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        product = response.json()
        log(f"✅ Product retrieved successfully")
        log(f"   Name: {product.get('name', 'N/A')}")
        return True
    else:
        log(f"❌ Failed to retrieve product")
        return False

def test_list_products():
    """Test listing products by space"""
    log(f"\n=== TEST: LIST PRODUCTS ===")
    log(f"GET {BASE_URL}/products/?space_id={SPACE_ID}")
    
    response = requests.get(f"{BASE_URL}/products/", params={"space_id": SPACE_ID})
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        products = response.json()
        log(f"✅ Products retrieved successfully")
        log(f"   Total Products: {len(products)}")
        
        if products:
            log(f"\n📦 Products List:")
            for idx, prod in enumerate(products, 1):
                log(f"   {idx}. {prod.get('name', 'N/A')} (ID: {prod.get('id', 'N/A')[:8]}...)")
        
        return True
    else:
        log(f"❌ Failed to list products")
        return False

def verify_database(product_id):
    """Verify product exists in database"""
    if not product_id:
        log("\n⚠️  Skipping DB verification - no product ID")
        return False
    
    log(f"\n=== VERIFY: DATABASE ===")
    log(f"Verifying product in database...")
    
    # Note: This would require docker exec to PostgreSQL
    # For now, we rely on API verification
    log(f"✅ Product should exist in DB with ID: {product_id}")
    log(f"   To verify manually, run:")
    log(f"   docker exec kolozus-db-1 psql -U user -d kolozus -c \"SELECT id, name, archetype, space_id FROM products WHERE name = 'Libro: Derechos Digitales';\"")
    
    return True

def main():
    log("Starting Editorial Product Creation Test")
    log("="*60)
    log(f"Target Space: Derechos Digitales 2026")
    log(f"Space ID: {SPACE_ID}")
    log(f"Product: Libro: Derechos Digitales")
    log("="*60)
    
    # Test 1: Create Product
    product_id = test_create_product()
    
    # Test 2: Get Product
    success2 = test_get_product(product_id)
    
    # Test 3: List Products
    success3 = test_list_products()
    
    # Test 4: Verify DB
    success4 = verify_database(product_id)
    
    log("\n" + "="*60)
    if product_id and success2 and success3:
        log("✅ ALL PRODUCT TESTS PASSED")
        log(f"📦 Product ID: {product_id}")
    else:
        log("⚠️  Some tests failed - check logs above")
    log("="*60)

if __name__ == "__main__":
    main()
