#!/usr/bin/env python3
"""
Script to test Blueprint Auto-Generation
Tests manual blueprint generation on existing product
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
SPACE_ID = "71647625-56f9-45c0-9a97-e929c4b20999"
PRODUCT_ID = "3fd644d6-01b6-4a99-a845-a0fc9ff4bb58"  # Existing product

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_generate_blueprint():
    """Test manual blueprint generation"""
    log("=== TEST: GENERATE BLUEPRINT ===")
    
    log(f"POST {BASE_URL}/products/{PRODUCT_ID}/blueprint")
    log(f"Triggering auto-structure generation...")
    
    response = requests.post(f"{BASE_URL}/products/{PRODUCT_ID}/blueprint")
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        # ✅ NEW FORMAT: Response has metadata wrapper
        product_id = data.get('product_id')
        sections = data.get('sections', [])
        status = data.get('status')
        
        log(f"✅ Blueprint generated successfully")
        log(f"   Product ID: {product_id}")
        log(f"   Status: {status}")
        
        log(f"\n📊 Blueprint Summary:")
        log(f"   Total Sections: {len(sections)}")
        
        # Analyze structure
        top_level = [s for s in sections if s.get('parent_id') is None]
        with_parent = [s for s in sections if s.get('parent_id') is not None]
        
        log(f"   Top-level (Chapters): {len(top_level)}")
        log(f"   Subsections: {len(with_parent)}")
        
        # ✅ VERIFY: No duplicates (should be 2 modules, not 4+)
        if len(top_level) == 2:
            log(f"   ✅ NO DUPLICATES: Correct section count")
        else:
            log(f"   ⚠️  Expected 2 modules, got {len(top_level)}")
        
        log(f"\n📋 Generated Outline:")
        for idx, sec in enumerate(top_level, 1):
            log(f"   {idx}. {sec.get('title')}")
            
            # Find subsections
            subsecs = [s for s in sections if s.get('parent_id') == sec.get('id')]
            for sub_idx, sub in enumerate(subsecs, 1):
                log(f"      {idx}.{sub_idx}. {sub.get('title')}")
        
        return len(top_level)
    else:
        log(f"❌ Blueprint generation failed")
        log(f"Response: {response.text}")
        return 0

def test_verify_product_updated():
    """Verify product has updated sections"""
    log(f"\n=== TEST: VERIFY PRODUCT UPDATED ===")
    
    log(f"GET {BASE_URL}/products/{PRODUCT_ID}")
    
    response = requests.get(f"{BASE_URL}/products/{PRODUCT_ID}")
    
    if response.status_code == 200:
        product = response.json()
        sections = product.get('sections', [])
        
        log(f"✅ Product retrieved")
        log(f"   Title: {product.get('title')}")
        log(f"   Total Sections: {len(sections)}")
        
        # Show outline
        log(f"\n📖 Product Outline:")
        for idx, sec in enumerate(sections, 1):
            log(f"   {idx}. {sec.get('title')}")
            subsecs = sec.get('subsections', [])
            for sub_idx, sub in enumerate(subsecs, 1):
                log(f"      {idx}.{sub_idx}. {sub.get('title')}")
        
        return len(sections)
    else:
        log(f"❌ Failed to retrieve product")
        return 0

def verify_database():
    """Info for manual DB verification"""
    log(f"\n=== VERIFY: DATABASE ===")
    log(f"To verify sections in database, run:")
    log(f"docker exec kolozus-db-1 psql -U user -d kolozus -c \\")
    log(f"  \"SELECT id, title, parent_id, order_index FROM product_sections \\")
    log(f"   WHERE product_id = '{PRODUCT_ID}' ORDER BY order_index;\"")

def main():
    log("Testing Blueprint Auto-Generation")
    log("="*60)
    log(f"Product ID: {PRODUCT_ID}")
    log(f"Product: Libro: Derechos Digitales")
    log(f"Space: Derechos Digitales 2026")
    log("="*60)
    
    # Test 1: Generate Blueprint
    chapters_count = test_generate_blueprint()
    
    # Test 2: Verify Product Updated
    sections_count = test_verify_product_updated()
    
    # Test 3: DB Verification Info
    verify_database()
    
    log("\n" + "="*60)
    if chapters_count > 0 and sections_count > 0:
        log("✅ BLUEPRINT GENERATION VERIFIED")
        log(f"   Generated {chapters_count} chapters")
        log(f"   Product has {sections_count} sections total")
    else:
        log("⚠️  Blueprint generation issues detected")
    log("="*60)

if __name__ == "__main__":
    main()
