"""
Phase 2 XAI RAG Pipeline Test Suite

Evaluates pre-LLM confidence gating, refusal behavior, and grounded LLM answers.

Tests 3 Categories:
- Category A: In-Scope Queries (Should be ACCEPTED and call LLM)
- Category B: Vague / Boundary Queries (Evaluates similarity threshold)
- Category C: Out-of-Scope Queries (Should be REFUSED without calling LLM)
"""

import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from rag.rag_pipeline import Phase2RAGPipeline


def run_phase2_tests():
    """Executes the complete Phase 2 XAI evaluation suite."""
    print("=" * 85)
    print("      VIRTUAL MUSEUM PHASE 2 — CONFIDENCE-AWARE EXPLAINABLE RAG TEST SUITE")
    print("=" * 85)

    pipeline = Phase2RAGPipeline(threshold=0.50)

    test_cases = [
        # --- CATEGORY A: IN-SCOPE QUERIES ---
        {
            "category": "CATEGORY A — IN-SCOPE (History)",
            "question": "Tell me about the Old Arrow Maker sculpture and what inspired it."
        },
        {
            "category": "CATEGORY A — IN-SCOPE (Pottery Material)",
            "question": "What material is the Attic Black-Figure Amphora ceramic vessel made from?"
        },
        {
            "category": "CATEGORY A — IN-SCOPE (Technology Significance)",
            "question": "What is the historical significance of the Morse-Vail Telegraph Key?"
        },
        {
            "category": "CATEGORY A — IN-SCOPE (Space)",
            "question": "Tell me about the Apollo 11 Command Module Columbia spacecraft."
        },
        {
            "category": "CATEGORY A — IN-SCOPE (Natural History)",
            "question": "What can you tell me about the Tyrannosaurus rex fossil skull specimen?"
        },

        # --- CATEGORY B: VAGUE / BOUNDARY QUERIES ---
        {
            "category": "CATEGORY B — VAGUE / BOUNDARY",
            "question": "Tell me about this exhibit object."
        },
        {
            "category": "CATEGORY B — VAGUE / BOUNDARY",
            "question": "What is this artifact?"
        },

        # --- CATEGORY C: COMPLETELY OUT-OF-SCOPE QUERIES ---
        {
            "category": "CATEGORY C — OUT-OF-SCOPE (Weather)",
            "question": "What is the weather forecast in Tokyo today?"
        },
        {
            "category": "CATEGORY C — OUT-OF-SCOPE (Math)",
            "question": "What is 25 multiplied by 17?"
        },
        {
            "category": "CATEGORY C — OUT-OF-SCOPE (Code)",
            "question": "Write a Python function to sort an array using quicksort."
        },
        {
            "category": "CATEGORY C — OUT-OF-SCOPE (Sports)",
            "question": "Who won the recent World Cup soccer final?"
        }
    ]

    print(f"\n[Phase 2 Runner] Running {len(test_cases)} test cases with Threshold = {pipeline.threshold}\n")

    accepted_count = 0
    refused_count = 0

    for idx, case in enumerate(test_cases, start=1):
        q = case["question"]
        cat = case["category"]

        result = pipeline.answer_question(q)

        decision_str = "REFUSED" if result["refused"] else "ACCEPTED"
        llm_called_str = "YES" if result["llm_called"] else "NO"

        if result["refused"]:
            refused_count += 1
        else:
            accepted_count += 1

        print("=" * 85)
        print(f"Test #{idx} [{cat}]")
        print(f"Question       : \"{q}\"")
        print(f"Similarity     : {result['confidence']:.4f}")
        print(f"Threshold      : {result['threshold_used']:.4f}")
        print(f"Decision       : {decision_str}")
        print(f"LLM Called     : {llm_called_str}")
        print(f"Answer         : {result['answer']}")
        if result["source"]:
            print(f"Source         : {result['source']['artifact']} — {result['source']['gallery']}")
        else:
            print("Source         : None (Refused)")
        if result["evidence"]:
            print(f"Evidence       : {result['evidence'][:140]}...")
        else:
            print("Evidence       : None (Refused)")
        print("=" * 85)

    print("\n" + "=" * 85)
    print("PHASE 2 SUMMARY STATS")
    print(f"  Total Queries Tested: {len(test_cases)}")
    print(f"  Accepted Queries    : {accepted_count} (LLM Called)")
    print(f"  Refused Queries     : {refused_count} (LLM NOT Called)")
    print("=" * 85)


if __name__ == "__main__":
    run_phase2_tests()
