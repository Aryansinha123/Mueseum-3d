"""
Phase 1 RAG Retrieval System Test Suite

Tests the standalone retrieval pipeline across:
1. In-Scope Questions (History, Space, Natural History, Descriptions, Significance)
2. Out-of-Scope Questions (Weather, Math, General Trivia)

Note: Phase 1 does NOT refuse questions or call an LLM.
Out-of-scope questions demonstrate lower retrieval similarity scores.
"""

import sys
import os

# Ensure backend root is on Python module path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rag.retrieval import ArtifactRetriever


def run_retrieval_tests():
    """Executes test questions against the Phase 1 RAG retrieval engine."""
    print("=" * 80)
    print("      VIRTUAL MUSEUM RAG CORE — PHASE 1 RETRIEVAL TEST SUITE")
    print("=" * 80)

    # Initialize retriever (loads embeddings & sentence-transformer model)
    retriever = ArtifactRetriever()

    test_questions = [
        # --- IN-SCOPE: HISTORY GALLERY ---
        {
            "category": "IN-SCOPE (History - Art/Sculpture)",
            "question": "Who created the Old Arrow Maker marble sculpture and what inspired it?"
        },
        {
            "category": "IN-SCOPE (History - Pottery)",
            "question": "What was the Greek Attic Black-Figure Amphora used for in ancient times?"
        },
        {
            "category": "IN-SCOPE (History - Technology)",
            "question": "What is the historical significance of the Morse-Vail Telegraph Key?"
        },

        # --- IN-SCOPE: SPACE & AVIATION GALLERY ---
        {
            "category": "IN-SCOPE (Space - Spacecraft)",
            "question": "Which command module carried Neil Armstrong and Buzz Aldrin to the Moon in 1969?"
        },
        {
            "category": "IN-SCOPE (Space - Supersonic Flight)",
            "question": "Who piloted the Bell X-1 Glamorous Glennis to break the sound barrier?"
        },

        # --- IN-SCOPE: NATURAL HISTORY / PALEONTOLOGY GALLERY ---
        {
            "category": "IN-SCOPE (Natural History - Dinosaurs)",
            "question": "Where was the Tyrannosaurus rex skull discovered and what are its features?"
        },
        {
            "category": "IN-SCOPE (Natural History - Ice Age Megafauna)",
            "question": "What teeth adaptations allowed Woolly Mammoths to grind tundra grasses?"
        },

        # --- OUT-OF-SCOPE QUESTIONS (Demonstrates lower similarity scores without refusal) ---
        {
            "category": "OUT-OF-SCOPE (Weather)",
            "question": "What is the weather forecast in Tokyo today?"
        },
        {
            "category": "OUT-OF-SCOPE (Math)",
            "question": "What is 25 multiplied by 17?"
        },
        {
            "category": "OUT-OF-SCOPE (General Trivia)",
            "question": "How do I make chocolate chip cookies at home?"
        }
    ]

    print(f"\n[Test Runner] Executing {len(test_questions)} evaluation queries...\n")

    for idx, item in enumerate(test_questions, start=1):
        q_text = item["question"]
        cat = item["category"]

        result = retriever.retrieve(q_text)

        print("-" * 80)
        print(f"Test #{idx} [{cat}]")
        print(f"Question       : \"{q_text}\"")
        print(f"Best Match     : {result['artifact_name']} (ID: {result['artifact_id']})")
        print(f"Gallery        : {result['gallery']}")
        print(f"Similarity Score: {result['similarity_score']:.4f}")
        print(f"Description    : {result['description'][:140]}...")
        print(f"Evidence Snippet: {result['evidence'][:160]}...")
        print("-" * 80)

    print("\n" + "=" * 80)
    print("PHASE 1 RETRIEVAL TEST COMPLETED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    run_retrieval_tests()
