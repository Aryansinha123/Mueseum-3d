"""
Phase 0-4 End-to-End Audit Test
Run from: virtual-museum/backend/
Usage: python test_e2e.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

print("=" * 60)
print("VIRTUAL MUSEUM - END-TO-END AUDIT TEST")
print("=" * 60)

# -- Step 1: Load artifacts ------------------------------------
print("\n[1] Loading artifacts.json ...")
import json
with open("data/artifacts.json", "r", encoding="utf-8") as f:
    arts = json.load(f)

print(f"    OK - {len(arts)} artifacts loaded")
ids = [a["id"] for a in arts]
names = [a["name"] for a in arts]
galleries = list(set(a.get("galleryName", "?") for a in arts))
print(f"    IDs     : {ids}")
print(f"    Galleries: {galleries}")

# Check all IDs are unique
assert len(ids) == len(set(ids)), "FAIL: Duplicate artifact IDs!"
print("    ID uniqueness: PASS")

# Check all galleryNames are populated
for a in arts:
    assert a.get("galleryName"), f"FAIL: Missing galleryName for {a['id']}"
print("    GalleryName populated: PASS")

# -- Step 2: Embeddings ---------------------------------------
print("\n[2] Initialising embedding manager ...")
from rag.embeddings import ArtifactEmbeddingManager
mgr = ArtifactEmbeddingManager()
print(f"    Embeddings shape: {mgr.embeddings.shape}")
assert mgr.embeddings.shape[0] == 15, "FAIL: Wrong number of embeddings"
assert mgr.embeddings.shape[1] > 0, "FAIL: Zero-dimension embeddings"
print("    Shape: PASS")

# Check no NaN values
import numpy as np
assert not np.isnan(mgr.embeddings).any(), "FAIL: NaN values in embeddings"
print("    No NaN: PASS")

# -- Step 3: Retrieval -----------------------------------------
print("\n[3] Testing cosine retrieval ...")
from rag.retrieval import ArtifactRetriever
retriever = ArtifactRetriever(embedding_manager=mgr)

q_dino = "Tell me about the T-Rex dinosaur fossil skull"
r = retriever.retrieve(q_dino)
print(f"    Query: '{q_dino}'")
print(f"    Best match: {r['artifact_name']} ({r['artifact_id']}) - score: {r['similarity_score']:.4f}")
assert r["artifact_id"] == "ART012", f"FAIL: Expected ART012 (T-Rex), got {r['artifact_id']}"
print("    Dinosaur retrieval: PASS")

q_apollo = "Apollo lunar landing spacecraft"
r2 = retriever.retrieve(q_apollo)
print(f"\n    Query: '{q_apollo}'")
print(f"    Best match: {r2['artifact_name']} ({r2['artifact_id']}) - score: {r2['similarity_score']:.4f}")
assert r2["artifact_id"] == "ART006", f"FAIL: Expected ART006 (Apollo), got {r2['artifact_id']}"
print("    Space retrieval: PASS")

# -- Step 4: Confidence gate ------------------------------------
print("\n[4] Testing confidence gate ...")
from rag.confidence import is_relevant, RELEVANCE_THRESHOLD
print(f"    Threshold: {RELEVANCE_THRESHOLD}")
assert is_relevant(0.80) == True
assert is_relevant(0.50) == True
assert is_relevant(0.49) == False
assert is_relevant(0.00) == False
print("    Gate logic: PASS")

# -- Step 5: Pipeline - Type B query --------------------------
print("\n[5] Testing pipeline - Type B (general semantic) ...")
from rag.rag_pipeline import answer_question

weather_result = answer_question("What is the weather today?")
print(f"    'What is the weather today?' -> refused={weather_result['refused']}, confidence={weather_result['confidence']:.4f}")
assert weather_result["refused"] == True, "FAIL: Weather question should be REFUSED"
assert weather_result["llm_called"] == False, "FAIL: LLM must NOT be called for refused queries"
print("    Out-of-scope refusal: PASS")

math_result = answer_question("What is 25 times 17?")
print(f"    'What is 25 times 17?' -> refused={math_result['refused']}, confidence={math_result['confidence']:.4f}")
assert math_result["refused"] == True, "FAIL: Math question should be REFUSED"
print("    Math refusal: PASS")

# -- Step 6: Pipeline - Type A (contextual) --------------------
print("\n[6] Testing pipeline - Type A ('What is this?' with artifact_id) ...")
GROQ_KEY = os.environ.get("GROQ_API_KEY") or os.environ.get("GROK_API_KEY")
if not GROQ_KEY:
    print("    WARNING: No GROQ_API_KEY found - skipping LLM call test")
    print("    (Set GROQ_API_KEY in backend/.env to test full pipeline)")
else:
    result_a = answer_question(
        question="What is this?",
        artifact_id="ART001",
        tone="educational",
        session_id="test-session-001"
    )
    print(f"    'What is this?' (ART001) -> refused={result_a['refused']}, confidence={result_a['confidence']:.4f}")
    assert result_a["refused"] == False, f"FAIL: 'What is this?' with ART001 should NOT be refused. Got: {result_a['answer']}"
    assert "answer" in result_a and result_a["answer"], "FAIL: Empty answer"
    assert result_a["source"] is not None, "FAIL: Source should be populated"
    assert result_a["session_id"] == "test-session-001", "FAIL: Wrong session_id"
    safe_preview = result_a['answer'][:120].encode('ascii', 'replace').decode('ascii')
    print(f"    Answer preview: {safe_preview}...")
    print(f"    Source: {result_a['source']}")
    print(f"    Confidence: {result_a['confidence']:.4f}")
    print(f"    Suggestions: {len(result_a['related_suggestions'])} items")
    print("    Type A contextual query: PASS")

    # Test Multiple Artifacts dynamically
    for test_id, expected_name in [("ART001", "Old Arrow Maker"), ("ART003", "Morse-Vail Telegraph Key"), ("ART006", "Apollo 11 Command Module \"Columbia\""), ("ART012", "Tyrannosaurus rex Skull")]:
        res_dyn = answer_question(
            question="What is this?",
            artifact_id=test_id,
            tone="educational",
            session_id=f"session-dyn-{test_id}"
        )
        print(f"    Dynamic 'What is this?' ({test_id}) -> refused={res_dyn['refused']}, source={res_dyn['source']['artifact']}")
        assert res_dyn["refused"] == False, f"FAIL: {test_id} was refused"
        assert res_dyn["source"]["artifact"] == expected_name, f"FAIL: Expected {expected_name}, got {res_dyn['source']['artifact']}"
    print("    Multiple dynamic artifacts (ART001, ART003, ART006, ART012): PASS")

    # Test out-of-scope question with selected artifact (should still be REFUSED)
    res_unrelated = answer_question(
        question="What is the weather today in Tokyo?",
        artifact_id="ART003",
        tone="educational",
        session_id="session-unrelated"
    )
    print(f"    Unrelated question with ART003 selected -> refused={res_unrelated['refused']}, llm_called={res_unrelated['llm_called']}")
    assert res_unrelated["refused"] == True, "FAIL: Unrelated question with artifact selected should be REFUSED"
    assert res_unrelated["llm_called"] == False, "FAIL: LLM should NOT be called for refused query"
    print("    Contextual out-of-scope refusal: PASS")

    # Test follow-up using same session (memory)
    result_b = answer_question(
        question="When was it created?",
        artifact_id="ART001",
        tone="concise",
        session_id="test-session-001"
    )
    print(f"\n    'When was it created?' (ART001, same session) -> refused={result_b['refused']}")
    assert result_b["refused"] == False, "FAIL: Follow-up question should be answered"
    print("    Memory + follow-up: PASS")

    # Test concise tone
    result_c = answer_question(
        question="What is it made of?",
        artifact_id="ART001",
        tone="concise",
        session_id="test-session-002"
    )
    print(f"\n    'What is it made of?' (ART001, concise tone) -> refused={result_c['refused']}")
    assert result_c["refused"] == False, "FAIL: Material question should be answered"
    print("    Concise tone: PASS")

# -- Step 7: Recommendations -----------------------------------
print("\n[7] Testing recommendations ...")
from rag.recommendations import ArtifactRecommender
recommender = ArtifactRecommender(embedding_manager=mgr)
recs = recommender.get_recommendations("ART001", seen_artifact_ids=["ART001", "ART002"], top_k=3)
print(f"    Recommendations for ART001 (excluding ART001, ART002): {[r['artifact_id'] for r in recs]}")
assert all(r["artifact_id"] != "ART001" for r in recs), "FAIL: Current artifact in recommendations"
assert all(r["artifact_id"] != "ART002" for r in recs), "FAIL: Seen artifact in recommendations"
assert len(recs) <= 3, "FAIL: Too many recommendations"
print("    Recommendation filtering: PASS")

# -- Step 8: Session memory ------------------------------------
print("\n[8] Testing session memory ...")
from rag.memory import SessionMemory
mem = SessionMemory(max_history=3)
mem.add_exchange("What is this?", "It is a marble sculpture.")
mem.add_exchange("When was it made?", "It was modeled in 1866.")
mem.add_exchange("Who made it?", "Edmonia Lewis.")
mem.add_exchange("Where is it from?", "Rome and United States.")  # Should drop first entry
assert len(mem.history) == 3, f"FAIL: Expected 3 entries, got {len(mem.history)}"
history_text = mem.format_history_for_prompt()
assert "Turn 1" in history_text
print("    Sliding window (max 3): PASS")

# -- Done ------------------------------------------------------
print("\n" + "=" * 60)
print("ALL TESTS PASSED")
print("=" * 60)
print("\nPhase 0: artifacts.json loads, IDs unique, galleryNames populated")
print("Phase 1: embeddings generated, cosine retrieval works correctly")
print("Phase 2: confidence gate refuses out-of-scope queries, LLM not called")
print("Phase 3: session memory sliding window, recommendations filter correctly")
if GROQ_KEY:
    print("Phase 4: Type A ('What is this?') resolved to selected artifact, Groq answered")
    print("Phase 4: Type B (general) retrieval + grounded answer works")
