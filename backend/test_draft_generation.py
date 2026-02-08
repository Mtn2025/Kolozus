#!/usr/bin/env python3
"""
Script to test Draft Generation for Product Sections
Tests L0-L3 intervention levels
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
PRODUCT_ID = "3fd644d6-01b6-4a99-a845-a0fc9ff4bb58"  # Libro: Derechos Digitales
SPACE_ID = "71647625-56f9-45c0-9a97-e929c4b20999"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def get_first_section():
    """Get first section from product"""
    log("Getting product sections...")
    response = requests.get(f"{BASE_URL}/products/{PRODUCT_ID}")
    if response.status_code == 200:
        product = response.json()
        sections = product.get('sections', [])
        if sections:
            first_section = sections[0]
            log(f"✅ Found section: {first_section.get('title')}")
            log(f"   ID: {first_section.get('id')}")
            return first_section.get('id')
    log("❌ No sections found")
    return None

def test_draft_generation(section_id, level):
    """Test draft generation for a specific level"""
    level_names = {0: "L0 - Raw", 1: "L1 - Clean", 2: "L2 - Flow", 3: "L3 - Deep"}
    
    log(f"\n=== TEST: GENERATE DRAFT {level_names[level]} ===")
    
    payload = {
        "level": level,
        "context": {
            "space_id": SPACE_ID
        }
    }
    
    log(f"POST /products/{PRODUCT_ID}/sections/{section_id}/draft")
    log(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/products/{PRODUCT_ID}/sections/{section_id}/draft",
        json=payload
    )
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        log(f"✅ Draft generated successfully")
        log(f"\n📊 Draft Summary:")
        log(f"   Section ID: {data.get('section_id')}")
        log(f"   Level: {data.get('level')} ({level_names[level]})")
        log(f"   Word Count: {data.get('word_count')}")
        log(f"   Status: {data.get('status')}")
        
        content = data.get('content', '')
        preview = content[:200] + "..." if len(content) > 200 else content
        log(f"\n📝 Content Preview:")
        log(f"   {preview}")
        
        return True
    else:
        log(f"❌ Draft generation failed")
        log(f"Response: {response.text}")
        return False

def verify_section_updated(section_id):
    """Verify section was updated in product"""
    log(f"\n=== VERIFY: SECTION UPDATED ===")
    
    response = requests.get(f"{BASE_URL}/products/{PRODUCT_ID}")
    
    if response.status_code == 200:
        product = response.json()
        sections = product.get('sections', [])
        
        for section in sections:
            if section.get('id') == section_id:
                log(f"✅ Section found in product")
                log(f"   Title: {section.get('title')}")
                log(f"   Intervention Level: {section.get('intervention_level')}")
                
                content = section.get('content', '')
                log(f"   Content Length: {len(content)} chars")
                
                if content and len(content) > 50:
                    log(f"   ✅ Content updated successfully")
                    return True
                else:
                    log(f"   ⚠️  Content seems empty or too short")
                    return False
        
        log(f"❌ Section not found in product")
        return False
    else:
        log(f"❌ Failed to get product")
        return False

def main():
    log("Testing Draft Generation System")
    log("="*60)
    log(f"Product: Libro: Derechos Digitales")
    log(f"Product ID: {PRODUCT_ID}")
    log("="*60)
    
    # Get first section
    section_id = get_first_section()
    
    if not section_id:
        log("\n❌ Cannot proceed without sections")
        log("   Run blueprint generation first")
        return
    
    # Test each intervention level
    results = {}
    for level in [0, 1, 2, 3]:
        success = test_draft_generation(section_id, level)
        results[level] = success
    
    # Verify final state
    verify_section_updated(section_id)
    
    log("\n" + "="*60)
    log("📊 TEST RESULTS SUMMARY:")
    for level, success in results.items():
        level_names = {0: "L0 - Raw", 1: "L1 - Clean", 2: "L2 - Flow", 3: "L3 - Deep"}
        status = "✅ PASSED" if success else "❌ FAILED"
        log(f"   {level_names[level]}: {status}")
    
    all_passed = all(results.values())
    log("="*60)
    if all_passed:
        log("✅ ALL DRAFT GENERATION TESTS PASSED")
    else:
        log("⚠️  Some tests failed - check logs above")
    log("="*60)

if __name__ == "__main__":
    main()
