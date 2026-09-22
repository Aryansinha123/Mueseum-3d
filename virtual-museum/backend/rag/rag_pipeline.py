"""
Phase 3 Personalization RAG Pipeline (Phase 4 Audit - Full Fix)

TWO QUERY TYPES:
  TYPE A - Artifact-Contextual (artifact_id supplied by frontend)
    Examples: "What is this?", "Tell me about this", "When was it created?"
    -> Use the explicitly selected artifact as context.
    -> Still ground in curated knowledge. LLM must not use outside knowledge.
    -> Bypass low-similarity gating for short contextual phrases (the word "this"
      has low cosine similarity to any artifact - that is expected behaviour).

  TYPE B - General Museum Query (no artifact_id, or artifact_id absent)
    Examples: "Tell me about dinosaurs", "Which artifacts are from Egypt?"
    -> Use Phase 1 cosine retrieval to find best-matching artifact.
    -> Apply full Phase 2 relevance threshold gate.

Complete flow:
  Request (question, session_id, artifact_id, tone)
    |
  Session Initialization / Retrieval
    |
  TYPE A: artifact_id supplied -> load artifact directly -> skip low-score gate
  TYPE B: no artifact_id    -> cosine retrieval  -> Phase 2 threshold gate
    | (both paths merge here if artifact found and accepted)
  Update Visitor Profile
  Load Conversation Memory
  Call Groq LLM with grounded artifact context
  Store Exchange in Memory
  Compute Vector Recommendations
  Return Response Payload
"""

from typing import Dict, Any, Optional, List
from .retrieval import ArtifactRetriever
from .confidence import is_relevant, RELEVANCE_THRESHOLD
from .llm import generate_grounded_answer, validate_tone
from .session import get_session_manager
from .recommendations import ArtifactRecommender
from .embeddings import ArtifactEmbeddingManager

REFUSAL_MESSAGE = "This information is not available in the curated museum knowledge base."

# Short contextual phrases that refer to the selected artifact rather than
# carrying semantic content about any specific domain. When artifact_id is
# supplied, these should never be refused due to low cosine similarity.
CONTEXTUAL_TRIGGER_PHRASES = {
    "what is this", "what is it", "tell me about this", "tell me about it",
    "what am i looking at", "explain this", "explain it", "what is this artifact",
    "tell me more", "tell me more about this", "tell me more about it",
    "what is this thing", "describe this", "describe it", "what does this do",
    "what does it do", "who made this", "who made it", "who created this",
    "who created it", "who designed this", "who designed it", "who built this",
    "who built it", "when was it made", "when was it created", "when was this made",
    "when was this created", "when was this built", "when was it built",
    "how old is this", "how old is it", "what is it made of", "what is this made of",
    "what material is this", "what material is it", "what materials were used",
    "what is this crafted from", "where is it from", "where does this come from",
    "where did it come from", "where was this found", "where was it found",
    "where was this made", "where was it made", "what period is this from",
    "what period is it from", "which period is this", "which era is this from",
    "what era is this", "what was it used for", "what was this used for",
    "what is it used for", "what is this used for", "why is it important",
    "why is this important", "why is it significant", "why is this significant",
    "why is this in the museum", "why is it in the museum", "what makes it special",
    "what makes this special", "tell me a fun fact", "tell me a fun fact about this",
    "tell me a fun fact about it", "who discovered it", "who discovered this",
    "how was it found", "how was this found", "how big is it", "how big is this",
    "how heavy is it", "how heavy is this", "what are its dimensions",
    "what are the dimensions", "what is its size", "what is its story",
    "tell me its story", "tell me its history", "tell me the history",
    "can you explain this exhibit", "tell me about this exhibit", "give me an overview",
    "tell me about this artifact", "tell me about this piece", "tell me about this object",
    "what is the significance of this", "what is the significance of it",
    "what is the history behind this", "what is the history behind it",
    "who used this", "who used it", "is this authentic", "is this real",
}

OUT_OF_SCOPE_KEYWORDS = {
    "weather", "forecast", "temperature", "rain", "snow", "math", "calculate",
    "multiply", "divide", "times", "plus", "minus", "stock", "stocks", "crypto",
    "bitcoin", "president", "prime minister", "election", "movie", "song", "lyrics",
    "recipe", "cook", "joke", "sports", "football", "basketball", "soccer", "cricket",
    "score", "flight", "hotel", "restaurant", "hospital", "doctor", "medicine",
    "symptom", "pizza", "burger", "coffee", "beer", "code", "python", "javascript",
    "programming", "translate", "currency", "dollar", "euro", "rupee", "salary",
    "job", "career",
}

ARTIFACT_ASPECT_KEYWORDS = {
    "this", "it", "its", "that", "these", "artifact", "exhibit", "piece",
    "object", "model", "sculpture", "fossil", "specimen", "collection", "museum",
}


def _is_contextual_phrase(question: str) -> bool:
    """Returns True if the question is a contextual reference to the currently selected artifact.
    Rejects questions containing clear out-of-scope domain keywords (e.g. weather, math, stocks)."""
    q = question.strip().lower().rstrip("?.!,:;")
    
    # 1. Exact match against known contextual trigger phrases
    if q in CONTEXTUAL_TRIGGER_PHRASES:
        return True
        
    words = set(q.split())
    
    # 2. Check for out-of-scope intrusion
    if words.intersection(OUT_OF_SCOPE_KEYWORDS):
        return False
        
    # 3. Check for demonstrative reference + question inquiry pattern
    has_artifact_ref = bool(words.intersection(ARTIFACT_ASPECT_KEYWORDS))
    if has_artifact_ref and len(words) <= 12:
        # Inquiry terms for artifact properties
        inquiry_terms = {
            "what", "who", "when", "where", "why", "how", "tell", "explain",
            "describe", "show", "is", "was", "are", "were", "made", "used", "created",
            "origin", "material", "history", "age", "period", "function", "significance",
            "dimensions", "size", "weight", "creator", "artist", "date", "found",
            "purpose", "meaning", "craft", "built", "designed", "about", "context"
        }
        if len(words.intersection(inquiry_terms)) >= 1:
            return True
            
    return False


class Phase3RAGPipeline:
    """
    Confidence-Aware, Personalized, Context-Aware RAG Pipeline.

    Handles both artifact-contextual (Type A) and general museum (Type B) queries.
    Integrates session memory, profile tracking, tone customization, and vector recommendations.
    """

    def __init__(self, threshold: float = RELEVANCE_THRESHOLD):
        self.manager = ArtifactEmbeddingManager()
        self.retriever = ArtifactRetriever(embedding_manager=self.manager)
        self.recommender = ArtifactRecommender(embedding_manager=self.manager)
        self.session_manager = get_session_manager()
        self.threshold = threshold

        # Build a lookup dict by artifact ID for O(1) access
        self._artifact_by_id: Dict[str, Dict] = {
            a["id"]: a for a in self.manager.artifacts
        }

    def _lookup_artifact(self, artifact_id: str) -> Optional[Dict]:
        """Returns artifact dict by ID, or None if not found."""
        return self._artifact_by_id.get(artifact_id.strip()) if artifact_id else None

    def answer_question(
        self,
        question: str,
        session_id: Optional[str] = None,
        tone: Optional[str] = "educational",
        artifact_id: Optional[str] = None,
        override_threshold: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Executes the full personalized RAG pipeline.

        :param question: Visitor question string
        :param session_id: Optional session identifier (auto-generated if missing)
        :param tone: Presentation style ('educational', 'concise', 'friendly')
        :param artifact_id: ID of currently selected artifact (enables Type A routing)
        :param override_threshold: Optional relevance threshold override
        :return: Structured JSON response payload
        """
        if not question or not question.strip():
            raise ValueError("Question string cannot be empty.")

        q_clean = question.strip()
        effective_threshold = override_threshold if override_threshold is not None else self.threshold
        valid_tone = validate_tone(tone)

        # 1. Manage session state
        session_state = self.session_manager.get_or_create_session(session_id)
        current_session_id = session_state.session_id

        print(f"\n[PIPELINE] -------------------------------------------")
        print(f"[PIPELINE] Session  : {current_session_id}")
        print(f"[PIPELINE] Tone     : {valid_tone}")
        print(f"[PIPELINE] Question : \"{q_clean}\"")
        print(f"[PIPELINE] Artifact ID supplied: {artifact_id or 'None (Type B query)'}")

        # -- TYPE A: Artifact-contextual query --------------------------------
        if artifact_id:
            selected_artifact = self._lookup_artifact(artifact_id)

            if selected_artifact:
                print(f"[PIPELINE] TYPE A  : Contextual artifact -> {selected_artifact['name']} ({artifact_id})")

                # Compute cosine score against selected artifact for transparency
                query_vec = self.manager.encode_query(q_clean)
                from .retrieval import cosine_similarity
                import numpy as np
                all_ids = [a["id"] for a in self.manager.artifacts]
                art_idx = all_ids.index(artifact_id)
                art_vec = self.manager.embeddings[art_idx:art_idx+1]
                score = float(cosine_similarity(query_vec, art_vec)[0])

                gallery_name = selected_artifact.get("galleryName", "Museum Collection")
                is_contextual = _is_contextual_phrase(q_clean)

                print(f"[PIPELINE] Similarity vs selected artifact: {score:.4f}")
                print(f"[PIPELINE] Contextual phrase detected: {is_contextual}")

                # For Type A: Accept if either the score passes threshold OR
                # the question is a short contextual phrase (refers to "this"/"it").
                # A question like "What is this?" has intrinsically low cosine
                # similarity - the referent is the selected artifact, not the text.
                passes_gate = is_relevant(score, threshold=effective_threshold) or is_contextual

                print(f"[PIPELINE] Gate result: {'ACCEPT' if passes_gate else 'REFUSE'}")

                if not passes_gate:
                    print("[PIPELINE] REFUSE - out-of-scope for selected artifact")
                    print("[PIPELINE] LLM: NOT CALLED")
                    return self._refusal_payload(score, current_session_id, valid_tone)

                # ACCEPTED - generate grounded answer from selected artifact
                return self._generate_accepted_response(
                    question=q_clean,
                    artifact=selected_artifact,
                    score=score,
                    gallery_name=gallery_name,
                    session_state=session_state,
                    session_id=current_session_id,
                    tone=valid_tone,
                )
            else:
                print(f"[PIPELINE] WARNING - artifact_id '{artifact_id}' not found in knowledge base. Falling back to Type B.")

        # -- TYPE B: General museum query (cosine retrieval) ------------------
        print(f"[PIPELINE] TYPE B  : General semantic retrieval")
        retrieval_result = self.retriever.retrieve(q_clean)
        artifact_id_found = retrieval_result["artifact_id"]
        best_artifact = self._artifact_by_id.get(artifact_id_found)
        score = retrieval_result["similarity_score"]
        gallery_name = retrieval_result["gallery"]

        print(f"[RETRIEVAL] Best match : {retrieval_result['artifact_name']} ({artifact_id_found})")
        print(f"[RETRIEVAL] Similarity : {score:.4f}")
        print(f"[RETRIEVAL] Threshold  : {effective_threshold:.4f}")

        passes_gate = is_relevant(score, threshold=effective_threshold)
        print(f"[PIPELINE] Gate result: {'ACCEPT' if passes_gate else 'REFUSE'}")

        if not passes_gate:
            print("[PIPELINE] REFUSE - below relevance threshold")
            print("[PIPELINE] LLM: NOT CALLED")
            return self._refusal_payload(score, current_session_id, valid_tone)

        return self._generate_accepted_response(
            question=q_clean,
            artifact=best_artifact,
            score=score,
            gallery_name=gallery_name,
            session_state=session_state,
            session_id=current_session_id,
            tone=valid_tone,
        )

    def _refusal_payload(self, score: float, session_id: str, tone: str) -> Dict[str, Any]:
        """Standard refusal payload. LLM is NOT called."""
        return {
            "answer": REFUSAL_MESSAGE,
            "source": None,
            "confidence": round(score, 4),
            "evidence": None,
            "refused": True,
            "llm_called": False,
            "session_id": session_id,
            "tone": tone,
            "related_suggestions": [],
        }

    def _generate_accepted_response(
        self,
        question: str,
        artifact: Dict,
        score: float,
        gallery_name: str,
        session_state,
        session_id: str,
        tone: str,
    ) -> Dict[str, Any]:
        """Calls LLM with grounded artifact context and assembles the full response."""
        artifact_id = artifact.get("id", "UNKNOWN")

        # Update visitor profile
        session_state.profile.track_question()
        session_state.profile.track_artifact(artifact_id)
        session_state.profile.track_gallery(gallery_name)

        # Load bounded conversation memory
        history_text = session_state.memory.format_history_for_prompt()
        print(f"[MEMORY] Loaded {len(session_state.memory.history)} prior exchange(s)")

        # Call grounded LLM
        print("[PIPELINE] LLM: CALLED")
        grounded_answer = generate_grounded_answer(
            question=question,
            artifact=artifact,
            history_text=history_text,
            tone=tone,
        )

        # Store exchange in memory
        session_state.memory.add_exchange(question, grounded_answer)

        # Build evidence text
        evidence_text = self.manager.build_corpus_text(artifact)

        # Compute "You Might Also Like" recommendations
        seen_artifacts = session_state.profile.artifacts_seen
        suggestions = self.recommender.get_recommendations(
            current_artifact_id=artifact_id,
            seen_artifact_ids=seen_artifacts,
            top_k=3,
        )

        return {
            "answer": grounded_answer,
            "source": {
                "artifact": artifact.get("name", "Unknown Artifact"),
                "gallery": gallery_name,
            },
            "confidence": round(score, 4),
            "evidence": evidence_text,
            "refused": False,
            "llm_called": True,
            "session_id": session_id,
            "tone": tone,
            "related_suggestions": suggestions,
        }


# -- Global singleton ----------------------------------------------------------

_phase3_pipeline: Optional[Phase3RAGPipeline] = None


def answer_question(
    question: str,
    session_id: Optional[str] = None,
    tone: Optional[str] = "educational",
    artifact_id: Optional[str] = None,
    threshold: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Convenience wrapper for Phase 3 pipeline execution.

    Usage:
        result = answer_question("What is this?", artifact_id="ART001")
    """
    global _phase3_pipeline
    if _phase3_pipeline is None:
        _phase3_pipeline = Phase3RAGPipeline()
    return _phase3_pipeline.answer_question(
        question=question,
        session_id=session_id,
        tone=tone,
        artifact_id=artifact_id,
        override_threshold=threshold,
    )
