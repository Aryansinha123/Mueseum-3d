# 🏛️ Virtual Museum RAG Core, XAI Layer & Personalization — Backend

This directory contains the **Phase 1 RAG Core**, **Phase 2 Explainable RAG (XAI)**, and **Phase 3 Personalization Layer** backend for the **Virtual Museum AR/VR Experience**.

The system enables personalized, session-aware AI Curator responses while strictly preserving pre-LLM threshold gating and evidence grounding.

---

## 🎯 System Architecture

```text
REQUEST (question, session_id, tone)
      │
      ▼
SESSION INITIALIZATION (SessionManager / Memory / Profile)
      │
      ▼
EMBED QUESTION (SentenceTransformer: all-MiniLM-L6-v2)
      │
      ▼
MANUAL COSINE SIMILARITY (NumPy vs 15 Artifact Vectors)
      │
      ▼
BEST MATCHING ARTIFACT + RELEVANCE SCORE
      │
      ▼
┌───────────────────────────────────────────────┐
│ relevance_score >= RELEVANCE_THRESHOLD (0.50)? │
└───────────────────────┬───────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
       YES                            NO
         │                             │
         ▼                             ▼
   [LLM: CALLED]                 [LLM: NOT CALLED]
- Update Profile Analytics     Return Fixed Refusal Payload:
- Format Dialogue Memory       "This information is not available
  (Last 2-3 turns)              in the curated museum knowledge base."
- Call Grounded Groq API               │
  with Tone Directive                  ▼
- Store Exchange in Memory     { Answer, Source: null,
- Compute Vector Recs            Score, Evidence: null,
         │                       Refused: true,
         ▼                       Session_id, Tone }
 { Answer, Source,
   Score, Evidence,
   Refused: false,
   Session_id, Tone,
   Related_suggestions }
```

---

## 🛠️ Personalization Features (Phase 3)

### 1. Anonymous Session Management (`rag/session.py`)
- Auto-generates UUID session identifiers (`session_id`).
- Maintains in-memory session state (bounded memory + profile metrics).
- *Storage Note*: Session state is stored in-memory for development/demo and clears on backend restart.

### 2. Bounded Dialogue Memory (`rag/memory.py`)
- Maintains a sliding window of the **last 2–3 exchanges** (`MAX_HISTORY = 3`).
- Enables natural follow-up pronoun resolution (e.g. *"When was it created?"*).
- *Strict Rule*: Memory provides dialogue context only; facts are strictly grounded in retrieved evidence.

### 3. Visitor Profile & Analytics (`rag/profile.py`)
- Tracks anonymous interaction metrics: total questions, gallery frequency, and engaged artifact IDs.
- *Privacy*: Zero personally identifiable information (PII) is collected or stored.

### 4. Presentation Tone Toggles (`rag/llm.py`)
- Supported styles:
  - `educational` (Default): Scholarly, analytical, and informative.
  - `concise`: Brief, direct, key facts only (2–3 sentences max).
  - `friendly`: Warm, engaging, and welcoming guide style.
- *Factual Safety*: Tone alters presentation formatting only; factual evidence rules are untouched.

### 5. Vector Recommendations — "You Might Also Like" (`rag/recommendations.py`)
- Computes pairwise vector similarity across artifact embeddings.
- Automatically excludes current artifact and already-seen artifacts in the session.
- Returns top 1–3 related artifact cards with similarity scores.

---

## 🚀 Running Test Suites

### Phase 1 Test (Standalone Vector Retrieval)
```bash
python -m rag.test_retrieval
```

### Phase 2 Test (Confidence Gate & Grounding)
```bash
python -m rag.test_phase2
```

### Phase 3 Test (Personalization, Memory, Tone, Profile & Recommendations)
```bash
python -m rag.test_phase3
```

---

## 📊 Example Phase 3 Payload

```json
{
  "answer": "The Apollo 11 Command Module, 'Columbia,' served as the living quarters for Neil Armstrong, Buzz Aldrin, and Michael Collins during the historic July 1969 lunar landing mission...",
  "source": {
    "artifact": "Apollo 11 Command Module \"Columbia\"",
    "gallery": "Space (Gallery 2: Smithsonian Technology & Science Hall)"
  },
  "confidence": 0.6743,
  "evidence": "Apollo 11 Command Module \"Columbia\". Gallery: Space...",
  "refused": false,
  "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "tone": "educational",
  "related_suggestions": [
    {
      "artifact_id": "ART007",
      "artifact_name": "Space Shuttle Discovery",
      "gallery": "Space (Gallery 2: Smithsonian Technology & Science Hall)",
      "similarity": 0.7412
    }
  ]
}
```

---

## 🚫 Non-Goals & Phase 4 Boundary

- ❌ No frontend modifications (Next.js / WebXR code remains completely untouched).
- ❌ No database overhead (all session state is held in-memory).
- ❌ Phase 4 will connect this completed backend to the Next.js frontend via FastAPI `/ask`.
