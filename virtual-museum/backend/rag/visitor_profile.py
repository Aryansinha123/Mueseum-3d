"""
Visitor Engagement Profile Tracking Module (Phase 3 Personalization)

Tracks anonymous interaction telemetry per session:
- Total questions asked
- Unique artifacts engaged/seen
- Interaction frequency per gallery

Strict Privacy Guarantee: No PII (names, emails, IPs, locations) is stored.
"""

from typing import Dict, List, Any
import time


class VisitorProfile:
    """
    Tracks anonymous visitor interaction metrics for a given session.
    """

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.questions_asked: int = 0
        self.galleries: Dict[str, int] = {}
        self.artifacts_seen: List[str] = []
        self.last_interaction_time: float = time.time()

    def track_question(self):
        """Increments total questions asked counter."""
        self.questions_asked += 1
        self.last_interaction_time = time.time()

    def track_artifact(self, artifact_id: str):
        """Records an artifact as seen/engaged by the visitor."""
        if artifact_id and artifact_id not in self.artifacts_seen:
            self.artifacts_seen.append(artifact_id)
        self.last_interaction_time = time.time()

    def track_gallery(self, gallery_name: str):
        """Increments engagement count for a specific gallery."""
        if gallery_name:
            self.galleries[gallery_name] = self.galleries.get(gallery_name, 0) + 1
        self.last_interaction_time = time.time()

    def get_profile_dict(self) -> Dict[str, Any]:
        """Returns structured profile analytics dictionary."""
        return {
            "session_id": self.session_id,
            "questions_asked": self.questions_asked,
            "galleries": dict(self.galleries),
            "artifacts_seen": list(self.artifacts_seen),
            "last_interaction": self.last_interaction_time
        }
