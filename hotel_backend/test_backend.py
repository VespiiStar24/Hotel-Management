import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_backend():
    print("Testing backend connection...")
    
    # Test basic connection
    try:
        response = requests.get("http://localhost:5000/")
        print(f"✅ Basic connection: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Basic connection failed: {e}")
        return
    
    # Test health endpoint
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
    
    # Test login endpoint structure
    try:
        response = requests.post(f"{BASE_URL}/login", 
                               json={"username": "test", "password": "test", "role": "guest"})
        print(f"✅ Login endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Login endpoint failed: {e}")

if __name__ == "__main__":
    test_backend()