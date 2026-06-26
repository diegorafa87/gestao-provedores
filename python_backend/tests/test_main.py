import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
import main

client = TestClient(main.app)


def test_api_root():
    response = client.get('/api')
    assert response.status_code == 200
    assert response.json() == {'message': 'API do ProvedorDoc (Python) está online!'}


def test_auth_root():
    response = client.get('/api/auth/')
    assert response.status_code == 200
    assert 'Firebase' in response.json()['message']
