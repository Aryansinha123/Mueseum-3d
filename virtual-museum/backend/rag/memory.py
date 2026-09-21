"""
Conversation Memory Module (Phase 3 Personalization)

Manages short-term dialogue memory per session.
Stores a sliding window of the last 2-3 exchanges (user question + assistant answer).

Memory is used solely for resolving contextual pronouns (e.g. "it", "that exhibit").
It is NOT a source of factual knowledge.
"""

from typing import List, Dict, Any

MAX_HISTORY_EXCHANGES = 3


class SessionMemory:
    """
    Manages bounded short-term conversation history for a visitor session.
    """

    def __init__(self, max_history: int = MAX_HISTORY_EXCHANGES):
        self.max_history = max_history
        self.history: List[Dict[str, str]] = []

    def add_exchange(self, user_question: str, assistant_answer: str):
        """
        Appends a user/assistant exchange to session memory.
        Enforces maximum sliding window constraint.
        """
        self.history.append({
            "user": user_question.strip(),
            "assistant": assistant_answer.strip()
        })
        # Bounded sliding window
        if len(self.history) > self.max_history:
            self.history = self.history[-self.max_history:]

    def get_recent_history(self) -> List[Dict[str, str]]:
        """Returns the list of recent dialogue exchanges."""
        return self.history

    def format_history_for_prompt(self) -> str:
        """
        Formats history list into readable text string for LLM prompt context.
        """
        if not self.history:
            return "None (First interaction in this session)"

        formatted = []
        for idx, turn in enumerate(self.history, start=1):
            formatted.append(f"Turn {idx}:")
            formatted.append(f"  Visitor  : {turn['user']}")
            formatted.append(f"  Curator  : {turn['assistant']}")

        return "\n".join(formatted)

    def clear(self):
        """Clears memory history."""
        self.history.clear()
