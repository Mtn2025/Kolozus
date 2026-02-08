#!/usr/bin/env python3
"""
Script to test Product Creation Fixes:
1. Duplicated sections eliminated
2. 'name' field support as alias for 'title'
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
SPACE_ID = "71647625-56f9-45c0-9a97-e929c4b20999"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_create_with_name_field():
    """Test creating product using 'name' instead of 'title'"""
    log("=== TEST 1: CREATE WITH 'name' FIELD ===")
    
    product_data = {
        "name": "Producto con NAME Field",  # ✅ Using 'name' instead of 'title'
        "archetype": "non_fiction",
        "style_family": "classic_publisher",
        "space_id": SPACE_ID
    }
    
    log(f"POST {BASE_URL}/products/")
    log(f"Payload: {json.dumps(product_data, indent=2)}")
    
    response = requests.post(f"{BASE_URL}/products/", json=product_data)
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code in [200, 201]:
        product = response.json()
        log(f"✅ Product created with 'name' field")
        log(f"   ID: {product.get('id')}")
        log(f"   Title: {product.get('title')}")
        
        # Verify no duplicated sections
        sections = product.get('sections', [])
        log(f"\n📊 Sections Analysis:")
        log(f"   Total sections: {len(sections)}")
        
        # Count top-level vs subsections
        top_level = [s for s in sections if s.get('parent_id') is None]
        with_parent = [s for s in sections if s.get('parent_id') is not None]
        
        log(f"   Top-level sections: {len(top_level)}")
        log(f"   Sections with parent_id: {len(with_parent)} ⚠️ Should be 0!")
        
        if len(with_parent) > 0:
            log(f"   ❌ ISSUE: Subsections still appearing in main sections array")
        else:
            log(f"   ✅ FIX VERIFIED: Only top-level sections in array")
        
        # Check for actual duplicates by ID
        section_ids = [s.get('id') for s in sections]
        unique_ids = set(section_ids)
        
        if len(section_ids) != len(unique_ids):
            log(f"   ❌ DUPLICATE IDS FOUND: {len(section_ids)} sections but {len(unique_ids)} unique IDs")
        else:
            log(f"   ✅ NO DUPLICATE IDS")
        
        # Show structure
        log(f"\n📋 Section Structure:")
        for idx, sec in enumerate(top_level, 1):
            log(f"   {idx}. {sec.get('title')}")
            subsections = sec.get('subsections', [])
            for sub_idx, sub in enumerate(subsections, 1):
                log(f"      {idx}.{sub_idx}. {sub.get('title')}")
        
        return product.get('id'), len(with_parent) == 0
    else:
        log(f"❌ Failed to create product")
        log(f"Response: {response.text}")
        return None, False

def test_create_with_title_field():
    """Test creating product using 'title' (old way still works)"""
    log("\n=== TEST 2: CREATE WITH 'title' FIELD ===")
    
    product_data = {
        "title": "Producto con TITLE Field",
        "archetype": "non_fiction",
        "style_family": "classic_publisher",
        "space_id": SPACE_ID
    }
    
    response = requests.post(f"{BASE_URL}/products/", json=product_data)
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code in [200, 201]:
        product = response.json()
        log(f"✅ Product created with 'title' field (backward compatible)")
        log(f"   Title: {product.get('title')}")
        return True
    else:
        log(f"❌ Failed")
        return False

def main():
    log("Testing Product Creation Fixes")
    log("="*60)
    log("Fix 1: Duplicate sections elimination")
    log("Fix 2: 'name' field support")
    log("="*60)
    
    # Test 1: Create with 'name' + check no duplicates
    product_id, no_duplicates = test_create_with_name_field()
    
    # Test 2: Create with 'title' (backward compat)
    title_works = test_create_with_title_field()
    
    log("\n" + "="*60)
    if product_id and no_duplicates and title_works:
        log("✅ ALL FIXES VERIFIED")
        log("   - 'name' field works as alias for 'title'")
        log("   - No section duplicates")
        log("   - Backward compatibility maintained")
    else:
        log("⚠️ Some issues remain:")
        if not product_id:
            log("   - 'name' field not working")
        if not no_duplicates:
            log("   - Section duplicates still present")
        if not title_works:
            log("   - 'title' field broken")
    log("="*60)

if __name__ == "__main__":
    main()
