#!/usr/bin/env python3
"""
Script to capture screenshots of the Kolozus frontend
Uses selenium with headless Chrome
"""
import os
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def setup_driver():
    """Setup headless Chrome driver"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"Error setting up Chrome driver: {e}")
        print("Attempting to install chromedriver...")
        os.system("apt-get update && apt-get install -y chromium chromium-driver")
        driver = webdriver.Chrome(options=chrome_options)
        return driver

def capture_screenshots():
    """Capture screenshots of frontend"""
    print("Starting screenshot capture...")
    
    driver = setup_driver()
    
    try:
        # Navigate to frontend
        print("Navigating to http://frontend:3000")
        driver.get("http://frontend:3000")
        
        # Wait for page to load
        time.sleep(3)
        
        # Capture dashboard screenshot
        print("Capturing dashboard screenshot...")
        driver.save_screenshot('/tmp/dashboard_estado_final.png')
        print("✓ Dashboard screenshot saved to /tmp/dashboard_estado_final.png")
        
        # Execute JavaScript to get localStorage
        print("Capturing localStorage data...")
        local_storage = driver.execute_script("return JSON.stringify(localStorage);")
        
        with open('/tmp/localStorage_data.json', 'w') as f:
            f.write(local_storage)
        print(f"✓ localStorage data saved to /tmp/localStorage_data.json")
        print(f"LocalStorage contents: {local_storage}")
        
        # Take screenshot with DevTools open (simulate)
        # Since we can't actually open DevTools in headless, we'll document the data
        print("\n=== FRONTEND STATE ===")
        print(f"URL: {driver.current_url}")
        print(f"Title: {driver.title}")
        print(f"Page Source Length: {len(driver.page_source)}")
        
        # Try to find spaces on the page
        try:
            spaces = driver.find_elements(By.CSS_SELECTOR, "[data-space-id], .space-card, .space-item")
            print(f"Found {len(spaces)} space elements on page")
        except:
            print("Could not identify space elements")
        
        print("\n✅ Screenshot capture completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error during screenshot capture: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        driver.quit()

if __name__ == "__main__":
    success = capture_screenshots()
    sys.exit(0 if success else 1)
