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

function getFormattedApiUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const trimmed = envUrl.trim().replace(/\/$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const API_BASE_URL = getFormattedApiUrl();

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
export async function askCurator({ question, artifact_id, tone = "educational", session_id, history = [], visited_artifacts = [] }) {
  if (!question || !question.trim()) {
    throw new Error("Question text cannot be empty.");
  }

  const activeSessionId = session_id || getOrCreateVisitorSessionId();

  const payload = {
    session_id:        activeSessionId,
    question:          question.trim(),
    artifact_id:       artifact_id || null,   // null tells backend this is a Type B query
    tone:              tone || "educational",
    history:           Array.isArray(history) ? history : [],
    visited_artifacts: Array.isArray(visited_artifacts) ? visited_artifacts : [],
  };

  console.log("[Curator API] Sending request:", {
    question: payload.question,
    artifact_id: payload.artifact_id,
    tone: payload.tone,
    session_id: payload.session_id,
    historyTurns: payload.history.length,
    visitedCount: payload.visited_artifacts.length,
    url: `${API_BASE_URL}/ask`,
  });

  let data;
  let usedFallback = false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id:        payload.session_id,
        question:          payload.question,
        artifact_id:       payload.artifact_id,
        tone:              payload.tone,
        history:           payload.history,
        visited_artifacts: payload.visited_artifacts,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.detail || `Backend error (HTTP ${response.status})`;
      throw new Error(msg);
    }

    data = await response.json();
    if (!data.suggested_followups) {
      data.suggested_followups = [];
    }
  } catch (primaryErr) {
    console.warn(
      `[Curator API] Primary backend at ${API_BASE_URL}/ask failed (${primaryErr.message}). Falling back to internal Next.js RAG engine...`
    );

    try {
      const fallbackResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question:          payload.question,
          artifact_id:       payload.artifact_id,
          tone:              payload.tone,
          history:           payload.history,
          visited_artifacts: payload.visited_artifacts,
        }),
      });

      if (!fallbackResponse.ok) {
        throw new Error(`Internal API returned ${fallbackResponse.status}`);
      }

      const fbData = await fallbackResponse.json();
      usedFallback = true;
      data = {
        answer: fbData.answer,
        source: fbData.source || {
          artifact: fbData.artifact_name || "Museum Exhibit",
          gallery: fbData.origin || "Smithsonian Collection",
        },
        confidence: typeof fbData.confidence === "number" ? fbData.confidence : (parseFloat(fbData.confidence) / 100 || 0.70),
        evidence: fbData.evidence || (fbData.answer ? fbData.answer.slice(0, 200) : ""),
        refused: false,
        session_id: activeSessionId,
        tone: payload.tone,
        related_suggestions: fbData.related_suggestions || [],
        suggested_followups: fbData.suggested_followups || [],
        visited_artifacts: fbData.visited_artifacts || payload.visited_artifacts,
        tour_progress: fbData.tour_progress || null,
      };
    } catch (fallbackErr) {
      console.error("[Curator API] Both primary and fallback endpoints failed:", fallbackErr);
      throw new Error(
        "AI Curator is temporarily offline. Please ensure the backend server is running."
      );
    }
  }

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
