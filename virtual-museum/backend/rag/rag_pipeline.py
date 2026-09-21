"""
Phase 2 XAI RAG Pipeline

Complete end-to-end pipeline:
Question -> Embed -> Cosine Similarity -> Relevance Check (score >= threshold)
  - Below threshold -> Return fixed refusal immediately (LLM NOT CALLED)
  - Above threshold -> Call grounded LLM -> Return Answer + Source + Score + Evidence
"""

from typing import Dict, Any
from .retrieval import ArtifactRetriever
from .confidence import is_relevant, RELEVANCE_THRESHOLD
from .llm import generate_grounded_answer

REFUSAL_MESSAGE = "This information is not available in the curated museum knowledge base."


class Phase2RAGPipeline:
    """
    Confidence-aware Explainable RAG Pipeline.
    Enforces pre-LLM gating to eliminate ungrounded hallucinations.
    """

    def __init__(self, threshold: float = RELEVANCE_THRESHOLD):
        """
        Initialize the pipeline with a retrieval instance and threshold.
        """
        self.retriever = ArtifactRetriever()
        self.threshold = threshold

    def answer_question(self, question: str, override_threshold: float = None) -> Dict[str, Any]:
        """
        Processes a user question through the Phase 2 RAG pipeline.
        
        :param question: User question string
        :param override_threshold: Optional threshold override for testing
        :return: Structured JSON response payload
        """
        if not question or not question.strip():
            raise ValueError("Question string cannot be empty.")

        q_clean = question.strip()
        effective_threshold = override_threshold if override_threshold is not None else self.threshold

        # Step 1: Phase 1 Retrieval
        retrieval_result = self.retriever.retrieve(q_clean)
        best_artifact = self.retriever.manager.artifacts[
            [a["id"] for a in self.retriever.manager.artifacts].index(retrieval_result["artifact_id"])
        ]
        score = retrieval_result["similarity_score"]

        # Step 2: Relevance Threshold Decision Boundary Check
        passed = is_relevant(score, threshold=effective_threshold)

        # Logging explicit gate decision
        print(f"\n[RAG PIPELINE LOG]")
        print(f"  Question  : \"{q_clean}\"")
        print(f"  Best Match: {retrieval_result['artifact_name']} ({retrieval_result['gallery']})")
        print(f"  [RETRIEVAL] score = {score:.4f}")
        print(f"  [THRESHOLD] {score:.4f} {'>=' if passed else '<'} {effective_threshold:.4f}")

        if not passed:
            # Below Threshold -> REFUSAL (LLM NOT CALLED)
            print("  [DECISION] REFUSE")
            print("  [LLM] NOT CALLED")

            return {
                "answer": REFUSAL_MESSAGE,
                "source": None,
                "confidence": score,
                "evidence": None,
                "refused": True,
                "llm_called": False,
                "threshold_used": effective_threshold
            }

        # Step 3: Above Threshold -> ACCEPTED (Call Grounded LLM)
        print("  [DECISION] ACCEPT")
        print("  [LLM] CALLED")

        grounded_answer = generate_grounded_answer(q_clean, best_artifact)

        return {
            "answer": grounded_answer,
            "source": {
                "artifact": retrieval_result["artifact_name"],
                "gallery": retrieval_result["gallery"]
            },
            "confidence": score,
            "evidence": retrieval_result["evidence"],
            "refused": False,
            "llm_called": True,
            "threshold_used": effective_threshold
        }


# Global singleton helper
_pipeline_instance = None

def answer_question(question: str, threshold: float = None) -> Dict[str, Any]:
    """
    Convenience wrapper for Phase 2 pipeline execution.
    """
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = Phase2RAGPipeline()
    return _pipeline_instance.answer_question(question, override_threshold=threshold)
