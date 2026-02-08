#!/usr/bin/env python3
"""
Script to test Language Switching Backend
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_get_config():
    """Test GET /ui/config"""
    log("=== TEST: GET UI CONFIG ===")
    
    response = requests.get(f"{BASE_URL}/ui/config")
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        log(f"✅ Config retrieved")
        log(f"   Theme: {data.get('theme')}")
        log(f"   Language: {data.get('language')}")
        return data
    else:
        log(f"❌ Failed: {response.text}")
        return None

def test_update_language_to_en():
    """Test POST /ui/config with language: en"""
    log("\n=== TEST: UPDATE LANGUAGE TO EN ===")
    
    payload = {"language": "en"}
    log(f"POST {BASE_URL}/ui/config")
    log(f"Payload: {json.dumps(payload)}")
    
    response = requests.post(f"{BASE_URL}/ui/config", json=payload)
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        log(f"✅ Language updated")
        log(f"   Status: {data.get('status')}")
        log(f"   Theme: {data.get('theme')}")
        log(f"   Language: {data.get('language')}")
        
        if data.get('language') == 'en':
            log(f"   ✅ Language correctly set to EN")
            return True
        else:
            log(f"   ❌ Language not EN: {data.get('language')}")
            return False
    else:
        log(f"❌ Failed: {response.text}")
        return False

def test_update_language_to_es():
    """Test POST /ui/config with language: es"""
    log("\n=== TEST: UPDATE LANGUAGE TO ES ===")
    
    payload = {"language": "es"}
    response = requests.post(f"{BASE_URL}/ui/config", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        log(f"✅ Language updated to ES")
        log(f"   Language: {data.get('language')}")
        return data.get('language') == 'es'
    else:
        log(f"❌ Failed: {response.text}")
        return False

def test_update_both():
    """Test POST /ui/config with both theme and language"""
    log("\n=== TEST: UPDATE THEME + LANGUAGE ===")
    
    payload = {
        "theme": "obsidian",
        "language": "en"
    }
    log(f"Payload: {json.dumps(payload)}")
    
    response = requests.post(f"{BASE_URL}/ui/config", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        log(f"✅ Both updated")
        log(f"   Theme: {data.get('theme')}")
        log(f"   Language: {data.get('language')}")
        
        success = data.get('theme') == 'obsidian' and data.get('language') == 'en'
        if success:
            log(f"   ✅ Both values correct")
        else:
            log(f"   ❌ Values mismatch")
        return success
    else:
        log(f"❌ Failed: {response.text}")
        return False

def main():
    log("Testing Language Switching Backend")
    log("="*60)
    
    results = {}
    
    # Test 1: Initial GET
    initial_config = test_get_config()
    results['get_config'] = initial_config is not None
    
    # Test 2: Update to EN
    results['update_to_en'] = test_update_language_to_en()
    
    # Verify GET reflects change
    log("\n=== VERIFY: GET AFTER EN UPDATE ===")
    config = test_get_config()
    results['verify_en'] = config and config.get('language') == 'en'
    
    # Test 3: Update to ES
    results['update_to_es'] = test_update_language_to_es()
    
    # Test 4: Update both
    results['update_both'] = test_update_both()
    
    # Final verification
    log("\n=== FINAL VERIFICATION ===")
    final_config = test_get_config()
    
    log("\n" + "="*60)
    log("📊 TEST RESULTS:")
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        log(f"   {test_name}: {status}")
    log("="*60)
    
    all_passed = all(results.values())
    if all_passed:
        log("✅ ALL LANGUAGE BACKEND TESTS PASSED")
    else:
        log("⚠️  Some tests failed")
    log("="*60)

if __name__ == "__main__":
    main()
