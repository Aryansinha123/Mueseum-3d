import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Suppress headers/footers on first cover-like page if desired, or draw header everywhere
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 11 * inch - 25, "Virtual Museum AR/VR — Technical Review & Feature Documentation")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 11 * inch - 28, 8.5 * inch - 36, 11 * inch - 28)
            
        # Footer (all pages)
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 36, 20, footer_text)
        self.drawString(36, 20, "Confidential — Technical Review & Architecture Documentation")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 30, 8.5 * inch - 36, 30)
        
        self.restoreState()

def create_technical_review_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#0F172A")
    indigo_accent = colors.HexColor("#4F46E5")
    text_dark = colors.HexColor("#1E293B")
    muted_text = colors.HexColor("#475569")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#FFFFFF"),
        alignment=0,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#E2E8F0"),
        alignment=0
    )
    
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=indigo_accent,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=text_dark,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_dark,
        spaceBefore=3,
        spaceAfter=4
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark,
        leftIndent=12,
        firstLineIndent=-8,
        spaceBefore=2,
        spaceAfter=2
    )

    code_style = ParagraphStyle(
        'CodeText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0F172A")
    )
    
    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )
    
    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=text_dark
    )
    
    td_bold_style = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=text_dark
    )
    
    badge_new_style = ParagraphStyle(
        'BadgeNew',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#4F46E5")
    )
    
    badge_done_style = ParagraphStyle(
        'BadgeDone',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#059669")
    )

    story = []
    
    # Header Banner
    header_data = [
        [
            Paragraph("VIRTUAL MUSEUM AR/VR — TECHNICAL REVIEW", title_style),
        ],
        [
            Paragraph("AI-Powered Immersive Museum with WebXR AR/VR, RAG Curator, Voice TTS & Cloud Deployment<br/><b>Date:</b> September 2026 &nbsp;|&nbsp; <b>Status:</b> All Phases 0–6 Complete & Tested", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[540])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), primary_color),
        ('PADDING', (0,0), (-1,-1), 14),
        ('BOTTOMPADDING', (0,1), (-1,1), 14),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    
    # Executive Summary Box
    summary_html = "<b>Executive Summary:</b> The Virtual Museum AR/VR project is an end-to-end interactive application featuring 3D exhibit galleries, WebXR Augmented and Virtual Reality, a retrieval-augmented generation (RAG) AI curator, speech synthesis (TTS), smooth 60 FPS performance optimization, and a complete multi-cloud deployment pipeline (Vercel + Railway). All core features, interactive controls, audio features, and documentation have been successfully built and verified."
    summary_table = Table([[Paragraph(summary_html, body_style)]], colWidths=[540])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 10))
    
    # 1. Implementation Roadmap & Phase Status
    story.append(Paragraph("1. Development Roadmap & Implementation Status", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=indigo_accent, spaceBefore=2, spaceAfter=8))
    
    phase_data = [
        [Paragraph("Phase", th_style), Paragraph("Module / Focus Area", th_style), Paragraph("Key Deliverables", th_style), Paragraph("Status", th_style)],
        [Paragraph("Phase 0", td_bold_style), Paragraph("Museum Foundation", td_style), Paragraph("Next.js 16 + R3F, 3 Galleries, 15 GLB models, WebXR setup", td_style), Paragraph("Completed", badge_done_style)],
        [Paragraph("Phase 1", td_bold_style), Paragraph("RAG Vector Core", td_style), Paragraph("SentenceTransformers embeddings, NumPy cosine retrieval, cache", td_style), Paragraph("Completed", badge_done_style)],
        [Paragraph("Phase 2", td_bold_style), Paragraph("XAI & Anti-Hallucination", td_style), Paragraph("0.50 confidence threshold gate, deterministic refusal, evidence UI", td_style), Paragraph("Completed", badge_done_style)],
        [Paragraph("Phase 3", td_bold_style), Paragraph("Personalization & Memory", td_style), Paragraph("3-turn sliding window memory, tone controls, recommendation engine", td_style), Paragraph("Completed", badge_done_style)],
        [Paragraph("Phase 4", td_bold_style), Paragraph("Full-Stack Wiring", td_style), Paragraph("FastAPI /ask endpoint, Pydantic contracts, AICuratorPanel integration", td_style), Paragraph("Completed", badge_done_style)],
        [Paragraph("Phase 5", td_bold_style), Paragraph("Voice TTS & AR Overlay", td_style), Paragraph("Web Speech API synthesis, Listen button, AR DOM Curator overlay", td_style), Paragraph("Completed (NEW)", badge_new_style)],
        [Paragraph("Phase 6", td_bold_style), Paragraph("Cloud Deployment Plan", td_style), Paragraph("Vercel frontend + Railway FastAPI deployment guide (Deploy.txt)", td_style), Paragraph("Completed (NEW)", badge_new_style)],
    ]
    
    phase_table = Table(phase_data, colWidths=[50, 110, 290, 90])
    phase_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), indigo_accent),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(phase_table)
    story.append(Spacer(1, 10))
    
    # 2. Complete Features Catalog (With 1-Line Descriptions)
    story.append(Paragraph("2. Complete System Features Catalog (23 Features)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=indigo_accent, spaceBefore=2, spaceAfter=8))
    story.append(Paragraph("Below is the exhaustive catalog of all implemented application features, including single-sentence operational descriptions for each feature:", body_style))
    story.append(Spacer(1, 4))

    features = [
        ("AI Curator Voice Output (TTS)", "Audio & Speech", "NEW", "Provides browser-native text-to-speech audio narration of curator answers with real-time Play/Stop controls across desktop and AR modes."),
        ("In-AR AI Curator Overlay", "AR & WebXR", "NEW", "Integrates the full RAG AI Curator directly inside the mobile WebXR DOM overlay for interactive exhibit Q&A during AR sessions."),
        ("High-FPS Performance Engine", "Graphics & Engine", "NEW", "Maintains a stable 60 FPS through dynamic DPR capping (1.5 max), frustum culling, and distance-based GLB model lazy loading."),
        ("360° Mouse Pointer Lock & WASD", "Controls & Cam", "NEW", "Enables FPS-style desktop navigation with WASD movement keys and 360-degree pointer-lock mouse look for smooth exploration."),
        ("White Museum Gallery Ceilings", "3D Environment", "NEW", "Refreshes museum interior ceiling geometry with clean white museum-grade materials for accurate light bounce and visual clarity."),
        ("Production Deployment Workflow", "DevOps & Cloud", "NEW", "Provides a comprehensive, beginner-friendly deployment pipeline for Vercel (frontend) and Railway (FastAPI backend)."),
        ("3D Interactive Galleries", "3D Environment", "Core", "Renders three distinct 3D museum halls (Space, History, Natural History) using Three.js and React Three Fiber."),
        ("15 Curated GLB Artifacts", "3D Artifacts", "Core", "Displays high-fidelity 3D museum exhibit models loaded dynamically with bounding box optimization and interaction glow."),
        ("Artifact Inspection Focus", "Interactive UI", "Core", "Smoothly transitions the camera to focus on selected artifacts while presenting rich exhibit plaques and details."),
        ("WebXR Mobile AR Placement", "AR & WebXR", "Core", "Projects 3D exhibit models into physical space via real-world surface plane detection on Android WebXR Chrome."),
        ("AR Touch Gesture Controls", "AR & WebXR", "Core", "Supports single-finger object translation and two-finger pinch/twist gestures for real-time scale and rotation in AR."),
        ("WebXR VR Headset Mode", "VR & WebXR", "Core", "Provides immersive virtual reality headset support allowing visitors to step into the virtual museum halls directly."),
        ("Interactive 2D Minimap", "Navigation UI", "Core", "Renders a real-time overhead floorplan with visitor tracking dots and click-to-teleport navigation across galleries."),
        ("SentenceTransformer Vector RAG", "AI & NLP", "Core", "Encodes museum knowledge base into 384-dimensional dense vectors using all-MiniLM-L6-v2 for semantic search."),
        ("Fast NumPy Cosine Retrieval", "AI & NLP", "Core", "Executes lightning-fast vector similarity math in NumPy without external database overhead or network latency."),
        ("Local Embedding Cache (.npy)", "AI & Backend", "Core", "Accelerates backend startup time by caching serialized vector arrays with auto-invalidation on knowledge base updates."),
        ("0.50 Confidence Threshold Gate", "XAI & Security", "Core", "Evaluates cosine similarity against a strict 0.50 threshold to filter out-of-domain queries before calling the LLM."),
        ("Grounded Groq LLM Synthesizer", "AI & LLM", "Core", "Synthesizes curator responses using Groq API strictly constrained to retrieved evidence to eliminate AI hallucinations."),
        ("Deterministic Query Refusal", "XAI & Security", "Core", "Returns a standardized polite refusal response when queries fall below confidence thresholds without invoking LLM tokens."),
        ("XAI Badges & Evidence View", "XAI & UI", "Core", "Exposes numerical similarity scores and verbatim knowledge base excerpts in the UI for transparent answer verification."),
        ("Multi-Tone Response Selector", "Personalization", "Core", "Allows visitors to switch curator response styles dynamically between Educational, Concise, and Friendly tones."),
        ("3-Turn Contextual Session Memory", "Personalization", "Core", "Maintains a sliding 3-turn conversation memory window to resolve pronouns and follow-up exhibit questions accurately."),
        ("Vector Recommendation Engine", "Personalization", "Core", "Suggests relevant exhibit recommendations ('You Might Also Like') based on vector similarity between exhibit records.")
    ]

    feat_table_data = [
        [Paragraph("Feature Name", th_style), Paragraph("Category", th_style), Paragraph("Type", th_style), Paragraph("Operational Description (1-Line Summary)", th_style)]
    ]
    
    for name, cat, ftype, desc in features:
        badge_st = badge_new_style if ftype == "NEW" else td_style
        feat_table_data.append([
            Paragraph(name, td_bold_style),
            Paragraph(cat, td_style),
            Paragraph(ftype, badge_st),
            Paragraph(desc, td_style)
        ])
        
    feat_table = Table(feat_table_data, colWidths=[130, 85, 45, 280])
    feat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    
    story.append(feat_table)
    story.append(Spacer(1, 10))

    # Page Break for Technical Deep Dive
    story.append(PageBreak())
    
    # 3. Technical Architecture & Component Breakdown
    story.append(Paragraph("3. Technical Architecture & Key Components", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=indigo_accent, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph("3.1 Voice Output Synthesis Pipeline (Text-to-Speech)", h2_style))
    story.append(Paragraph("The voice output engine ([`src/utils/voice/textToSpeech.js`](file:///c:/Users/hp/CODEBASE/Projects/Museuem ARVR/virtual-museum/src/utils/voice/textToSpeech.js)) delivers seamless audio responses without third-party API dependencies or costs:", body_style))
    story.append(Paragraph("• <b>Speech Synthesis Integration:</b> Utilizes `window.speechSynthesis` and `SpeechSynthesisUtterance` for low-latency client-side speech generation.", bullet_style))
    story.append(Paragraph("• <b>Natural Voice Selection:</b> Automatically scans available device voices to prioritize natural English voices (e.g., Google US English, Natural English, or Microsoft Online voices).", bullet_style))
    story.append(Paragraph("• <b>Lifecycle & Cleanup Management:</b> Automatically cancels active speech when the AI Curator panel is closed, when switching artifacts, or when exiting AR mode.", bullet_style))
    story.append(Paragraph("• <b>UI State Synchronization:</b> Drives the 🔊 Listen / ⏹ Stop toggle button in `AICuratorPanel.jsx` using `onstart`, `onend`, and `onerror` event listeners.", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("3.2 WebXR AR Overlay & Exhibit Context Integration", h2_style))
    story.append(Paragraph("The AR overlay system ([`src/components/ar/AROverlayUI.jsx`](file:///c:/Users/hp/CODEBASE/Projects/Museuem ARVR/virtual-museum/src/components/ar/AROverlayUI.jsx)) bridges 3D WebXR rendering with modern 2D DOM interaction:", body_style))
    story.append(Paragraph("• <b>DOM Portal Injection:</b> Leverages React Portals (`createPortal`) to project HTML UI elements into the WebXR AR overlay container.", bullet_style))
    story.append(Paragraph("• <b>In-AR AI Curator Panel:</b> Embeds the full RAG AI Curator inside AR overlay, enabling visitors to ask questions about placed 3D artifacts and listen to voice answers.", bullet_style))
    story.append(Paragraph("• <b>Gesture-Safe Interaction:</b> Touch inputs inside the curator panel are isolated from 3D object manipulation to prevent accidental movement during reading or audio playback.", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("3.3 Performance & FPS Optimization Architecture", h2_style))
    story.append(Paragraph("To ensure fluid 60 FPS performance on both desktop GPUs and mobile AR hardware, key rendering optimizations were implemented:", body_style))
    story.append(Paragraph("• <b>Dynamic DPR Cap:</b> Device pixel ratio is hard-capped at 1.5 (`dpr={[1, 1.5]}`) in R3F Canvas to prevent rendering overhead on 4K / high-density mobile screens.", bullet_style))
    story.append(Paragraph("• <b>Camera Frustum Culling:</b> Mesh geometry outside the active camera field of view is culled automatically prior to rasterization.", bullet_style))
    story.append(Paragraph("• <b>Distance-Based Lazy Loading:</b> Heavy GLB artifact geometry loads on demand as the visitor approaches exhibit pedestals.", bullet_style))
    story.append(Paragraph("• <b>Memoized Geometry & Bounding Boxes:</b> Bounding box calculations and collision meshes are cached to eliminate garbage collection frame spikes.", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph("3.4 Production Deployment Architecture (Vercel + Railway)", h2_style))
    story.append(Paragraph("Full production readiness guidelines documented step-by-step in `Docs/Deploy.txt`:", body_style))
    
    deploy_data = [
        [Paragraph("Tier", th_style), Paragraph("Platform", th_style), Paragraph("Build / Runtime Setup", th_style), Paragraph("Environment Configuration", th_style)],
        [
            Paragraph("Frontend", td_bold_style),
            Paragraph("Vercel", td_style),
            Paragraph("Next.js 16 App Router build (`npm run build`). Automatic SSL, global CDN edge network.", td_style),
            Paragraph("`NEXT_PUBLIC_BACKEND_URL` pointing to deployed Railway backend URL.", td_style)
        ],
        [
            Paragraph("Backend", td_bold_style),
            Paragraph("Railway", td_style),
            Paragraph("Python 3.11 environment. Procfile runner: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`.", td_style),
            Paragraph("`GROQ_API_KEY` (Groq LLM key), `FRONTEND_URL` (Vercel origin for CORS).", td_style)
        ]
    ]
    deploy_table = Table(deploy_data, colWidths=[65, 65, 220, 190])
    deploy_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(deploy_table)
    story.append(Spacer(1, 10))

    # 4. API Contract & Data Flow
    story.append(Paragraph("4. RAG Curator API Contract (`POST /ask`)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=indigo_accent, spaceBefore=2, spaceAfter=8))
    
    api_req_code = """// Request Payload (Next.js Frontend -> FastAPI Backend)
{
  "session_id": "a1b2c3d4-e5f6-7890",
  "question": "What is the historical significance of this exhibit?",
  "artifact_id": "ART001",
  "tone": "educational"
}"""
    
    api_res_code = """// Response Payload (FastAPI Backend -> Next.js Frontend)
{
  "answer": "The Old Arrow Maker was created by Edmonia Lewis in 1872...",
  "source": { "artifact": "Old Arrow Maker", "gallery": "History Gallery" },
  "confidence": 0.842,
  "evidence": "Old Arrow Maker. Sculptor: Edmonia Lewis. Date: 1872...",
  "refused": false,
  "session_id": "a1b2c3d4-e5f6-7890",
  "tone": "educational",
  "related_suggestions": [
    { "artifact_id": "ART002", "artifact_name": "Benin Bronze", "similarity": 0.63 }
  ]
}"""

    code_table_data = [
        [Paragraph("HTTP Request (`POST /ask`)", th_style), Paragraph("HTTP Response (JSON)", th_style)],
        [
            Paragraph(api_req_code.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style),
            Paragraph(api_res_code.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style)
        ]
    ]
    code_table = Table(code_table_data, colWidths=[260, 280])
    code_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#F8FAFC")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(code_table)
    story.append(Spacer(1, 10))

    # 5. Project Directory Structure
    story.append(Paragraph("5. Updated Project File Structure", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=indigo_accent, spaceBefore=2, spaceAfter=8))
    
    tree_text = """virtual-museum/
├── src/
│   ├── app/                         # Next.js App Router pages & layout
│   ├── components/
│   │   ├── curator/
│   │   │   └── AICuratorPanel.jsx   # AI Curator UI + TTS Voice Button (Phase 4 & 5)
│   │   ├── ar/
│   │   │   └── AROverlayUI.jsx      # WebXR AR DOM overlay + Curator Integration (Phase 5)
│   │   ├── museum/                  # 3D Museum Gallery Canvas & White Ceiling (Phase 0 & 5)
│   │   ├── controls/                # WASD + 360° Mouse Pointer Lock Controls (Phase 5)
│   │   └── artifacts/               # 3D GLB Artifact Inspection components
│   ├── utils/
│   │   ├── voice/
│   │   │   └── textToSpeech.js      # Web Speech API Synthesis Utility (Phase 5 - NEW)
│   │   └── api/
│   │       └── curator.js           # askCurator() API client
│   └── data/                        # 15 Smithsonian exhibit metadata records
├── backend/
│   ├── main.py                      # FastAPI app entry point & CORS configuration
│   ├── Procfile                     # Railway backend start process command
│   ├── requirements.txt             # Python backend dependencies
│   └── rag/                         # SentenceTransformers, NumPy RAG & Groq pipeline
├── Docs/
│   ├── Deploy.txt                   # Complete Vercel + Railway Deployment Guide (NEW)
│   ├── Voice.txt                    # Speech Synthesis Architecture Specifications (NEW)
│   └── Optimise AR.txt              # Mobile AR Performance Benchmarks & Rules (NEW)
└── README.md                        # Master Project Documentation & Feature Guide"""

    tree_table = Table([[Paragraph(tree_text.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style)]], colWidths=[540])
    tree_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(tree_table)
    story.append(Spacer(1, 10))

    # 6. Conclusion & Verification Sign-off
    story.append(Paragraph("6. System Verification & Sign-Off", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=indigo_accent, spaceBefore=2, spaceAfter=8))
    story.append(Paragraph("The Virtual Museum AR/VR system has undergone comprehensive end-to-end verification across desktop browsers and Android WebXR devices:", body_style))
    story.append(Paragraph("✓ <b>RAG Accuracy & Hallucination Prevention:</b> Tested against out-of-distribution questions; 0.50 threshold gate successfully triggers deterministic refusal without calling LLM tokens.", bullet_style))
    story.append(Paragraph("✓ <b>Voice Speech Synthesis (TTS):</b> Verified across Chrome, Edge, and Android WebView; audio speech stops instantly on panel close or AR exit.", bullet_style))
    story.append(Paragraph("✓ <b>3D & AR Rendering Performance:</b> Maintained locked 60 FPS in desktop mode and smooth 60 FPS plane tracking during mobile WebXR AR sessions.", bullet_style))
    story.append(Paragraph("✓ <b>Deployment Verification:</b> Backend FastAPI health check and Next.js frontend builds verified for production readiness.", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated updated PDF at: {output_path}")

if __name__ == "__main__":
    out_pdf = "c:/Users/hp/CODEBASE/Projects/Museuem ARVR/Virtual_Museum_Technical_Review.pdf"
    create_technical_review_pdf(out_pdf)
