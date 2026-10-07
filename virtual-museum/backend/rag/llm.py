"""
Grounded LLM Integration Module (Phase 2/3)

Calls Groq API with ONLY the retrieved artifact's curated metadata.
No outside knowledge is permitted. The LLM is a tone-adapting formatter,
not an independent knowledge source.

Tone directives affect writing style only — factual content is unchanged.
"""

import os
from typing import Dict, Any, List, Tuple, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── TONE DIRECTIVES ───────────────────────────────────────────────────────────
# Style-only instructions. Factual grounding is enforced by the system prompt.
TONE_DIRECTIVES = {
    "educational": "Provide an immersive, scholarly, and captivating museum curator narrative with deep cultural, technical, and historical context.",
    "concise":     "Provide a direct, key-facts-only museum answer in 2 to 3 well-crafted sentences.",
    "friendly":    "Provide a warm, enthusiastic, engaging, and welcoming museum guide response that brings the history alive.",
}

# ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT_TEMPLATE = """You are an engaging, eloquent, and world-class AI museum curator guiding a visitor through a 3D virtual heritage exhibition.

YOUR MISSION:
Deliver a captivating, conversational, and informative museum guide experience. Bring the artifact to life with vivid storytelling, cultural and historical context, craftsmanship details, and fascinating facts from the verified record.

CONVERSATIONAL GUIDELINES:
1. DIALOGUE FLOW: Speak in an authentic, natural voice. When recent conversation history is present, seamlessly acknowledge it and build upon prior topics or questions.
2. QUESTION-SPECIFIC FOCUS: Answer strictly and directly what the visitor is asking. Do NOT provide a generic overview when asked a specific question.
   - If asked WHEN it was created, focus on the creation date, chronology, and historical era.
   - If asked WHAT IT WAS USED FOR, focus on its operational function, purpose, and utility.
   - If asked WHY IT IS IMPORTANT, focus on its historical significance, breakthroughs, and cultural legacy.
   - If asked WHO MADE IT, focus on the artist, inventor, or discoverer.
   - If asked MATERIALS / DIMENSIONS, focus on physical composition and measurements.
3. ADDITIONAL KNOWLEDGE FOR WORDS / CONCEPTS: If the visitor asks for the definition, meaning, or additional knowledge regarding a specific word, concept, or term related to the exhibit (e.g., "What is a pressure suit?", "What does Cincinnatus mean?", "What is induction?"), you MAY draw upon broader historical and scientific knowledge to define and explain the term in relation to the exhibit. However, you MUST conclude that explanation with:
   *(Curator's Note: This explanation draws upon broader historical and scientific knowledge beyond our primary museum catalog record.)*
4. GROUNDING: Ground all other factual statements in the supplied curated artifact evidence below. Do NOT fabricate historical dates, names, or events outside the record.
5. DEPTH & QUALITY: Avoid robotic one-liners unless the visitor explicitly selected 'concise' tone.
6. TONE: Adapt your style according to the requested tone directive below.
7. DYNAMIC FOLLOW-UPS: At the very end of your response, provide exactly 2 to 3 engaging follow-up questions that the visitor might want to ask next to explore this exhibit or its themes more deeply. Format them strictly as:
SUGGESTED_FOLLOWUPS:
- <Follow-up question 1>
- <Follow-up question 2>
- <Follow-up question 3>

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

EXTENDED KNOWLEDGE BASE:
{extended_knowledge}

CURATORIAL DOSSIER & NOTES:
{curatorial_notes}

PRIOR EXHIBIT EXPLORED IN TOUR:
{prior_exhibit_context}

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


# ── DYNAMIC SUGGESTION HELPERS ────────────────────────────────────────────────

def generate_dynamic_followups(
    artifact: Dict[str, Any],
    question: str = "",
    history: Optional[Any] = None,
    related_artifacts: Optional[List[Dict[str, Any]]] = None,
    prior_artifact: Optional[Dict[str, Any]] = None,
) -> List[str]:
    """
    Synthesizes intelligent, intent-aware, non-repetitive follow-up exploration prompts.
    Adapts based on the visitor's specific query (date, function, importance, materials, creator, concept)
    and filters out questions previously addressed in dialogue history.
    """
    name = artifact.get("name") or artifact.get("title", "this exhibit")
    category = (artifact.get("category", "") or "").lower()
    period = artifact.get("period", "")
    origin = artifact.get("origin", "")
    q = (question or "").lower().strip()

    # Collect previous questions from history to avoid repeating prompts
    prior_queries = set()
    if history:
        if isinstance(history, list):
            for item in history:
                if isinstance(item, dict) and item.get("role") == "user":
                    prior_queries.add(item.get("content", "").lower().strip())
                elif isinstance(item, dict) and "user" in item:
                    prior_queries.add(item.get("user", "").lower().strip())
        elif isinstance(history, str):
            for line in history.splitlines():
                if "visitor" in line.lower() or "user" in line.lower():
                    clean_turn = line.split(":", 1)[-1].strip().lower()
                    prior_queries.add(clean_turn)

    candidates: List[str] = []

    # 1. INTENT: WHEN / DATE / CHRONOLOGY
    if any(k in q for k in ["when", "year", "date", "period", "era", "century", "age", "how old"]):
        candidates.extend([
            f"What major historical events were taking place when the {name} was created?",
            f"What tools and technology existed during {period or 'that era'} to produce this?",
            f"How has our understanding of the {name} evolved since that time?",
        ])

    # 2. INTENT: PURPOSE / FUNCTION / OPERATION
    elif any(k in q for k in ["used for", "purpose", "function", "how did it work", "how does it work", "role", "operate", "mission"]):
        candidates.extend([
            f"Who were the primary individuals or specialists trained to use the {name}?",
            f"What dangerous risks or obstacles were faced during its operation?",
            f"What subsequent invention or design eventually superseded the {name}?",
        ])

    # 3. INTENT: SIGNIFICANCE / IMPORTANCE / LEGACY
    elif any(k in q for k in ["why is it important", "why important", "significance", "legacy", "famous", "impact", "matter"]):
        candidates.extend([
            f"How did the {name} influence future scientific discoveries or cultural movements?",
            f"How did our museum acquire and preserve this specimen?",
            f"What is the most remarkable story documented about this exhibit?",
        ])

    # 4. INTENT: MATERIALS / COMPOSITION / CRAFT
    elif any(k in q for k in ["material", "made of", "built", "composed", "crafted", "dimension", "weight", "anatomy", "texture"]):
        candidates.extend([
            f"How do museum conservators preserve these delicate components?",
            f"What are the physical dimensions and weight of the {name}?",
            f"Where did the creators source these specialized materials from?",
        ])

    # 5. INTENT: CREATOR / ARTIST / ORIGIN
    elif any(k in q for k in ["who made", "creator", "artist", "sculptor", "inventor", "origin", "where from", "where did"]):
        candidates.extend([
            f"What other celebrated works or inventions were produced by this creator?",
            f"What was daily life like in {origin or 'its place of origin'} back then?",
            f"Did this piece receive immediate recognition during its time?",
        ])

    # 6. INTENT: WORD / CONCEPT / DEFINITION
    elif any(k in q for k in ["what is a", "what is an", "what does", "define", "meaning of", "explain the term", "concept"]):
        candidates.extend([
            f"How does the {name} directly demonstrate this principle?",
            f"What are other famous examples of this concept in the museum?",
            f"How has this concept developed in modern technology and scholarship?",
        ])

    # 7. DEFAULT / OVERVIEW
    else:
        candidates.extend([
            f"When was the {name} created and what was happening in that era?",
            f"What was the primary function of the {name} and how did it work?",
            f"What makes the {name} a foundational highlight of this gallery?",
        ])

    # Add Category-Specific Deepening Prompts
    if any(k in category for k in ["space", "astronaut", "flight"]):
        candidates.append("What specific engineering challenges did astronauts encounter with this?")
    elif any(k in category for k in ["fossil", "paleontolog", "skeleton", "dinosaur"]):
        candidates.append(f"What was the prehistoric ecosystem like when {name} lived?")
    elif any(k in category for k in ["sculpture", "pottery", "art"]):
        candidates.append(f"What mythological or cultural symbolism is embedded in the {name}?")
    elif any(k in category for k in ["telegraph", "technology", "device"]):
        candidates.append(f"How did the {name} revolutionize communication across long distances?")

    # Add Comparative Inquiry if prior artifact in tour is known (Phase D Tour Continuity)
    if prior_artifact and prior_artifact.get("name"):
        candidates.append(f"How does the {name} compare to the {prior_artifact['name']} you explored earlier?")
    elif related_artifacts and len(related_artifacts) > 0:
        other_name = related_artifacts[0].get("artifact_name") or related_artifacts[0].get("name")
        if other_name:
            candidates.append(f"How does the {name} compare to the {other_name}?")

    # Filter out candidates that closely match prior questions in dialogue
    filtered: List[str] = []
    for cand in candidates:
        cand_lower = cand.lower().strip()
        already_asked = any(cand_lower in pq or pq in cand_lower for pq in prior_queries)
        if not already_asked and cand not in filtered:
            filtered.append(cand)

    # Ensure at least 3 follow-ups
    if len(filtered) < 3:
        for backup in [
            f"Why is the {name} considered unique in world history?",
            f"What materials and techniques were used to build it?",
            f"How does this exhibit connect to other artifacts in our gallery?",
        ]:
            if backup not in filtered:
                filtered.append(backup)

    return filtered[:3]


def generate_default_followups(artifact: Dict[str, Any]) -> List[str]:
    """Backward-compatible alias for generate_dynamic_followups."""
    return generate_dynamic_followups(artifact)


def extract_answer_and_followups(
    raw_text: str,
    artifact: Dict[str, Any],
    question: str = "",
    history: Optional[Any] = None,
    related_artifacts: Optional[List[Dict[str, Any]]] = None,
    prior_artifact: Optional[Dict[str, Any]] = None,
) -> Tuple[str, List[str]]:
    """
    Separates the main curator answer from the SUGGESTED_FOLLOWUPS section.
    Returns cleaned answer and a list of 2-3 follow-up prompt strings.
    """
    marker = "SUGGESTED_FOLLOWUPS:"
    followups: List[str] = []
    answer = raw_text.strip()

    if marker in answer:
        parts = answer.split(marker, 1)
        answer = parts[0].strip()
        followup_section = parts[1].strip()
        for line in followup_section.split("\n"):
            clean_line = line.strip().lstrip("-*•0123456789. ").strip()
            if clean_line and len(clean_line) > 5:
                if not clean_line.endswith("?"):
                    clean_line += "?"
                followups.append(clean_line)

    if len(followups) < 2:
        followups = generate_dynamic_followups(
            artifact,
            question=question,
            history=history,
            related_artifacts=related_artifacts,
            prior_artifact=prior_artifact,
        )

    return answer, followups[:3]


def build_rich_fallback_answer(
    artifact: Dict[str, Any],
    question: str = "",
    tone: str = "educational",
    prior_artifact: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Builds a rich, intent-aware, and tone-tailored factual answer when no external LLM API key is configured.
    Accurately addresses specific visitor questions (date, purpose, importance, creator, materials, word definitions, comparison)
    without repetitive boilerplate.
    """
    valid_tone = validate_tone(tone)
    q = (question or "").lower().strip()

    name = artifact.get("name") or artifact.get("title", "this exhibit")
    gallery = artifact.get("galleryName") or artifact.get("gallery", "Museum Collection")
    category = artifact.get("category", "Historic Artifact")
    period = artifact.get("period", "Historical Era")
    origin = artifact.get("origin", "Museum Provenance")
    artist = artifact.get("artist", "")
    desc = artifact.get("description", "")
    institution = artifact.get("institution", "our museum")

    ai_ctx = artifact.get("aiContext", {}) or {}
    sig = ai_ctx.get("historicalSignificance") or ""
    mat = ai_ctx.get("material") or ""
    dims = ai_ctx.get("dimensions") or ""

    ext = artifact.get("extended_knowledge", {}) or {}

    # Check for word / concept definition inquiry
    is_word_query = any(
        q.startswith(prefix) for prefix in [
            "what is a ", "what is an ", "what does ", "define ",
            "meaning of ", "explain the word ", "explain the concept ", "what is meant by "
        ]
    ) or " mean" in q

    curator_note = ""
    intent = "overview"

    if is_word_query:
        intent = "word_concept"
        curator_note = "\n\n*(Curator's Note: This explanation draws upon broader historical and scientific knowledge beyond our primary museum catalog record.)*"
    elif any(k in q for k in ["compare", "versus", "vs", "differ", "similarity", "similar to", "unlike", "connection"]):
        intent = "comparison"
    elif any(k in q for k in ["when", "create", "date", "period", "era", "age", "year", "dynasty", "epoch", "how old", "century", "timeline"]):
        intent = "when"
    elif any(k in q for k in ["used for", "purpose", "function", "how does it work", "how did it work", "operation", "what did it do", "what was it for", "mechanism", "operate", "utility", "role"]):
        intent = "purpose"
    elif any(k in q for k in ["important", "significan", "why in museum", "legacy", "value", "special", "matter", "famous", "why care", "milestone", "achievement"]):
        intent = "significance"
    elif any(k in q for k in ["who made", "who built", "who created", "artist", "creator", "sculptor", "inventor", "architect", "collector", "who designed", "maker"]):
        intent = "creator"
    elif any(k in q for k in ["where", "found", "origin", "site", "excavat", "bonebed", "tar pit", "quarry", "provenance", "come from"]):
        intent = "origin"
    elif any(k in q for k in ["material", "made of", "craft", "medium", "dimension", "weight", "weigh", "heavy", "size", "mass", "metal", "marble", "bronze", "stone", "specs"]):
        intent = "materials"
    elif any(k in q for k in ["eat", "diet", "food", "prey", "hunt", "herbivore", "carnivore", "seagrass"]):
        intent = "diet"
    elif any(k in q for k in ["tooth", "teeth", "fang", "horn", "frill", "jaw", "skull", "tusk", "engine", "propulsion", "speed"]):
        intent = "anatomy"
    elif any(k in q for k in ["crew", "astronaut", "mission", "flight", "space", "moon", "orbit"]):
        intent = "mission"
    else:
        intent = "overview"

    # ── 1. WHEN WAS IT CREATED ────────────────────────────────────────────────
    if intent == "when":
        chronology = ext.get("dynasty_and_period") or ext.get("age_and_formation") or ext.get("chronology_and_extinction") or ext.get("inventor_and_date") or ext.get("flight_record") or ext.get("deep_space_firsts") or ""
        if valid_tone == "concise":
            answer = f"The {name} dates to {period} ({origin}). {chronology[:160]}." if chronology else f"The {name} dates to {period} and originated from {origin}."
        elif valid_tone == "friendly":
            answer = f"Step back in time! The {name} was created in {period}, originating from {origin}.\n\nWhat makes this era so captivating is how it represents the pinnacle of {category}. {chronology or f'It is a preserved window into human and natural history here in {gallery}.'}"
        else:
            answer = f"Chronological & Historical Context:\n\nThe {name} dates to {period}, with recorded origins in {origin}. Preserved within {gallery}, it exemplifies {category}.\n\n{f'Historical Era Breakdown:\n{chronology}' if chronology else f'Created during {period}, it serves as an indispensable reference point in museum archives.'}"

    # ── 2. WHAT WAS IT USED FOR / PURPOSE ─────────────────────────────────────
    elif intent == "purpose":
        purpose = ext.get("religious_and_ritual_use") or ext.get("mission_and_crew") or ext.get("engineering_details") or ext.get("sound_barrier_break") or ext.get("propulsion") or ext.get("life_support") or ext.get("hunting_style") or ext.get("defense_and_combat") or ext.get("scientific_breakthrough") or ext.get("first_transmission") or ext.get("symposium_culture") or ""
        if valid_tone == "concise":
            answer = f"The {name} was designed and utilized for: {purpose[:200] if purpose else desc}."
        elif valid_tone == "friendly":
            answer = f"Fascinating question! The {name} had an indispensable real-world role.\n\n{purpose or desc}\n\nSeeing it up close in 3D truly highlights the ingenuity that went into its everyday function!"
        else:
            answer = f"Functional Purpose & Operational Role:\n\nThe {name} served a vital function in its historical and technical domain.\n\n{f'Operational Breakdown:\n{purpose}' if purpose else f'Primary Application:\n{desc}'}\n\nIts design exemplifies the pragmatic and cultural requirements of {category} in {gallery}."

    # ── 3. WHY IS IT IMPORTANT / SIGNIFICANCE ─────────────────────────────────
    elif intent == "significance":
        sig_text = sig or ext.get("historical_significance") or ext.get("historic_milestones") or ext.get("impact_on_civilization") or ext.get("deep_space_firsts") or ext.get("significance") or ""
        if valid_tone == "concise":
            answer = f"The {name} is of paramount historical importance: {sig_text[:220] if sig_text else desc[:220]}."
        elif valid_tone == "friendly":
            answer = f"This is truly one of the crown jewels of our museum collection! The {name} is important because {sig_text or desc}.\n\nIt continues to inspire historians, scientists, and visitors from around the world."
        else:
            answer = f"Curatorial Significance & Cultural Legacy:\n\nThe {name} holds profound historical and scientific significance.\n\n{sig_text or desc}\n\nWithin the {gallery}, it stands as an enduring benchmark of human achievement and natural history."

    # ── 4. WHO MADE IT / ARTIST / CREATOR ─────────────────────────────────────
    elif intent == "creator":
        creator_info = ext.get("biography_and_artist") or ext.get("sculptor_and_commission") or ext.get("inventors") or ext.get("specimen_and_collector") or ext.get("astronaut_and_flight") or ""
        creator_name = artist or (institution or "historic artisans and pioneers")
        if valid_tone == "concise":
            answer = f"The {name} is attributed to {creator_name}. {creator_info[:180]}." if creator_info else f"The {name} is attributed to {creator_name}."
        elif valid_tone == "friendly":
            answer = f"Let's talk about the remarkable minds behind this! The {name} is attributed to {creator_name}.\n\n{creator_info or f'Their work represents a groundbreaking contribution to {category}.'}"
        else:
            bio_line = f"Biographical Context:\n{creator_info}" if creator_info else f"Documented in museum archives under {category}, this work highlights extraordinary artistry and innovation."
            answer = f"Creator Biography & Historical Authorship:\n\nThe {name} is credited to {creator_name}.\n\n{bio_line}"

    # ── 5. WHERE WAS IT FOUND / ORIGIN ────────────────────────────────────────
    elif intent == "origin":
        site_info = ext.get("discovery_and_site") or ext.get("specimen_and_discovery") or ext.get("tar_pits_preservation") or ext.get("provenance") or ext.get("specimen_and_origin") or ""
        if valid_tone == "concise":
            answer = f"The {name} originated from {origin}. {site_info[:180]}." if site_info else f"The {name} originated from {origin}."
        elif valid_tone == "friendly":
            friendly_site = site_info or f"It was preserved and safely transported to {institution} to be shared with the public."
            answer = f"The journey of the {name} began in {origin}!\n\n{friendly_site}"
        else:
            excavation_line = f"Excavation & Field Record:\n{site_info}" if site_info else f"Acquired and conserved in accordance with Smithsonian archival standards for {category}."
            answer = f"Geographic Origin & Discovery Provenance:\n\nOfficial records trace the {name} to {origin}.\n\n{excavation_line}"

    # ── 6. MATERIALS / MADE OF / DIMENSIONS ───────────────────────────────────
    elif intent == "materials":
        mat_info = ext.get("material_and_technique") or ext.get("dimensions_and_materials") or ext.get("size_and_mass") or ext.get("thermal_protection") or ext.get("pottery_technique") or ""
        if valid_tone == "concise":
            answer = f"Materials: {mat or 'Composite museum materials'}. Dimensions: {dims or 'Standard catalog scale'}. {mat_info[:150]}." if mat_info else f"Materials: {mat or 'Composite materials'}. Dimensions: {dims or 'Catalog scale'}."
        elif valid_tone == "friendly":
            answer = f"The craftsmanship on the {name} is extraordinary! It is made of {mat or 'specialized materials'} with dimensions measuring {dims or 'impressive proportions'}.\n\n{mat_info or 'Every surface tells a story of meticulous engineering and master craftsmanship.'}"
        else:
            answer = f"Physical Specifications & Material Composition:\n\n- Primary Material: {mat or 'Specialized medium'}\n- Physical Dimensions: {dims or 'Cataloged scale'}\n\nTechnical Craftsmanship:\n{mat_info or f'Constructed in accordance with the finest standards of {category}.'}"

    # ── 7. DIET / ECOLOGY ─────────────────────────────────────────────────────
    elif intent == "diet":
        diet_info = ext.get("diet_and_ecosystem") or ext.get("diet_and_size") or ext.get("hunting_style") or ext.get("bite_force") or ext.get("molar_dentition") or ""
        if valid_tone == "concise":
            answer = f"Diet and feeding ecology: {diet_info[:200] if diet_info else 'Paleontological dietary adaptations cataloged in museum records.'}."
        elif valid_tone == "friendly":
            answer = f"Curious about what it ate? Here's the prehistoric feeding story of the {name}!\n\n{diet_info or desc}"
        else:
            answer = f"Paleo-Ecology & Trophic Adaptations:\n\n{diet_info or f'The specimen exhibit in {gallery} displays distinctive anatomical markers indicating specialized feeding behaviors.'}"

    # ── 8. ANATOMY / FEATURES ─────────────────────────────────────────────────
    elif intent == "anatomy":
        anat_info = ext.get("saber_fangs") or ext.get("jaw_mechanics") or ext.get("horns_and_frill") or ext.get("tusk_adaptation") or ext.get("skull_and_teeth") or ext.get("sound_barrier_break") or ext.get("airplane_design") or ext.get("propulsion") or ""
        if valid_tone == "concise":
            answer = f"Anatomical and structural features: {anat_info[:200] if anat_info else desc}."
        elif valid_tone == "friendly":
            answer = f"Look closely at the 3D model! These distinct features are what make the {name} iconic.\n\n{anat_info or desc}"
        else:
            answer = f"Morphological & Structural Analysis:\n\n{anat_info or desc}\n\nThese physical adaptations showcase the unique evolutionary or engineering specialization of the exhibit."

    # ── 9. MISSION / SPACEFLIGHT ──────────────────────────────────────────────
    elif intent == "mission":
        miss_info = ext.get("mission_and_crew") or ext.get("splashdown_and_recovery") or ext.get("flight_record") or ext.get("historic_milestones") or ext.get("deep_space_firsts") or ""
        if valid_tone == "concise":
            answer = f"Mission record: {miss_info[:220] if miss_info else desc}."
        elif valid_tone == "friendly":
            answer = f"The human and aerospace adventure behind the {name} is breathtaking!\n\n{miss_info or desc}"
        else:
            answer = f"Aerospace Mission & Flight Log:\n\n{miss_info or desc}\n\nPreserved in the Smithsonian National Air and Space Museum collection to document historic human spaceflight breakthroughs."

    # ── 10. COMPARATIVE INQUIRY ACROSS TOUR (PHASE D) ─────────────────────────
    elif intent == "comparison":
        if prior_artifact:
            prev_name = prior_artifact.get("name") or prior_artifact.get("title", "the previous exhibit")
            prev_period = prior_artifact.get("period", "its historical era")
            prev_gallery = prior_artifact.get("galleryName") or prior_artifact.get("gallery", "another museum gallery")
            prev_category = prior_artifact.get("category", "")
            prev_desc = prior_artifact.get("description", "")

            if valid_tone == "concise":
                answer = f"Comparison: The {name} ({period}, {gallery}) contrasts with the {prev_name} ({prev_period}, {prev_gallery}). While {prev_name} highlights {prev_category or 'prior museum themes'}, {name} represents {category}."
            elif valid_tone == "friendly":
                answer = f"What an insightful comparison across your museum journey!\n\nEarlier in your tour, you explored the {prev_name} from {prev_period} in {prev_gallery}. Now looking at the {name} from {period}, the differences are striking. While {prev_name} focuses on {prev_desc[:120] if prev_desc else 'a distinct chapter in our collection'}, {name} showcases {desc[:120]}!\n\nBoth exhibits show how human craftsmanship and technology evolve across epochs."
            else:
                answer = f"Comparative Curatorial Analysis: {name} vs. {prev_name}\n\n1. Chronological & Cultural Context:\n- {name}: Dating to {period}, preserved in {gallery}.\n- {prev_name}: Dating to {prev_period}, preserved in {prev_gallery}.\n\n2. Thematic & Functional Distinction:\nWhile the {prev_name} highlights {prev_desc[:150] if prev_desc else 'its historical period'}, the {name} exemplifies {desc[:150]}.\n\n3. Tour Synthesis:\nTogether, these two exhibits from your tour illustrate the continuous progression of materials, culture, and human innovation across distinct museum galleries."
        else:
            if valid_tone == "concise":
                answer = f"Comparative Analysis: The {name} represents {category} from {period}. Within {gallery}, it is distinguished by {desc[:160]}."
            elif valid_tone == "friendly":
                answer = f"Looking at how the {name} compares to other pieces in our collection is truly fascinating! Originating in {origin} during {period}, it stands apart because {desc[:160]}."
            else:
                answer = f"Comparative Collection Analysis:\n\nWithin the {gallery}, the {name} ({period}, {origin}) occupies a unique position in {category}.\n\nDistinctive Attributes:\n{desc}\n\nHistorical Contrast:\n{sig or 'Its unique preservation offers a distinct contrast to related artifacts in the museum archives.'}"

    # ── 11. WORD / CONCEPT INQUIRY ────────────────────────────────────
    elif intent == "word_concept":
        import re
        term_match = re.sub(r'^(what is an?|what does|what do|define|meaning of|explain the word|explain the concept of|what is meant by)\s+', '', question, flags=re.IGNORECASE)
        term_clean = re.sub(r'(\s+mean|\s+in\s+this\s+context|\?)+$', '', term_match, flags=re.IGNORECASE).strip()
        term = term_clean if len(term_clean) >= 2 else "this historical concept"

        if valid_tone == "concise":
            answer = f"In the context of the {name}, \"{term}\" refers to a fundamental historical, scientific, or cultural principle related to {category}. Specifically, it relates to how {desc[:160]}."
        elif valid_tone == "friendly":
            answer = f"Great question! When we explore the {name}, understanding \"{term}\" really opens up the story.\n\nIn historical and scientific studies, \"{term}\" refers to the key concept that influenced the creation, operation, or classification of this {category}. When you inspect this exhibit in {gallery}, you can observe this principle directly reflected in its design and historical context."
        else:
            answer = f"Conceptual & Terminological Analysis: \"{term}\"\n\nIn curatorial and scientific scholarship surrounding the {name}, the term \"{term}\" represents an essential principle. It contextualizes the historical era of {period} and the specialized craftsmanship or scientific breakthroughs associated with {category}.\n\nWithin this exhibit's documented record, this concept directly informs the function, symbolism, and physical composition documented by the {institution}."

    # ── 12. OVERVIEW (DEFAULT) ────────────────────────────────────────────────
    else:
        if valid_tone == "concise":
            answer = f"{name} ({period}, {origin}): {desc} {f'Significance: {sig[:150]}.' if sig else ''}".strip()
        elif valid_tone == "friendly":
            answer = f"Welcome to the {name}! This is one of the most beloved highlights in {gallery}.\n\n{desc}\n\nWhat makes this exhibit truly unforgettable is that {sig or 'it preserves an invaluable piece of our shared heritage for visitors across the globe.'}"
        else:
            top_insights = [f"{k.replace('_', ' ').title()}: {v}" for k, v in ext.items() if isinstance(v, str) and len(v) > 20]
            top_insight_text = f"\n\n{top_insights[0]}" if top_insights else ""
            answer = f"Curatorial Exhibit Overview:\n\nThe {name} is an extraordinary highlight of {gallery}, dating to {period} and originating from {origin}.\n\n{desc}{top_insight_text}\n\nHistorical Significance:\n{sig or 'A foundational piece of cultural and scientific heritage.'}"

    return answer + curator_note


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
                            "You are an expert, passionate AI museum curator and docent. "
                            "Ground your explanations in the verified museum record provided. "
                            "Deliver an engaging, eloquent, and story-driven dialogue."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=1024,
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
    return_followups: bool = False,
    prior_artifact: Optional[Dict[str, Any]] = None,
) -> Any:
    """
    Generates a grounded LLM answer using the supplied artifact's metadata and conversation history.

    :param question: Visitor question string
    :param artifact: Retrieved / selected artifact metadata dictionary
    :param history_text: Formatted string of recent conversation turns
    :param tone: Presentation style ('educational', 'concise', 'friendly')
    :param return_followups: If True, returns tuple (answer, suggested_followups: List[str])
    :param prior_artifact: Previously explored artifact in the visitor's tour (Phase D)
    :return: Grounded answer string (or tuple if return_followups=True)
    """
    keys = get_api_credentials()
    valid_tone = validate_tone(tone)
    tone_directive = TONE_DIRECTIVES[valid_tone]

    # Extract artifact context fields safely
    name        = artifact.get("name") or artifact.get("title", "Unknown Artifact")
    gallery     = artifact.get("galleryName") or artifact.get("gallery", "Museum Collection")
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

    # Format extended knowledge dictionary into clean bullet points
    ext_knowledge = artifact.get("extended_knowledge", {}) or {}
    ext_lines = []
    if isinstance(ext_knowledge, dict):
        for k, v in ext_knowledge.items():
            if isinstance(v, str):
                ext_lines.append(f"- {k.replace('_', ' ').title()}: {v}")
    extended_knowledge_text = "\n".join(ext_lines) if ext_lines else "None recorded."

    # Format curatorial notes snippet from readme
    readme_text = artifact.get("readme_text", "")
    curatorial_notes = (readme_text.strip()[:1500]) if isinstance(readme_text, str) and readme_text.strip() else "None recorded."

    # Format prior exhibit tour context (Phase D Cross-Exhibit Continuity)
    if prior_artifact:
        prev_name = prior_artifact.get("name") or prior_artifact.get("title", "Unknown Exhibit")
        prev_gallery = prior_artifact.get("galleryName") or prior_artifact.get("gallery", "Museum")
        prev_period = prior_artifact.get("period", "")
        prev_desc = (prior_artifact.get("description", "") or "")[:200]
        prior_exhibit_context = (
            f"Exhibit Name: {prev_name}\n"
            f"Gallery: {prev_gallery}\n"
            f"Period: {prev_period}\n"
            f"Summary: {prev_desc}...\n"
            f"Guidance: The visitor previously explored this exhibit during their tour. If they ask to compare or reflect on their journey, bridge connections naturally between {name} and {prev_name}."
        )
    else:
        prior_exhibit_context = "None (this is the visitor's first or only recorded exhibit in this tour session)."

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
        extended_knowledge=extended_knowledge_text,
        curatorial_notes=curatorial_notes,
        prior_exhibit_context=prior_exhibit_context,
        history=history_text if history_text else "None (first interaction)",
        question=question,
    )

    raw_response = None

    # Priority 1: Groq
    if keys["groq"]:
        try:
            raw_response = _call_groq(prompt, keys["groq"])
        except Exception as err:
            print(f"[LLM ERROR] Groq failed: {err}")
            raise RuntimeError(f"Groq LLM service error: {err}")

    # Priority 2: Gemini
    elif keys["gemini"]:
        try:
            print("[GEMINI] Request started")
            from google import genai
            client = genai.Client(api_key=keys["gemini"])
            res = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"temperature": 0.3, "max_output_tokens": 1024}
            )
            if res and res.text:
                print("[GEMINI] Response received")
                raw_response = res.text.strip()
            else:
                raise RuntimeError("Gemini returned empty response")
        except Exception as err:
            print(f"[LLM ERROR] Gemini failed: {err}")
            raise RuntimeError(f"Gemini LLM service error: {err}")

    # Priority 3: Rich deterministic fallback
    if not raw_response:
        print("[LLM WARNING] No API key configured (GROQ_API_KEY / GEMINI_API_KEY). Using rich fallback.")
        clean_answer = build_rich_fallback_answer(
            artifact,
            question=question,
            tone=valid_tone,
            prior_artifact=prior_artifact,
        )
        followups = generate_dynamic_followups(
            artifact,
            question=question,
            history=history_text,
            prior_artifact=prior_artifact,
        )
        if return_followups:
            return clean_answer, followups
        return clean_answer

    clean_answer, followups = extract_answer_and_followups(
        raw_response,
        artifact,
        question=question,
        history=history_text,
        prior_artifact=prior_artifact,
    )
    if return_followups:
        return clean_answer, followups
    return clean_answer
