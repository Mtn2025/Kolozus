import requests
import json

url = "http://localhost:8000/pipeline/run"
payload = {
    "text": "First idea fragment about cognitive systems",
    "source": "python_test_script"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
