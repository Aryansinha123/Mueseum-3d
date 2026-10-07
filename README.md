# 🏛️ Virtual Museum — AR/VR Experience with XAI RAG Curator

**A web-based immersive 3D virtual museum powered by a context-aware, explainable AI curator using Retrieval-Augmented Generation (RAG), confidence-gated responses, and WebXR-based Augmented Reality.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-000000?style=flat-square&logo=three.js)](https://threejs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)](https://python.org)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)](https://mueseum-3d.vercel.app)
[![Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=flat-square&logo=railway)](https://railway.app)

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Environment Variables](#environment-variables)
- [AI Curator — RAG Pipeline](#-ai-curator--rag-pipeline)
- [AR/VR Experience](#-arvr-experience)
- [Exhibit Catalog](#-exhibit-catalog)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Authors](#-authors)

---

## 🎯 About the Project

The **Virtual Museum AR/VR Experience** is a full-stack, research-grade interactive platform that combines immersive 3D museum exploration with a state-of-the-art AI guide. Visitors can walk through a procedurally architected 3D museum, inspect historical artifacts, and converse with an AI Curator that answers questions through a grounded, explainable pipeline.

The AI Curator is not a vanilla LLM chatbot. It is built on a **Retrieval-Augmented Generation (RAG)** pipeline with:
- **Cosine-similarity vector retrieval** using `SentenceTransformers` (`all-MiniLM-L6-v2`) and NumPy
- **Pre-LLM confidence gating** — responses below a `0.50` cosine relevance threshold are refused immediately, preventing hallucinations
- **Explainable AI (XAI) layer** — every answer returns the source artifact, gallery, evidence snippet, and numeric confidence score
- **Session-scoped dialogue memory** — a bounded 3-turn sliding window enables follow-up pronoun resolution (e.g. *"When was it created?"*)
- **Personalized tone modes** — educational, concise, and friendly curator styles

On the visual side, the museum features real-time WebGL rendering with **React Three Fiber**, automatic GLB model scaling, first-person walking controls, and a full **WebXR AR mode** for placing artifacts in physical space via mobile browsers.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| 🖥️ Frontend (Vercel) | [mueseum-3d.vercel.app](https://mueseum-3d.vercel.app) |
| ⚙️ Backend API | Deployed on Railway |

---

## ✨ Key Features

### 🏗️ 3D Museum Environment
- **Central Rotunda Lobby** connecting three themed gallery wings
- **Gallery 1 — Classical Antiquities**: Prehistoric & classical artifacts
- **Gallery 2 — Medieval & Epigraphic Treasures**: Regalia & cuneiform tablets
- **Gallery 3 — Ancient Wonders Hall**: Monumental exhibits
- Polished marble floors, archways, ambient fog, warm track lights & overhead spotlights

### 🎮 Dual-Mode Navigation
- **First-Person Walking Mode**: WASD + Arrow keys with mouse-look via `PointerLockControls` and spatial collision boundaries
- **Orbit Inspect Mode**: Smooth camera transition to selected artifact with full 360° rotation & zoom
- **Interactive 2D Map**: Floorplan overlay with live visitor position and one-click teleportation

### 🤖 AI Curator (RAG + XAI)
- Retrieval-grounded answers strictly from the curated artifact knowledge base
- Confidence-threshold gating (≥ 0.50) prevents unsupported LLM generation
- XAI response payload: `answer`, `source`, `confidence`, `evidence`, `refused`, `related_suggestions`
- Three tone modes: `educational` · `concise` · `friendly`
- Sliding-window conversation memory (last 3 turns) for multi-turn dialogue
- Artifact-aware context: understands *"What is this?"* when an artifact is selected in the 3D scene
- Vector-based "You Might Also Like" recommendations across the 15-artifact knowledge base

### 🥽 WebXR Augmented Reality
- Tap-to-place artifact in physical space via mobile browser (no app required)
- Real-world surface detection (hit-testing) & 6DoF spatial tracking
- DOM overlay controls (scale slider, rotation, exit) over passthrough camera feed
- Real-world scale & rotation controls (`0.1×` to `3.0×`)

### 🖼️ Artifact Management Pipeline
- Centralized metadata store (`src/data/artifacts.js`)
- Auto-scaling normalizer (`AutoFitModel.jsx`) — normalizes any GLB to ~0.65 m pedestal height using `Box3` bounding-box calculations
- Procedural glowing 3D placeholder fallback for missing GLB files (zero crash risk)

### 🪟 Glassmorphic HUD & UI
- Live zone indicator, mode toggle, map button & camera reset
- Slide-over exhibit detail drawer with period, origin, institution, license link & AI Curator tab
- Controls overlay guide modal

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VISITOR / BROWSER                       │
│         (Next.js 16 · React Three Fiber · WebXR)           │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP POST /ask
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Python)                    │
│                                                             │
│  1. Session Initialization  (UUID · Memory · Profile)       │
│  2. Embed Question          (SentenceTransformer MiniLM)    │
│  3. Cosine Retrieval        (NumPy · 15 Artifact Vectors)   │
│  4. Confidence Gate ────────── score < 0.50 → REFUSE        │
│                    └────────── score ≥ 0.50 → CONTINUE      │
│  5. Context Assembly        (Artifact KB · Dialogue Memory) │
│  6. Groq LLM Call           (Grounded · Tone-directed)      │
│  7. XAI Layer               (Evidence · Source · Score)     │
│  8. Recommendations         (Vector Similarity · Top-3)     │
│  9. Session Update          (Memory · Visitor Profile)      │
└──────────────────────────┬──────────────────────────────────┘
                           │  JSON Response
                           ▼
            { answer, source, confidence,
              evidence, refused, session_id,
              tone, related_suggestions }
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| **Next.js** (App Router) | `16.3.1` | Full-stack React framework, SSR, routing, asset optimization |
| **React** | `19.2.8` | Declarative UI, state management, component composition |
| **Three.js** | `^0.185.1` | WebGL 3D engine, scene graph, PBR materials, GLTF parsing |
| **React Three Fiber** | `^9.7.0` | React reconciler for Three.js |
| **React Three Drei** | `^10.7.8` | `useGLTF`, `OrbitControls`, `Html`, `Environment` helpers |
| **@react-three/xr** | `^6.6.30` | WebXR session management, hit-testing, AR placement |
| **Tailwind CSS** | `^4.0` | Glassmorphic UI panels, dark mode, responsive layout |
| **Lucide React** | `^1.33.0` | SVG icon set for HUD & controls |

### Backend

| Technology | Version | Role |
|---|---|---|
| **FastAPI** | Latest | REST API server, Pydantic v2 validation, CORS |
| **Uvicorn** | Latest | ASGI production server |
| **SentenceTransformers** | Latest | `all-MiniLM-L6-v2` embedding model |
| **NumPy** | Latest | Cosine similarity computation against artifact vectors |
| **Groq SDK** | Latest | LLM inference (Groq-hosted model) |
| **Python-dotenv** | Latest | Environment variable management |
| **Pydantic v2** | Latest | Request/Response schema validation |

---

## 📁 Project Structure

```
Museuem ARVR/
├── virtual-museum/                  # Main application root
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages & layouts
│   │   ├── components/
│   │   │   ├── ar/
│   │   │   │   ├── ARScene.jsx          # WebXR AR scene & placement logic
│   │   │   │   ├── ARArtifact.jsx       # AR artifact renderer
│   │   │   │   └── ARPlacementIndicator.jsx  # Surface reticle
│   │   │   ├── museum/
│   │   │   │   ├── Museum.jsx           # 3D walkthrough scene
│   │   │   │   └── ArtifactModel.jsx    # GLB loader & pedestal display
│   │   │   ├── artifacts/
│   │   │   │   ├── AutoFitModel.jsx     # Bounding-box auto-scaler
│   │   │   │   └── ArtifactPlaceholder.jsx  # Fallback placeholder renderer
│   │   │   ├── curator/
│   │   │   │   └── AICuratorPanel.jsx   # AI Curator chat panel
│   │   │   ├── ui/
│   │   │   │   ├── MuseumHUD.jsx        # Header HUD & mode toggle
│   │   │   │   ├── ArtifactInfo.jsx     # Exhibit detail slide-over drawer
│   │   │   │   ├── MuseumMap.jsx        # 2D floorplan & teleportation
│   │   │   │   ├── ControlsOverlay.jsx  # Keyboard/mouse guide modal
│   │   │   │   └── LoadingScreen.jsx    # 3D asset preloader
│   │   │   └── controls/                # PointerLock & OrbitControls wrappers
│   │   ├── data/
│   │   │   └── artifacts.js             # Centralized exhibit metadata store
│   │   ├── hooks/                       # Custom React hooks
│   │   └── utils/
│   │       └── xrStore.js               # WebXR session store configuration
│   ├── public/
│   │   └── models/artifacts/            # GLB/GLTF 3D exhibit model files
│   ├── backend/
│   │   ├── main.py                      # FastAPI application & /ask endpoint
│   │   ├── artifacts.json               # Full 15-artifact curator knowledge base
│   │   ├── requirements.txt
│   │   ├── Procfile                     # Railway process definition
│   │   └── rag/
│   │       ├── rag_pipeline.py          # End-to-end RAG orchestration
│   │       ├── embeddings.py            # Artifact embedding management
│   │       ├── retrieval.py             # Cosine similarity retrieval
│   │       ├── confidence.py            # Relevance threshold gate (0.50)
│   │       ├── llm.py                   # Groq LLM calls & tone directives
│   │       ├── memory.py                # Sliding-window dialogue memory
│   │       ├── session.py               # UUID session management
│   │       ├── visitor_profile.py       # Anonymous analytics & visit tracking
│   │       └── recommendations.py      # Vector-based artifact recommendations
│   ├── package.json
│   └── next.config.mjs
├── DOCS/
│   └── paper.txt                        # Research paper brief & guidelines
├── progress.txt                         # Phase completion log
├── Procfile                             # Top-level Railway process file
└── railway.json                         # Railway deployment configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **pip** or **pip3**
- A **Groq API key** (free at [console.groq.com](https://console.groq.com))

---

### Frontend Setup

```bash
# Navigate to the application root
cd virtual-museum

# Install Node dependencies
npm install

# Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Backend Setup

```bash
# Navigate to the backend directory
cd virtual-museum/backend

# Create and activate a Python virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI development server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).
Interactive Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)

Alternatively, from `virtual-museum/` you can start the backend via the npm script:

```bash
npm run backend
```

---

### Environment Variables

#### Frontend — `virtual-museum/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Backend — `virtual-museum/backend/.env`

```env
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:3000
```

---

## 🤖 AI Curator — RAG Pipeline

The AI Curator backend implements a four-phase pipeline:

### Phase 1 — Vector Retrieval

All 15 artifacts in `artifacts.json` are pre-embedded using `SentenceTransformers` (`all-MiniLM-L6-v2`). The visitor's question is embedded at query time and cosine similarity is computed manually using NumPy:

```
sim(q, d) = (q · d) / (‖q‖ · ‖d‖)
```

The highest-scoring artifact becomes the retrieval candidate.

### Phase 2 — Confidence Gating (XAI)

```
relevance_score < 0.50  →  LLM is NEVER called · structured refusal returned
relevance_score ≥ 0.50  →  pipeline continues to LLM
```

This pre-LLM gate is the core hallucination prevention mechanism. Every response exposes the numeric confidence score to the visitor.

### Phase 3 — Personalization

| Module | File | Description |
|---|---|---|
| Dialogue Memory | `memory.py` | Bounded 3-turn sliding window for pronoun resolution |
| Visitor Profile | `visitor_profile.py` | Anonymous session analytics (no PII) |
| Tone Directives | `llm.py` | `educational` · `concise` · `friendly` |
| Recommendations | `recommendations.py` | Pairwise vector similarity across all artifacts |

### Phase 4 — Frontend Integration

The `/ask` endpoint connects the completed Phase 1–3 pipeline to `AICuratorPanel.jsx`. Two query types are handled:

| Type | Trigger | Retrieval Strategy |
|---|---|---|
| **Artifact-Contextual** | `artifact_id` supplied by frontend | Load artifact directly · skip low-score gate |
| **General Museum Query** | No `artifact_id` | Cosine retrieval · full Phase 2 gate |

### Running Test Suites

```bash
# Phase 1 — Standalone Vector Retrieval
python -m rag.test_retrieval

# Phase 2 — Confidence Gate & Grounding
python -m rag.test_phase2

# Phase 3 — Personalization, Memory, Tone & Recommendations
python -m rag.test_phase3
```

---

## 🥽 AR/VR Experience

The project uses the **W3C WebXR Device API** for markerless, no-install AR directly in mobile browsers.

### WebXR Configuration (`utils/xrStore.js`)

```javascript
export const xrStore = createXRStore({
  hitTest: true,      // Real-world surface raycasting
  domOverlay: true,   // HTML controls over passthrough camera
  depthSensing: false // Disabled to conserve mobile GPU/battery
});
```

### AR Features

| Feature | Implementation |
|---|---|
| Surface Detection | Continuous raycasts locate planar surfaces (floors, tables) |
| Tap-to-Place | `useXREvent("select")` maps WebXR hit coordinates to 3D world space |
| Real-World Scale | Dynamic scale from `0.1×` to `3.0×` |
| Passthrough Blend | Physical camera stream composited with WebGL 3D artifacts |
| DOM Overlay | HTML controls (scale, rotate, exit) stay interactive over AR feed |

---

## 🗿 Exhibit Catalog

| ID | Artifact | Category | Gallery |
|---|---|---|---|
| ART001 | Handaxe from India | Prehistoric / Archaeological | Gallery 1 — Classical Antiquities |
| ART002 | Attic Black-Figure Amphora | Ancient Pottery | Gallery 1 — Classical Antiquities |
| ART003 | Royal Ceremonial Gemmed Crown | Regalia & Metalwork | Gallery 2 — Medieval & Epigraphic Treasures |
| ART004 | Cuneiform Decree Tablet | Historical Epigraphy | Gallery 2 — Medieval & Epigraphic Treasures |
| ART005 | Golden Obelisk of Memphis | Architectural Monument | Gallery 3 — Ancient Wonders Hall |
| … | + 10 more in `artifacts.json` | Various | Various |

The full knowledge base of **15 artifacts** is stored in `backend/artifacts.json` and drives all RAG retrieval, recommendations, and curator responses.

---

## 📡 API Reference

### `POST /ask`

Main AI Curator endpoint.

**Request Body**
```json
{
  "question": "What material is this artifact made of?",
  "artifact_id": "ART001",
  "session_id": "optional-uuid-string",
  "tone": "educational",
  "history": [],
  "visited_artifacts": ["ART001"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `question` | `string` | ✅ | Visitor question (1–1000 chars) |
| `artifact_id` | `string` | ❌ | Currently selected 3D artifact ID |
| `session_id` | `string` | ❌ | Session UUID (auto-generated if absent) |
| `tone` | `string` | ❌ | `educational` · `concise` · `friendly` (default: `educational`) |
| `history` | `array` | ❌ | Client conversation history for multi-turn continuity |
| `visited_artifacts` | `array` | ❌ | Previously explored artifact IDs |

**Response Body**
```json
{
  "answer": "The Handaxe from India is crafted from fine-grained quartzite...",
  "source": {
    "artifact": "Handaxe from India",
    "gallery": "Gallery 1: Classical Antiquities"
  },
  "confidence": 0.7234,
  "evidence": "Handaxe from India. Material: fine-grained quartzite...",
  "refused": false,
  "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "tone": "educational",
  "related_suggestions": [
    {
      "artifact_id": "ART002",
      "artifact_name": "Attic Black-Figure Amphora",
      "gallery": "Gallery 1: Classical Antiquities",
      "similarity": 0.6812
    }
  ]
}
```

### `GET /health`

Returns `{ "status": "healthy" }` — used by Railway health probes.

### `GET /`

Returns `{ "status": "ok", "service": "museum-ai-curator", "version": "4.1.0" }`.

---

## ☁️ Deployment

### Frontend — Vercel

```bash
# From virtual-museum/
vercel --prod
```

Set `NEXT_PUBLIC_API_URL` to your Railway backend URL in the Vercel project environment variables dashboard.

### Backend — Railway

The backend deploys automatically via the `Procfile` and `railway.json` at the repo root.

```
# Procfile
web: cd virtual-museum/backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set `GROQ_API_KEY` and `FRONTEND_URL` as Railway environment variables.

---

## 🗺️ Roadmap

- [x] **Phase 1** — 3D Museum environment, dual-mode navigation, GLB pipeline
- [x] **Phase 2** — Glassmorphic HUD, exhibit detail drawer, 2D floorplan map
- [x] **Phase 3** — RAG backend (vector retrieval + confidence gating)
- [x] **Phase 4** — XAI layer (evidence, source attribution, confidence score)
- [x] **Phase 5** — Personalization (session memory, tone modes, recommendations)
- [x] **Phase 6** — Frontend–Backend integration (`AICuratorPanel.jsx` ↔ `/ask`)
- [x] **Phase 7** — WebXR AR mode (tap-to-place, real-world scaling)
- [ ] **Phase 8** — Real `.glb` model population for all 15 artifacts
- [ ] **Phase 9** — WebXR VR headset mode (Meta Quest, Apple Vision Pro)
- [ ] **Phase 10** — Persistent session storage (replace in-memory state)
- [ ] **Phase 11** — Formal user study & evaluation (RQ1–RQ5 from research paper)

---

## 👥 Authors

<table>
  <tr>
    <td align="center">
      <b>Aryan Sinha</b><br/>
      <a href="https://github.com/Aryansinha123">@Aryansinha123</a>
    </td>
    <td align="center">
      <b>Shriya Garg</b><br/>
      <a href="https://github.com/sg2602">@sg2602</a>
    </td>
  </tr>
</table>

---

<div align="center">

Made with ❤️ &nbsp;·&nbsp; Three.js + React + FastAPI + WebXR

</div>
