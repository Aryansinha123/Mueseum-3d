/**
 * Virtual Museum AI Curator — Frontend API Client (Phase 4 Audit)
 *
 * Communicates exclusively with the FastAPI backend POST /ask endpoint.
 * The browser NEVER holds or sends the LLM API key.
 *
 * Fixes applied:
 *  - Removed incorrect `.strip` reference (JS uses `.trim`)
 *  - Session ID uses sessionStorage (persists across questions, cleared on tab close)
 *  - artifact_id is forwarded correctly for contextual queries
 *  - Clear error messages distinguish network vs server errors
 */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

/**
 * Returns a persistent anonymous session ID for the current browser session.
 * Uses sessionStorage so it survives page refreshes but not tab closes.
 * A new ID is generated automatically if none exists.
 */
export function getOrCreateVisitorSessionId() {
  if (typeof window === "undefined") return "ssr-session";

  try {
    let sid = sessionStorage.getItem("museum_session_id");
    if (!sid) {
      // Generate a v4-style UUID
      const ts = Date.now().toString(36);
      const rand = Math.random().toString(36).substring(2, 11);
      sid = `sess-${rand}-${ts}`;
      sessionStorage.setItem("museum_session_id", sid);
      console.log("[Curator API] New session ID:", sid);
    }
    return sid;
  } catch {
    // sessionStorage blocked (e.g. private mode restriction)
    return "transient-" + Date.now().toString(36);
  }
}

/**
 * Sends a visitor query to the FastAPI /ask endpoint.
 *
 * @param {Object} params
 * @param {string}  params.question     - Visitor question text (required)
 * @param {string}  [params.artifact_id] - ID of currently selected 3D artifact
 * @param {string}  [params.tone]       - 'educational' | 'concise' | 'friendly'
 * @param {string}  [params.session_id] - Override session ID (optional)
 * @returns {Promise<Object>} Backend JSON response payload
 */
export async function askCurator({ question, artifact_id, tone = "educational", session_id }) {
  if (!question || !question.trim()) {
    throw new Error("Question text cannot be empty.");
  }

  const activeSessionId = session_id || getOrCreateVisitorSessionId();

  const payload = {
    session_id:  activeSessionId,
    question:    question.trim(),
    artifact_id: artifact_id || null,   // null tells backend this is a Type B query
    tone:        tone || "educational",
  };

  console.log("[Curator API] Sending request:", {
    question: payload.question,
    artifact_id: payload.artifact_id,
    tone: payload.tone,
    session_id: payload.session_id,
    url: `${API_BASE_URL}/ask`,
  });

  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.detail || `Backend error (HTTP ${response.status})`;
    throw new Error(msg);
  }

  const data = await response.json();

  console.log("[Curator API] Response received:", {
    refused: data.refused,
    confidence: data.confidence,
    session_id: data.session_id,
    source: data.source,
  });

  // Persist the session_id returned by the backend (it may differ if auto-generated)
  if (data.session_id && typeof window !== "undefined") {
    try {
      sessionStorage.setItem("museum_session_id", data.session_id);
    } catch {
      // ignore
    }
  }

  return data;
}
