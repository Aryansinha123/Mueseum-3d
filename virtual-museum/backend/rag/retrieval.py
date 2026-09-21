"""
Artifact Retrieval System (Phase 1 RAG Core)

This module provides vector similarity search against the museum knowledge base.
It computes manual cosine similarity between a user question embedding and
all artifact embeddings stored in memory.

Phase 1 retrieves the best-matching artifact independently without any LLM call.
"""

import numpy as np
from typing import Dict, Any, List
from .embeddings import ArtifactEmbeddingManager


def cosine_similarity(query_vec: np.ndarray, doc_matrices: np.ndarray) -> np.ndarray:
    """
    Computes manual cosine similarity between a 1D query vector and a 2D matrix of document vectors.
    
    Formula:
        sim(q, d) = (q . d) / (||q|| * ||d||)
        
    :param query_vec: 1D NumPy vector of shape (D,)
    :param doc_matrices: 2D NumPy matrix of shape (N, D)
    :return: 1D NumPy array of similarity scores of shape (N,)
    """
    # Norm of query vector
    query_norm = np.linalg.norm(query_vec)
    if query_norm == 0:
        return np.zeros(doc_matrices.shape[0], dtype=np.float32)

    # Norms of document vectors along rows
    doc_norms = np.linalg.norm(doc_matrices, axis=1)
    # Avoid division by zero
    doc_norms = np.where(doc_norms == 0, 1e-9, doc_norms)

    # Dot product of query against all document vectors
    dot_products = np.dot(doc_matrices, query_vec)

    # Cosine similarity scores
    scores = dot_products / (query_norm * doc_norms)
    return scores


class ArtifactRetriever:
    """
    Retriever class encapsulating query encoding, vector search, and result formatting.
    """

    def __init__(self, embedding_manager: ArtifactEmbeddingManager = None):
        """
        Initialize the retriever with an ArtifactEmbeddingManager instance.
        """
        if embedding_manager is None:
            embedding_manager = ArtifactEmbeddingManager()
        self.manager = embedding_manager

    def retrieve(self, question: str) -> Dict[str, Any]:
        """
        Retrieves the top-matching museum artifact for a given text question.
        
        :param question: User question string
        :return: Dictionary containing retrieval details and similarity score
        """
        if not question or not question.strip():
            raise ValueError("Question string cannot be empty.")

        # 1. Embed user query into vector space
        query_vec = self.manager.encode_query(question.strip())

        # 2. Calculate cosine similarity against all artifact embeddings
        scores = cosine_similarity(query_vec, self.manager.embeddings)

        # 3. Identify best matching artifact index
        top_idx = int(np.argmax(scores))
        best_score = float(scores[top_idx])
        best_artifact = self.manager.artifacts[top_idx]

        # 4. Construct evidence text snippet
        evidence_text = self.manager.build_corpus_text(best_artifact)

        # 5. Format standard Phase 1 output payload
        result = {
            "artifact_id": best_artifact.get("id", "UNKNOWN"),
            "artifact_name": best_artifact.get("name", "Unknown Artifact"),
            "gallery": best_artifact.get("galleryName", "General Collection"),
            "similarity_score": round(best_score, 4),
            "description": best_artifact.get("description", ""),
            "evidence": evidence_text
        }

        return result

    def retrieve_top_k(self, question: str, k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves top-K matching artifacts for broader retrieval tasks.
        
        :param question: User question string
        :param k: Number of top results to return
        :return: List of artifact retrieval payload dictionaries
        """
        query_vec = self.manager.encode_query(question.strip())
        scores = cosine_similarity(query_vec, self.manager.embeddings)

        # Rank indices in descending order of similarity score
        top_indices = np.argsort(scores)[::-1][:k]

        results = []
        for idx in top_indices:
            art = self.manager.artifacts[idx]
            results.append({
                "artifact_id": art.get("id"),
                "artifact_name": art.get("name"),
                "gallery": art.get("galleryName"),
                "similarity_score": round(float(scores[idx]), 4),
                "description": art.get("description"),
                "evidence": self.manager.build_corpus_text(art)
            })

        return results


# Global singleton instance for quick function-style access
_default_retriever = None

def retrieve(question: str) -> Dict[str, Any]:
    """
    Convenience function for direct retrieval.
    Usage: result = retrieve("Who sculpted the Old Arrow Maker?")
    """
    global _default_retriever
    if _default_retriever is None:
        _default_retriever = ArtifactRetriever()
    return _default_retriever.retrieve(question)
