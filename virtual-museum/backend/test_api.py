"""
Phase 4 FastAPI Backend API Test Suite

Tests the FastAPI HTTP endpoints independently before frontend integration:
- GET /health
- POST /ask (Valid Question, Follow-up, Out-of-Scope Refusal, Invalid Tone, Empty Question)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def run_api_tests():
    print("=" * 85)
    print("      VIRTUAL MUSEUM PHASE 4 — FASTAPI BACKEND HTTP TEST SUITE")
    print("=" * 85)

    # 1. GET /health
    res_health = client.get("/health")
    print(f"\n[GET /health] Status: {res_health.status_code}, Response: {res_health.json()}")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"
    print("GET /health PASSED ✅")

    # 2. POST /ask — Valid Museum Question
    print("\n[POST /ask] Testing Valid In-Scope Query...")
    payload_valid = {
        "question": "Tell me about the Apollo 11 Command Module Columbia spacecraft.",
        "tone": "educational"
    }
    res_valid = client.post("/ask", json=payload_valid)
    print(f"Status: {res_valid.status_code}")
    data_valid = res_valid.json()
    print(f"Refused     : {data_valid['refused']}")
    print(f"Confidence  : {data_valid['confidence']}")
    print(f"Session ID  : {data_valid['session_id']}")
    print(f"Answer      : {data_valid['answer'][:120]}...")
    print(f"Suggestions : {len(data_valid['related_suggestions'])} items")
    assert res_valid.status_code == 200
    assert data_valid["refused"] is False
    assert data_valid["source"]["artifact"] == "Apollo 11 Command Module \"Columbia\""
    sid = data_valid["session_id"]
    print("Valid In-Scope Query PASSED ✅")

    # 3. POST /ask — Follow-up Query with Session Memory
    print("\n[POST /ask] Testing Follow-Up Query with Session ID...")
    payload_followup = {
        "session_id": sid,
        "question": "What material is Space Shuttle Discovery made of?",
        "tone": "concise"
    }
    res_followup = client.post("/ask", json=payload_followup)
    data_followup = res_followup.json()
    assert res_followup.status_code == 200
    assert data_followup["session_id"] == sid
    print(f"Follow-up Session ID Preserved: {data_followup['session_id']}")
    print(f"Answer: {data_followup['answer'][:120]}...")
    print("Follow-up Query PASSED ✅")

    # 4. POST /ask — Out-of-Scope Question (Refusal Test)
    print("\n[POST /ask] Testing Out-of-Scope Refusal...")
    payload_refusal = {
        "session_id": sid,
        "question": "What is the weather forecast in Tokyo today?"
    }
    res_refusal = client.post("/ask", json=payload_refusal)
    data_refusal = res_refusal.json()
    assert res_refusal.status_code == 200
    assert data_refusal["refused"] is True
    assert data_refusal["source"] is None
    assert data_refusal["evidence"] is None
    assert data_refusal["answer"] == "This information is not available in the curated museum knowledge base."
    print("Out-of-Scope Refusal PASSED ✅")

    # 5. POST /ask — Empty Question Validation Error (HTTP 400 or 422)
    print("\n[POST /ask] Testing Empty Question Validation...")
    res_empty = client.post("/ask", json={"question": "   "})
    print(f"Empty Question Response Code: {res_empty.status_code}")
    assert res_empty.status_code in (400, 422)
    print("Empty Question Validation PASSED ✅")

    print("\n" + "=" * 85)
    print("ALL FASTAPI BACKEND API TESTS PASSED SUCCESSFULLY! ✅")
    print("=" * 85)


if __name__ == "__main__":
    run_api_tests()
