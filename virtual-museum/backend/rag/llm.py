"""
Grounded LLM Integration Module (Phase 2/3)

Calls Groq API with ONLY the retrieved artifact's curated metadata.
No outside knowledge is permitted. The LLM is a tone-adapting formatter,
not an independent knowledge source.

Tone directives affect writing style only — factual content is unchanged.
"""

import os
from typing import Dict, Any

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── TONE DIRECTIVES ───────────────────────────────────────────────────────────
# Style-only instructions. Factual grounding is enforced by the system prompt.
TONE_DIRECTIVES = {
    "educational": "Provide a scholarly, analytical, and informative museum curator response with cultural and historical context.",
    "concise":     "Provide a brief, direct, key-facts-only answer in 2 to 3 sentences maximum.",
    "friendly":    "Provide a warm, engaging, conversational, and welcoming museum guide response.",
}

# ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT_TEMPLATE = """You are an AI curator for a virtual museum.

Answer the visitor's question ONLY using the supplied curated artifact information below.

Do not use outside knowledge.
Do not invent facts, dates, names, measurements, historical events, or interpretations.
The selected artifact is the subject of the visitor's question.

If the supplied artifact information does not contain enough information to answer the question, explicitly state: "This information is not available in the curated museum knowledge base."

Conversation history may be used ONLY to understand references such as 'it', 'this artifact', or 'that object'.
The conversation history is NOT a source of factual museum knowledge.
The current retrieved artifact evidence below is the sole authoritative source for all factual information.

Use the requested tone ONLY to change writing style — never to alter factual content.

REQUESTED TONE:
{tone_instruction}

CURRENT SELECTED ARTIFACT:
Name: {name}
Gallery: {gallery}
Category: {category}
Institution: {institution}
Period / Date: {period}
Origin: {origin}
Description: {description}
Historical Significance: {significance}
Material: {material}
Dimensions: {dimensions}

RECENT CONVERSATION HISTORY:
{history}

VISITOR QUESTION:
{question}"""


# ── VALIDATION ────────────────────────────────────────────────────────────────

def validate_tone(tone: str) -> str:
    """Returns a valid tone string, defaulting to 'educational' for invalid values."""
    if not tone or not isinstance(tone, str):
        return "educational"
    tone_clean = tone.strip().lower()
    return tone_clean if tone_clean in TONE_DIRECTIVES else "educational"


# ── API CREDENTIALS ───────────────────────────────────────────────────────────

def get_api_credentials() -> Dict[str, Any]:
    """
    Reads LLM API keys from environment variables.
    Keys are NEVER logged or exposed.
    """
    groq_key = os.environ.get("GROQ_API_KEY") or os.environ.get("GROK_API_KEY")
    gemini_key = os.environ.get("GEMINI_API_KEY")
    return {
        "groq":   groq_key.strip() if groq_key else None,
        "gemini": gemini_key.strip() if gemini_key else None,
    }


# ── GROQ CALL ─────────────────────────────────────────────────────────────────

GROQ_CANDIDATE_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "groq/compound",
    "qwen/qwen3.8-27b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]


def _call_groq(prompt: str, api_key: str) -> str:
    """
    Calls Groq API via the official groq-python SDK.
    Tries multiple model IDs in order of preference.
    """
    from groq import Groq

    client = Groq(api_key=api_key)
    last_err = None

    print("[GROQ] Request started")

    for model_name in GROQ_CANDIDATE_MODELS:
        try:
            print(f"[GROQ] Trying model: {model_name}")
            completion = client.chat.completions.create(
                model=model_name,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an AI curator for a virtual museum. "
                            "Answer using ONLY the supplied curated artifact information. "
                            "Do not use outside knowledge. Do not invent facts."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=512,
            )
            answer = completion.choices[0].message.content.strip()
            print(f"[GROQ] Model request successful ({model_name})")
            print(f"[GROQ] Response received ({len(answer)} chars)")
            return answer
        except Exception as e:
            print(f"[GROQ] Model {model_name} failed: {type(e).__name__}")
            last_err = e
            continue

    raise RuntimeError(f"All Groq models failed. Last error: {last_err}")


# ── MAIN GENERATION FUNCTION ──────────────────────────────────────────────────

def generate_grounded_answer(
    question: str,
    artifact: Dict[str, Any],
    history_text: str = "None",
    tone: str = "educational",
) -> str:
    """
    Generates a grounded LLM answer using ONLY the supplied artifact's metadata.

    :param question: Visitor question string
    :param artifact: Retrieved / selected artifact metadata dictionary
    :param history_text: Formatted string of recent conversation turns
    :param tone: Presentation style ('educational', 'concise', 'friendly')
    :return: Grounded answer string from LLM
    """
    keys = get_api_credentials()
    valid_tone = validate_tone(tone)
    tone_directive = TONE_DIRECTIVES[valid_tone]

    # Extract artifact context fields safely
    name        = artifact.get("name", "Unknown Artifact")
    gallery     = artifact.get("galleryName", "Museum Collection")
    category    = artifact.get("category", "")
    institution = artifact.get("institution", "")
    period      = artifact.get("period", "")
    origin      = artifact.get("origin", "")
    description = artifact.get("description", "")

    ai_ctx      = artifact.get("aiContext", {}) or {}
    if isinstance(ai_ctx, dict):
        significance = ai_ctx.get("historicalSignificance", "")
        material     = ai_ctx.get("material", "N/A")
        dimensions   = ai_ctx.get("dimensions", "N/A")
    else:
        significance = material = dimensions = "N/A"

    prompt = SYSTEM_PROMPT_TEMPLATE.format(
        tone_instruction=tone_directive,
        name=name,
        gallery=gallery,
        category=category,
        institution=institution,
        period=period,
        origin=origin,
        description=description,
        significance=significance,
        material=material,
        dimensions=dimensions,
        history=history_text if history_text else "None (first interaction)",
        question=question,
    )

    # Priority 1: Groq
    if keys["groq"]:
        try:
            return _call_groq(prompt, keys["groq"])
        except Exception as err:
            print(f"[LLM ERROR] Groq failed: {err}")
            raise RuntimeError(f"Groq LLM service error: {err}")

    # Priority 2: Gemini
    if keys["gemini"]:
        try:
            print("[GEMINI] Request started")
            from google import genai
            client = genai.Client(api_key=keys["gemini"])
            res = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
            if res and res.text:
                print("[GEMINI] Response received")
                return res.text.strip()
            raise RuntimeError("Gemini returned empty response")
        except Exception as err:
            print(f"[LLM ERROR] Gemini failed: {err}")
            raise RuntimeError(f"Gemini LLM service error: {err}")

    # No API key configured — return deterministic fallback (no hallucination)
    print("[LLM WARNING] No API key configured (GROQ_API_KEY / GEMINI_API_KEY). Using description fallback.")
    fallback = f"{name} is part of the {gallery}. {description}"
    if significance:
        fallback += f" {significance}"
    return fallback
