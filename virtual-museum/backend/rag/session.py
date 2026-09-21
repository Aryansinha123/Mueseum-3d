"""
Session Management Module (Phase 3 Personalization)

Manages anonymous visitor session state in memory:
- Bounded conversation memory
- Engagement profile tracking

No database is used; sessions reside in memory for development/demo.
"""

import uuid
from typing import Dict, Any, Optional
from .memory import SessionMemory
from .profile import VisitorProfile


class SessionState:
    """
    Encapsulates all personalized state for a single visitor session.
    """

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.memory = SessionMemory(max_history=3)
        self.profile = VisitorProfile(session_id)


class SessionManager:
    """
    In-memory store managing active visitor sessions.
    """

    def __init__(self):
        self._sessions: Dict[str, SessionState] = {}

    def get_or_create_session(self, session_id: Optional[str] = None) -> SessionState:
        """
        Retrieves an existing session by ID or initializes a new session.
        Auto-generates UUID session_id if missing or invalid.
        """
        if not session_id or not isinstance(session_id, str) or not session_id.strip():
            session_id = str(uuid.uuid4())
        else:
            session_id = session_id.strip()

        if session_id not in self._sessions:
            self._sessions[session_id] = SessionState(session_id)
            print(f"[SESSION] Created new session ID: {session_id}")
        else:
            print(f"[SESSION] Loaded existing session ID: {session_id}")

        return self._sessions[session_id]

    def clear_session(self, session_id: str) -> bool:
        """Clears/removes a session from memory."""
        if session_id in self._sessions:
            del self._sessions[session_id]
            print(f"[SESSION] Cleared session ID: {session_id}")
            return True
        return False

    def list_active_sessions(self) -> Dict[str, Dict[str, Any]]:
        """Returns summary of all active in-memory sessions."""
        return {
            sid: state.profile.get_profile_dict()
            for sid, state in self._sessions.items()
        }


# Global singleton instance
_session_manager = SessionManager()

def get_session_manager() -> SessionManager:
    """Returns global SessionManager instance."""
    return _session_manager
