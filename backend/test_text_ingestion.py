#!/usr/bin/env python3
"""
Script to test Text Ingestion operations (Individual + Batch)
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
SPACE_ID = "71647625-56f9-45c0-9a97-e929c4b20999"  # Derechos Digitales 2026

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_individual_ingest():
    """Test individual text ingestion"""
    log("=== TEST: INDIVIDUAL TEXT INGESTION ===")
    
    payload = {
        "space_id": SPACE_ID,
        "text": "La privacidad digital es un derecho fundamental en la era de la información. Los ciudadanos deben tener control sobre sus datos personales y cómo se utilizan. Las regulaciones como GDPR establecen marcos claros para la protección de datos.",
        "source": "user_input"
    }
    
    log(f"POST {BASE_URL}/ingest/")
    log(f"Space ID: {SPACE_ID}")
    log(f"Text preview: {payload['text'][:80]}...")
    
    response = requests.post(f"{BASE_URL}/ingest/", json=payload)
    
    log(f"Status Code: {response.status_code}")
    log(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        result = response.json()
        log(f"✅ Text ingested successfully")
        log(f"   Decision: {result.get('decision', 'N/A')}")
        log(f"   Target Idea: {result.get('target_idea', 'N/A')}")
        return True
    else:
        log(f"❌ Failed to ingest text")
        return False

def test_batch_ingest():
    """Test batch text ingestion"""
    log("\n=== TEST: BATCH TEXT INGESTION ===")
    
    texts = [
        {
            "text": "Los derechos de autor en entornos digitales presentan desafíos únicos. La reproducción y distribución de contenido en internet requiere nuevos marcos legales que equilibren la protección de creadores con el acceso al conocimiento.",
            "source": "batch_import"
        },
        {
            "text": "La ciberseguridad y protección de infraestructuras críticas es esencial en la sociedad moderna. Los ataques cibernéticos pueden comprometer sistemas vitales como redes eléctricas, sistemas financieros y servicios de salud.",
            "source": "batch_import"
        },
        {
            "text": "La ética en la inteligencia artificial y automatización plantea cuestiones fundamentales sobre responsabilidad, transparencia y sesgo algorítmico. Los sistemas de IA deben diseñarse con principios éticos claros para proteger los derechos humanos.",
            "source": "batch_import"
        }
    ]
    
    # Add space_id to each item
    for item in texts:
        item["space_id"] = SPACE_ID
    
    payload = {
        "items": texts
    }
    
    log(f"POST {BASE_URL}/ingest/batch")
    log(f"Space ID: {SPACE_ID}")
    log(f"Number of texts: {len(texts)}")
    
    response = requests.post(f"{BASE_URL}/ingest/batch", json=payload)
    
    log(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        results = response.json()
        log(f"✅ Batch ingestion completed")
        log(f"Response: {json.dumps(results, indent=2)}")
        
        success_count = sum(1 for r in results if 'error' not in r)
        log(f"   Successful: {success_count}/{len(texts)}")
        
        return True
    else:
        log(f"❌ Failed batch ingestion")
        log(f"Response: {response.text}")
        return False

def verify_database():
    """Instructions for database verification"""
    log("\n=== DATABASE VERIFICATION ===")
    log("Run these SQL queries to verify:")
    log(f"  SELECT COUNT(*) FROM fragments WHERE space_id = '{SPACE_ID}';")
    log(f"  SELECT COUNT(*) FROM ideas WHERE space_id = '{SPACE_ID}';")
    log(f"  SELECT id, LEFT(content, 50) FROM fragments WHERE space_id = '{SPACE_ID}';")
    log(f"  SELECT id, LEFT(summary, 50) FROM ideas WHERE space_id = '{SPACE_ID}';")

def main():
    log("Starting Text Ingestion Test")
    log("="*60)
    log(f"Target Space: Derechos Digitales 2026")
    log(f"Space ID: {SPACE_ID}")
    log("="*60)
    
    # Individual Ingest
    individual_success = test_individual_ingest()
    
    # Wait a moment
    import time
    time.sleep(1)
    
    # Batch Ingest
    batch_success = test_batch_ingest()
    
    # Database Verification
    verify_database()
    
    log("\n" + "="*60)
    if individual_success and batch_success:
        log("✅ ALL INGESTION TESTS PASSED")
    else:
        log("⚠️  Some tests failed - check logs above")
    log("="*60)

if __name__ == "__main__":
    main()
