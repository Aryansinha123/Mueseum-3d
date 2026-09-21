"""
Inline pipeline tests - ASCII safe, no special chars in prints
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

from rag.rag_pipeline import answer_question

print("=" * 50)
print("PIPELINE TESTS")
print("=" * 50)

# Test 1: Weather - should refuse (Type B, score well below threshold)
r1 = answer_question("What is the weather today?")
assert r1["refused"] == True, "FAIL: weather should be refused"
assert r1["llm_called"] == False, "FAIL: LLM must not be called on refusal"
print(f"TEST 1 PASS: 'weather today' refused | score={r1['confidence']:.4f} | LLM called={r1['llm_called']}")

# Test 2: Math - should refuse
r2 = answer_question("What is 25 times 17?")
assert r2["refused"] == True, "FAIL: math should be refused"
print(f"TEST 2 PASS: 'math' refused | score={r2['confidence']:.4f}")

# Test 3: "What is this?" with artifact_id (Type A) - must ACCEPT
r3 = answer_question("What is this?", artifact_id="ART001", session_id="test-session-1")
assert r3["refused"] == False, f"FAIL: 'What is this?' with ART001 should NOT be refused. Got: {r3['answer']}"
assert r3["llm_called"] == True, "FAIL: LLM should be called for accepted query"
assert r3["source"] is not None, "FAIL: source must be populated"
assert r3["source"]["artifact"] == "Old Arrow Maker", f"FAIL: wrong artifact, got {r3['source']['artifact']}"
print(f"TEST 3 PASS: 'What is this?' + ART001 | score={r3['confidence']:.4f} | source={r3['source']['artifact']}")
print(f"  Answer: {r3['answer'][:100]}...")

# Test 4: "Tell me about this artifact" with ART006
r4 = answer_question("Tell me about this artifact", artifact_id="ART006", session_id="test-session-2")
assert r4["refused"] == False, "FAIL: 'Tell me about this' with ART006 should NOT be refused"
assert "Apollo" in r4["source"]["artifact"], f"FAIL: expected Apollo, got {r4['source']['artifact']}"
print(f"TEST 4 PASS: 'Tell me about this' + ART006 | source={r4['source']['artifact']}")

# Test 5: Memory across turns (same session)
r5a = answer_question("What is this?", artifact_id="ART012", session_id="test-session-3", tone="concise")
r5b = answer_question("When was it created?", artifact_id="ART012", session_id="test-session-3", tone="friendly")
assert r5a["refused"] == False, "FAIL: T-Rex first question should be answered"
assert r5b["refused"] == False, "FAIL: T-Rex follow-up should be answered"
print(f"TEST 5 PASS: Memory - T-Rex skull (ART012) | 2 turns both answered | session=test-session-3")

# Test 6: General museum query (Type B) - dinosaurs should hit ART012 or ART013
r6 = answer_question("Tell me about dinosaur fossils and prehistoric creatures")
assert r6["refused"] == False, "FAIL: dinosaur query should match Natural History artifacts"
print(f"TEST 6 PASS: Dinosaur general query | source={r6['source']['artifact']} | score={r6['confidence']:.4f}")

# Test 7: Tone validation
r7 = answer_question("What is this?", artifact_id="ART009", tone="invalid_tone")
assert r7["tone"] == "educational", f"FAIL: invalid tone should fall back to educational, got {r7['tone']}"
print(f"TEST 7 PASS: Invalid tone falls back to 'educational' | got={r7['tone']}")

# Test 8: Recommendations exclude current artifact
recs = r3.get("related_suggestions", [])
assert all(s["artifact_id"] != "ART001" for s in recs), "FAIL: current artifact in recommendations"
print(f"TEST 8 PASS: Recommendations exclude current artifact | {len(recs)} suggestions returned")

# Test 9: Concise vs educational - different answers, same source
r9a = answer_question("What is this?", artifact_id="ART003", tone="educational")
r9b = answer_question("What is this?", artifact_id="ART003", tone="concise")
assert r9a["source"]["artifact"] == r9b["source"]["artifact"], "FAIL: source must be same regardless of tone"
print(f"TEST 9 PASS: Same source regardless of tone | source={r9a['source']['artifact']}")

# Test 10: Session ID is preserved
assert r3["session_id"] == "test-session-1", f"FAIL: session_id mismatch: {r3['session_id']}"
assert r5a["session_id"] == "test-session-3", f"FAIL: session_id mismatch: {r5a['session_id']}"
print(f"TEST 10 PASS: Session IDs preserved correctly")

print()
print("=" * 50)
print("ALL 10 PIPELINE TESTS PASSED")
print("=" * 50)
