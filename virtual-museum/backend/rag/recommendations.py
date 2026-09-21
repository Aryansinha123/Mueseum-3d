"""
"You Might Also Like" Artifact Recommendation Engine (Phase 3 Personalization)

Computes vector similarity across artifact embeddings using Phase 1 SentenceTransformer vectors.

Filtering Rules:
1. Exclude the current artifact.
2. Exclude artifacts already seen/engaged in the active session.
3. Return top 1-3 most similar unseen museum artifacts.

Pure vector similarity calculation — no LLM generation involved.
"""

from typing import List, Dict, Any
import numpy as np
from .retrieval import cosine_similarity
from .embeddings import ArtifactEmbeddingManager


class ArtifactRecommender:
    """
    Generates personalized exhibit recommendations based on vector similarity.
    """

    def __init__(self, embedding_manager: ArtifactEmbeddingManager = None):
        if embedding_manager is None:
            embedding_manager = ArtifactEmbeddingManager()
        self.manager = embedding_manager

    def get_recommendations(
        self,
        current_artifact_id: str,
        seen_artifact_ids: List[str] = None,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Generates top-K recommended artifacts excluding current & seen items.
        
        :param current_artifact_id: Artifact ID currently being discussed
        :param seen_artifact_ids: List of artifact IDs already engaged in this session
        :param top_k: Maximum recommendations to return (default 3)
        :return: List of recommendation payload dicts
        """
        if seen_artifact_ids is None:
            seen_artifact_ids = []

        all_artifacts = self.manager.artifacts
        all_ids = [a["id"] for a in all_artifacts]

        # Locate current artifact index
        if current_artifact_id not in all_ids:
            return []

        curr_idx = all_ids.index(current_artifact_id)
        curr_vec = self.manager.embeddings[curr_idx]

        # Calculate cosine similarity against all artifact embeddings
        scores = cosine_similarity(curr_vec, self.manager.embeddings)

        # Build list of exclusion IDs
        exclusion_set = set(seen_artifact_ids)
        exclusion_set.add(current_artifact_id)

        # Rank candidates by descending similarity score
        sorted_indices = np.argsort(scores)[::-1]

        recommendations = []
        for idx in sorted_indices:
            candidate = all_artifacts[idx]
            candidate_id = candidate["id"]

            # Filter out excluded artifacts
            if candidate_id in exclusion_set:
                continue

            recommendations.append({
                "artifact_id": candidate_id,
                "artifact_name": candidate.get("name", "Unknown"),
                "gallery": candidate.get("galleryName", "General Collection"),
                "similarity": round(float(scores[idx]), 4)
            })

            if len(recommendations) >= top_k:
                break

        print(f"[RECOMMENDATIONS] Generated {len(recommendations)} related exhibit suggestions")
        return recommendations
