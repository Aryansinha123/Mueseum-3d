"""
Relevance Threshold Gate (Phase 2 XAI Layer)

This module defines the decision boundary for gating LLM calls.
If a query's cosine retrieval similarity score is below the threshold,
the system rejects the query to prevent LLM hallucinations.

Research Note: The threshold represents cosine retrieval similarity,
not a calibrated statistical confidence probability.
"""

# Default relevance threshold (retrieval similarity boundary)
# Queries with similarity_score >= THRESHOLD are sent to the LLM.
# Queries with similarity_score < THRESHOLD are refused immediately.
RELEVANCE_THRESHOLD = 0.50


def is_relevant(similarity_score: float, threshold: float = None) -> bool:
    """
    Determines if a retrieval similarity score meets the relevance threshold.
    
    :param similarity_score: Cosine similarity score from Phase 1 retrieval
    :param threshold: Optional override for the relevance threshold
    :return: True if score >= threshold, False otherwise
    """
    if threshold is None:
        threshold = RELEVANCE_THRESHOLD
    return float(similarity_score) >= float(threshold)


def get_threshold() -> float:
    """Returns the current default relevance threshold."""
    return RELEVANCE_THRESHOLD
