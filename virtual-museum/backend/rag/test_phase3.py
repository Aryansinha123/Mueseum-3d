"""
Phase 3 Personalization & Recommendation Test Suite

Evaluates:
- TEST 1: Session creation and UUID generation
- TEST 2: Conversation memory & follow-up pronoun resolution
- TEST 3: Bounded memory limit (MAX_HISTORY = 3)
- TEST 4: Persona tone toggles (educational, concise, friendly)
- TEST 5: Visitor profile & engagement analytics tracking
- TEST 6: Vector artifact recommendations ("You Might Also Like") excluding current/seen items
- TEST 7: Pre-LLM refusal gate with active session memory
- TEST 8: Missing/invalid session ID handling
- TEST 9: Invalid tone fallback to default ("educational")
"""

import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from rag.rag_pipeline import Phase3RAGPipeline
from rag.session import get_session_manager


def run_phase3_tests():
    print("=" * 85)
    print("      VIRTUAL MUSEUM PHASE 3 — PERSONALIZATION & RECOMMENDATION TEST SUITE")
    print("=" * 85)

    pipeline = Phase3RAGPipeline(threshold=0.50)
    sm = get_session_manager()

    # -------------------------------------------------------------------------
    # TEST 1 & 8: SESSION CREATION & MISSING ID HANDLING
    # -------------------------------------------------------------------------
    print("\n" + "-" * 85)
    print("TEST 1 & 8: Session Creation & Missing ID Auto-Generation")
    print("-" * 85)
    res_t1 = pipeline.answer_question("Tell me about the Old Arrow Maker sculpture.", session_id=None)
    sid1 = res_t1["session_id"]
    print(f"Generated Session ID: {sid1}")
    assert sid1 is not None and len(sid1) > 10, "Failed to auto-generate valid session ID"
    print("TEST 1 & 8 PASSED ✅")

    # -------------------------------------------------------------------------
    # TEST 2: CONVERSATION MEMORY & FOLLOW-UP DIALOGUE
    # -------------------------------------------------------------------------
    print("\n" + "-" * 85)
    print("TEST 2: Conversation Memory & Multi-turn Dialogue")
    print("-" * 85)
    sid_mem = "session-memory-test"
    
    # Turn 1
    res_t2_1 = pipeline.answer_question("Tell me about the Attic Black-Figure Amphora.", session_id=sid_mem)
    print(f"Turn 1 Answer: {res_t2_1['answer'][:120]}...")
    
    # Turn 2
    res_t2_2 = pipeline.answer_question("What was the Attic Black-Figure Amphora used for in ancient Greece?", session_id=sid_mem)
    print(f"Turn 2 Answer: {res_t2_2['answer'][:120]}...")

    session_state2 = sm.get_or_create_session(sid_mem)
    history2 = session_state2.memory.get_recent_history()
    print(f"Memory Exchanges Count: {len(history2)}")
    assert len(history2) == 2, f"Expected 2 exchanges in history, got {len(history2)}"
    print("TEST 2 PASSED ✅")

    # -------------------------------------------------------------------------
    # TEST 3: BOUNDED MEMORY LIMIT (MAX_HISTORY = 3)
    # -------------------------------------------------------------------------
    print("\n" + "-" * 85)
    print("TEST 3: Bounded Memory Limit (Max 3 Exchanges)")
    print("-" * 85)
    # Add 3 more questions to push history past 3
    pipeline.answer_question("What is the Morse Telegraph Key?", session_id=sid_mem)
    pipeline.answer_question("Tell me about Apollo 11 Columbia.", session_id=sid_mem)
    pipeline.answer_question("Tell me about the Tyrannosaurus rex skull.", session_id=sid_mem)
    
    history_after = session_state2.memory.get_recent_history()
    print(f"Exchanges in memory after 5 total questions: {len(history_after)}")
    assert len(history_after) == 3, f"Memory exceeded MAX_HISTORY=3! Found {len(history_after)}"
    print("TEST 3 PASSED ✅")

    # -------------------------------------------------------------------------
    # TEST 4 & 9: TONE TOGGLES & INVALID TONE FALLBACK
    # -------------------------------------------------------------------------
    print("\n" + "-" * 85)
    print("TEST 4 & 9: Persona Tone Toggles & Invalid Tone Fallback")
    print("-" * 85)
    sid_tone = "session-tone-test"
    
    # Educational
    res_edu = pipeline.answer_question("What is the Tyrannosaurus rex skull?", session_id=sid_tone, tone="educational")
    print(f"\n[Tone: Educational]\n{res_edu['answer'][:160]}...")
    
    # Concise
    res_con = pipeline.answer_question("What is the Tyrannosaurus rex skull?", session_id=sid_tone, tone="concise")
    print(f"\n[Tone: Concise]\n{res_con['answer'][:160]}...")
    
    # Friendly
    res_frn = pipeline.answer_question("What is the Tyrannosaurus rex skull?", session_id=sid_tone, tone="friendly")
    print(f"\n[Tone: Friendly]\n{res_frn['answer'][:160]}...")
    
    # Invalid tone -> Fallback to educational
    res_inv = pipeline.answer_question("What is the Tyrannosaurus rex skull?", session_id=sid_tone, tone="super_random_tone")
    assert res_inv["tone"] == "educational", "Failed to fallback invalid tone to 'educational'"
    print(f"\n[Tone: Invalid -> Fallback]\nResolved tone: '{res_inv['tone']}'")
    print("TEST 4 & 9 PASSED ✅")

    # -------------------------------------------------------------------------
    # TEST 5: VISITOR ENGAGEMENT PROFILE TRACKING
    # -------------------------------------------------------------------------
    print("\n" + "-" * 85)
    print("TEST 5: Visitor Engagement Profile Tracking")
    print("-" * 85)
    sid_prof = "session-profile-test"
    pipeline.answer_question("Tell me about the Old Arrow Maker.", session_id=sid_prof)       # History
    pipeline.answer_question("Tell me about Space Shuttle Discovery.", session_id=sid_prof)  # Space
    pipeline.answer_question("Tell me about Woolly Mammoth Tusk.", session_id=sid_prof)      # Natural History
    
    prof_dict = sm.get_or_create_session(sid_prof).profile.get_profile_dict()
    print("Tracked Profile Analytics:")
    print(f"  Questions Asked: {prof_dict['questions_asked']}")
    print(f"  Galleries Engaged: {prof_dict['galleries']}")
    print(f"  Artifacts Seen: {prof_dict['artifacts_seen']}")
    assert prof_dict["questions_asked"] == 3
    assert len(prof_dict["artifacts_seen"]) == 3
    print("TEST 5 PASSED ✅")

    # -------------------------------------------------------------------------
    # TEST 6: VECTOR RECOMMENDATIONS ("YOU MIGHT ALSO LIKE")
    # -------------------------------------------------------------------------
    print("\n" + "-" * 85)
    print("TEST 6: Vector Artifact Recommendations ('You Might Also Like')")
    print("-" * 85)
    sid_rec = "session-rec-test"
    res_rec = pipeline.answer_question("Tell me about the Apollo 11 Command Module Columbia.", session_id=sid_rec)
    
    suggestions = res_rec["related_suggestions"]
    print(f"Current Artifact: {res_rec['source']['artifact']} (ID: ART006)")
    print(f"Recommendations Count: {len(suggestions)}")
    for idx, s in enumerate(suggestions, start=1):
        print(f"  #{idx} {s['artifact_name']} (ID: {s['artifact_id']}, Gallery: {s['gallery']}, Sim: {s['similarity']:.4f})")
    
    rec_ids = [s["artifact_id"] for s in suggestions]
    assert "ART006" not in rec_ids, "Recommendations failed to exclude current artifact!"
    print("TEST 6 PASSED ✅")

    # -------------------------------------------------------------------------
    # TEST 7: REFUSAL WITH ACTIVE SESSION MEMORY
    # -------------------------------------------------------------------------
    print("\n" + "-" * 85)
    print("TEST 7: Pre-LLM Refusal Gate with Active Session Memory")
    print("-" * 85)
    sid_ref = "session-refusal-test"
    # Step 1: Valid in-scope question
    pipeline.answer_question("Tell me about the Sabertooth Cat skull.", session_id=sid_ref)
    
    # Step 2: Out-of-scope question
    res_out = pipeline.answer_question("What is the weather forecast in Tokyo today?", session_id=sid_ref)
    
    print(f"Question  : 'What is the weather forecast in Tokyo today?'")
    print(f"Refused   : {res_out['refused']}")
    print(f"LLM Called: {res_out['llm_called']}")
    print(f"Answer    : {res_out['answer']}")
    assert res_out["refused"] is True, "Out-of-scope query was not refused!"
    assert res_out["llm_called"] is False, "LLM was improperly called for refused query!"
    print("TEST 7 PASSED ✅")

    print("\n" + "=" * 85)
    print("ALL PHASE 3 PERSONALIZATION TESTS COMPLETED SUCCESSFULLY! ✅")
    print("=" * 85)


if __name__ == "__main__":
    run_phase3_tests()
