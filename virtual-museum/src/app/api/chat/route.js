import { NextResponse } from "next/server";
import artifactsData from "@/data/artifacts.json";

function generateDynamicFollowups(artifact, question = "", history = [], relatedArtifacts = [], priorArtifact = null) {
  const name = artifact.name || "this exhibit";
  const cat = (artifact.category || "").toLowerCase();
  const period = artifact.period || "";
  const origin = artifact.origin || "";
  const q = (question || "").toLowerCase().trim();

  // Extract previously asked user questions from history to prevent repetitive prompts
  const priorQueries = new Set();
  if (Array.isArray(history)) {
    for (const h of history) {
      if (h.role === "user" && h.content) {
        priorQueries.add(h.content.toLowerCase().trim());
      }
    }
  } else if (typeof history === "string") {
    for (const line of history.split("\n")) {
      if (line.toLowerCase().includes("visitor") || line.toLowerCase().includes("user")) {
        const parts = line.split(":");
        if (parts.length > 1) priorQueries.add(parts.slice(1).join(":").toLowerCase().trim());
      }
    }
  }

  const candidates = [];

  // 1. INTENT: WHEN / DATE / CHRONOLOGY
  if (["when", "year", "date", "period", "era", "century", "age", "how old"].some((k) => q.includes(k))) {
    candidates.push(
      `What major historical events were occurring when the ${name} was created?`,
      `What tools and technology existed during ${period || "that era"} to produce this?`,
      `How has our understanding of the ${name} evolved since that time?`
    );
  }
  // 2. INTENT: PURPOSE / FUNCTION / OPERATION
  else if (["used for", "purpose", "function", "how did it work", "how does it work", "role", "operate", "mission"].some((k) => q.includes(k))) {
    candidates.push(
      `Who were the primary individuals or specialists trained to use the ${name}?`,
      `What dangerous risks or obstacles were faced during its operation?`,
      `What subsequent invention or design eventually superseded the ${name}?`
    );
  }
  // 3. INTENT: SIGNIFICANCE / IMPORTANCE / LEGACY
  else if (["why is it important", "why important", "significance", "legacy", "famous", "impact", "matter"].some((k) => q.includes(k))) {
    candidates.push(
      `How did the ${name} influence future scientific discoveries or cultural movements?`,
      `How did our museum acquire and preserve this specimen?`,
      `What is the most remarkable story documented about this exhibit?`
    );
  }
  // 4. INTENT: MATERIALS / COMPOSITION / CRAFT
  else if (["material", "made of", "built", "composed", "crafted", "dimension", "weight", "anatomy", "texture"].some((k) => q.includes(k))) {
    candidates.push(
      `How do museum conservators preserve these delicate components?`,
      `What are the physical dimensions and weight of the ${name}?`,
      `Where did the creators source these specialized materials from?`
    );
  }
  // 5. INTENT: CREATOR / ARTIST / ORIGIN
  else if (["who made", "creator", "artist", "sculptor", "inventor", "origin", "where from", "where did"].some((k) => q.includes(k))) {
    candidates.push(
      `What other celebrated works or inventions were produced by this creator?`,
      `What was daily life like in ${origin || "its place of origin"} back then?`,
      `Did this piece receive immediate recognition during its time?`
    );
  }
  // 6. INTENT: WORD / CONCEPT / DEFINITION
  else if (["what is a", "what is an", "what does", "define", "meaning of", "explain the term", "concept"].some((k) => q.includes(k))) {
    candidates.push(
      `How does the ${name} directly demonstrate this principle?`,
      `What are other famous examples of this concept in the museum?`,
      `How has this concept developed in modern technology and scholarship?`
    );
  }
  // 7. DEFAULT / OVERVIEW
  else {
    candidates.push(
      `When was the ${name} created and what was happening in that era?`,
      `What was the primary function of the ${name} and how did it work?`,
      `What makes the ${name} a foundational highlight of this gallery?`
    );
  }

  // Category-specific deepening prompts
  if (cat.includes("space") || cat.includes("astronaut") || cat.includes("flight")) {
    candidates.push(`What specific engineering challenges did astronauts encounter with the ${name}?`);
  } else if (cat.includes("fossil") || cat.includes("paleontolog") || cat.includes("skeleton") || cat.includes("dinosaur")) {
    candidates.push(`What was the prehistoric ecosystem like when ${name} lived?`);
  } else if (cat.includes("sculpture") || cat.includes("pottery") || cat.includes("art")) {
    candidates.push(`What mythological or cultural symbolism is embedded in the ${name}?`);
  } else if (cat.includes("telegraph") || cat.includes("technology") || cat.includes("device")) {
    candidates.push(`How did the ${name} revolutionize communication across long distances?`);
  }

  // Comparative inquiry if prior artifact in tour is known (Phase D Tour Continuity)
  if (priorArtifact && priorArtifact.name) {
    candidates.push(`How does the ${name} compare to the ${priorArtifact.name} you explored earlier?`);
  } else if (Array.isArray(relatedArtifacts) && relatedArtifacts.length > 0) {
    const otherName = relatedArtifacts[0].artifact_name || relatedArtifacts[0].name;
    if (otherName) {
      candidates.push(`How does the ${name} compare to the ${otherName}?`);
    }
  }

  // Filter out candidates already asked in dialogue
  const filtered = [];
  for (const cand of candidates) {
    const candLower = cand.toLowerCase().trim();
    const alreadyAsked = Array.from(priorQueries).some(
      (pq) => candLower.includes(pq) || pq.includes(candLower)
    );
    if (!alreadyAsked && !filtered.includes(cand)) {
      filtered.push(cand);
    }
  }

  if (filtered.length < 3) {
    for (const backup of [
      `Why is the ${name} considered unique in world history?`,
      `What materials and craftsmanship were used to create it?`,
      `How does this exhibit connect to other artifacts in our collection?`,
    ]) {
      if (!filtered.includes(backup)) filtered.push(backup);
    }
  }

  return filtered.slice(0, 3);
}

function getDefaultFollowups(artifact) {
  return generateDynamicFollowups(artifact);
}

const OUT_OF_SCOPE_WORDS = [
  "weather", "forecast", "temperature", "rain", "snow", "math", "calculate",
  "multiply", "divide", "stocks", "stock", "crypto", "bitcoin", "president",
  "election", "movie", "song", "lyrics", "recipe", "pizza", "burger", "coffee",
  "salary", "job", "career"
];

function splitTextIntoSentences(text) {
  if (!text || typeof text !== "string") return [];
  const cleaned = text.replace(/\r\n/g, " ").replace(/\n/g, " ").trim();
  if (!cleaned) return [];
  const parts = cleaned.match(/[^.!?]+(?:[.!?]+["']?|$)/g) || [cleaned];
  return parts.map((s) => s.trim()).filter((s) => s.length > 0);
}

function groupSentencesIntoChunks(sentences, maxSentences = 3) {
  const chunks = [];
  let currentGroup = [];

  for (const sentence of sentences) {
    currentGroup.push(sentence);
    if (currentGroup.length >= maxSentences) {
      chunks.push(currentGroup.join(" "));
      currentGroup = [];
    }
  }

  if (currentGroup.length > 0) {
    if (chunks.length > 0 && currentGroup.length === 1) {
      chunks[chunks.length - 1] += " " + currentGroup[0];
    } else {
      chunks.push(currentGroup.join(" "));
    }
  }

  return chunks;
}

function chunkArtifactIntoPieces(artifact, maxSentences = 3) {
  const pieces = [];
  const name = artifact.name || "Exhibit";
  const category = artifact.category || "Museum Collection";

  const addSection = (sectionName, text) => {
    if (!text || typeof text !== "string") return;
    const sentences = splitTextIntoSentences(text);
    const chunkTexts = groupSentencesIntoChunks(sentences, maxSentences);
    for (const chunkText of chunkTexts) {
      pieces.push({
        section: sectionName,
        text: chunkText,
        anchoredText: `${name} (${category}) — ${sectionName}: ${chunkText}`,
      });
    }
  };

  // 1. Primary Description
  addSection("Overview & Description", artifact.description);

  // 2. Physical Specifications & Craftsmanship
  const aiCtx = artifact.aiContext || {};
  if (aiCtx.material || aiCtx.dimensions) {
    const matDimText = [
      aiCtx.material ? `Material: ${aiCtx.material}.` : "",
      aiCtx.dimensions ? `Dimensions: ${aiCtx.dimensions}.` : "",
    ].filter(Boolean).join(" ");
    addSection("Physical Specifications & Craftsmanship", matDimText);
  }

  // 3. Historical Significance
  if (aiCtx.historicalSignificance) {
    addSection("Historical Significance", aiCtx.historicalSignificance);
  }

  // 4. Curated Extended Knowledge
  const ext = artifact.extended_knowledge || {};
  for (const [key, val] of Object.entries(ext)) {
    if (typeof val === "string" && val.trim()) {
      const formattedTitle = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      addSection(formattedTitle, val);
    }
  }

  if (pieces.length === 0) {
    pieces.push({
      section: "Curated Overview",
      text: artifact.description || `${name} is an artifact in our collection.`,
      anchoredText: `${name} (${category}): ${artifact.description || ""}`,
    });
  }

  return pieces;
}

function computeAuthenticRelevanceScore(question, artifact) {
  const qLower = (question || "").toLowerCase();
  const isOutOfScope = OUT_OF_SCOPE_WORDS.some((w) => qLower.includes(w));
  const artName = artifact.name || "this exhibit";

  let groundedQ = (question || "").trim();
  if (!isOutOfScope && !groundedQ.toLowerCase().includes(artName.toLowerCase())) {
    groundedQ = groundedQ.replace(/\b(this artifact|this exhibit|this object|this piece|this|it)\b/gi, "the " + artName);
    if (groundedQ.toLowerCase() === (question || "").trim().toLowerCase()) {
      groundedQ = (question || "").trim().replace(/\?+$/, "") + " regarding " + artName;
    }
  }

  const tokenize = (text) =>
    (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !["the", "is", "at", "which", "on", "and", "a", "an", "in", "to", "of", "for", "with"].includes(w));

  const qTokens = tokenize(groundedQ);
  if (qTokens.length === 0) {
    return {
      score: 0.5000,
      evidence: artifact.description || "",
      section: "Overview",
    };
  }

  const qFreq = {};
  for (const t of qTokens) qFreq[t] = (qFreq[t] || 0) + 1;

  let qMagSq = 0;
  for (const t in qFreq) qMagSq += qFreq[t] * qFreq[t];

  // Evaluate against 2-3 sentence chunks instead of monolithic blob
  const pieces = chunkArtifactIntoPieces(artifact, 3);
  let bestScore = -1;
  let bestPiece = pieces[0];

  for (const piece of pieces) {
    const dTokens = tokenize(piece.anchoredText);
    if (dTokens.length === 0) continue;

    const dFreq = {};
    for (const t of dTokens) dFreq[t] = (dFreq[t] || 0) + 1;

    let dotProduct = 0;
    let dMagSq = 0;

    for (const t in qFreq) {
      if (dFreq[t]) dotProduct += qFreq[t] * dFreq[t];
    }
    for (const t in dFreq) {
      dMagSq += dFreq[t] * dFreq[t];
    }

    const cosine = (qMagSq > 0 && dMagSq > 0)
      ? dotProduct / (Math.sqrt(qMagSq) * Math.sqrt(dMagSq))
      : 0;

    const uniqueQ = Object.keys(qFreq);
    let matchedTerms = 0;
    for (const t of uniqueQ) {
      if (dFreq[t]) matchedTerms++;
    }
    const coverage = uniqueQ.length > 0 ? matchedTerms / uniqueQ.length : 0;
    const chunkScore = isOutOfScope ? Math.min(coverage, 0.08) : (0.65 * coverage + 0.35 * Math.min(cosine * 6, 1.0));

    if (chunkScore > bestScore) {
      bestScore = chunkScore;
      bestPiece = piece;
    }
  }

  const finalScore = parseFloat(Math.min(Math.max(bestScore, 0.05), 0.98).toFixed(4));
  return {
    score: finalScore,
    evidence: bestPiece?.text || artifact.description || "",
    section: bestPiece?.section || "Overview",
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { artifact_id, question, history, tone, visited_artifacts } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "Question cannot be empty." },
        { status: 400 }
      );
    }

    const q = question.toLowerCase().trim();

    // Find the target artifact by ID or search by name
    let artifact = artifactsData.find((a) => a.id === artifact_id);
    if (!artifact) {
      // Fallback: match by name or keywords
      artifact = artifactsData.find(
        (a) =>
          q.includes(a.name.toLowerCase()) ||
          q.includes((a.title || "").toLowerCase()) ||
          (a.category && q.includes(a.category.toLowerCase()))
      ) || artifactsData[0];
    }

    // Phase D: Track visitor's museum tour history & identify prior artifact
    const visitedList = Array.isArray(visited_artifacts) ? [...visited_artifacts] : [];
    if (artifact?.id && !visitedList.includes(artifact.id)) {
      visitedList.push(artifact.id);
    }

    let priorArtifact = null;
    for (let i = visitedList.length - 1; i >= 0; i--) {
      if (visitedList[i] !== artifact?.id) {
        priorArtifact = artifactsData.find((a) => a.id === visitedList[i]) || null;
        if (priorArtifact) break;
      }
    }

    const tourProgress = {
      visited_count: visitedList.length,
      total_artifacts: artifactsData.length,
      percent_completed: Math.round((visitedList.length / artifactsData.length) * 100),
      prior_artifact_name: priorArtifact ? priorArtifact.name : null,
    };

    const ext = artifact.extended_knowledge || {};
    const aiCtx = artifact.aiContext || {};
    const readme = artifact.readme_text || "";

    let answer = "";
    const relevance = computeAuthenticRelevanceScore(question, artifact);
    const confidence = relevance.score;
    const chunkEvidence = relevance.evidence;
    const sources = [
      artifact.source || "Smithsonian Institution (NMNH / SAAM / NASM)",
      artifact.institution || "National Museum Collection"
    ];

    // Format conversation history
    let formattedHistory = "None (first interaction)";
    if (Array.isArray(history) && history.length > 0) {
      formattedHistory = history
        .map((h) => `${h.role === "user" ? "Visitor" : "Curator"}: ${h.content}`)
        .join("\n");
    } else if (typeof history === "string" && history.trim()) {
      formattedHistory = history.trim();
    }

    // Check if user has a Gemini API key configured in env
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      try {
        const toneStyle =
          tone === "concise"
            ? "Give a direct, key-facts-only museum answer in 2 to 3 well-crafted sentences."
            : tone === "friendly"
            ? "Provide a warm, enthusiastic, engaging, and welcoming museum guide response that brings the history alive."
            : "Provide an immersive, scholarly, and captivating museum curator narrative with deep cultural, technical, and historical context.";

        const priorExhibitText = priorArtifact
          ? `Exhibit Name: ${priorArtifact.name}\nGallery: ${priorArtifact.galleryName || priorArtifact.gallery}\nPeriod: ${priorArtifact.period}\nSummary: ${(priorArtifact.description || "").slice(0, 200)}...\nGuidance: Visitor previously explored this artifact during this tour. If asked for comparison or tour reflections, bridge connections between ${artifact.name} and ${priorArtifact.name}.`
          : "None (this is the visitor's first or only recorded exhibit in this tour session).";

        const prompt = `You are the Expert Museum Curator of the 3D Virtual Heritage Museum.
Answer the visitor's specific question about the following exhibit accurately, eloquently, and engagingly using the provided museum evidence.
Engage the visitor in an authentic, conversational dialogue. When conversation history is present, naturally acknowledge it and build on earlier topics.

VISITOR QUESTION FOCUS:
Address specifically what the visitor is asking. If they ask about when it was created, focus directly on the date and era; if they ask about what it was used for, focus on function; if they ask about historical significance, focus on impact.

ADDITIONAL KNOWLEDGE FOR WORDS / CONCEPTS:
If the visitor asks for the definition, meaning, or additional knowledge regarding a specific word, concept, or term related to the exhibit (e.g. 'What is a pressure suit?', 'What does Cincinnatus mean?', 'What is induction?'), you may draw upon broader historical and scientific knowledge to define and explain the term in relation to the exhibit. However, you MUST conclude that explanation with:
*(Curator's Note: This explanation draws upon broader historical and scientific knowledge beyond our primary museum catalog record.)*

REQUESTED TONE:
${toneStyle}

EXHIBIT EVIDENCE:
- ID: ${artifact.id}
- Name: ${artifact.name}
- Category: ${artifact.category}
- Period: ${artifact.period}
- Origin: ${artifact.origin || "Not specified"}
- Institution: ${artifact.institution}
- Description: ${artifact.description}
- Historical Significance: ${aiCtx.historicalSignificance || ""}
- Materials & Dimensions: ${aiCtx.material || ""}, ${aiCtx.dimensions || ""}
- Detailed Knowledge Base: ${JSON.stringify(ext, null, 2)}
- Curatorial Notes: ${readme.slice(0, 1500)}

PRIOR EXHIBIT EXPLORED IN TOUR:
${priorExhibitText}

RECENT CONVERSATION HISTORY:
${formattedHistory}

VISITOR QUESTION: "${question}"

At the very end of your response, provide exactly 2 to 3 engaging follow-up questions for the visitor formatted as:
SUGGESTED_FOLLOWUPS:
- <Follow-up question 1>
- <Follow-up question 2>
- <Follow-up question 3>`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1024,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const generatedText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            let cleanAnswer = generatedText.trim();
            let suggested_followups = [];

            if (cleanAnswer.includes("SUGGESTED_FOLLOWUPS:")) {
              const [ansPart, followupPart] = cleanAnswer.split("SUGGESTED_FOLLOWUPS:");
              cleanAnswer = ansPart.trim();
              suggested_followups = followupPart
                .split("\n")
                .map((l) => l.replace(/^[-*•0-9.]+\s*/, "").trim())
                .filter((l) => l.length > 5)
                .map((l) => (l.endsWith("?") ? l : l + "?"));
            }

            if (suggested_followups.length < 2) {
              suggested_followups = generateDynamicFollowups(artifact, question, history, [], priorArtifact);
            }

            const related_suggestions = artifactsData
              .filter((a) => a.id !== artifact.id)
              .slice(0, 3)
              .map((a) => ({
                artifact_id: a.id,
                artifact_name: a.name,
                gallery: a.galleryName || a.gallery || "Smithsonian Collection",
              }));

            return NextResponse.json({
              answer: cleanAnswer,
              source: {
                artifact: artifact.name,
                gallery: artifact.galleryName || artifact.gallery || "Smithsonian Collection",
              },
              sources,
              evidence: chunkEvidence,
              confidence: confidence,
              refused: false,
              artifact_id: artifact.id,
              artifact_name: artifact.name,
              related_suggestions,
              suggested_followups: suggested_followups.slice(0, 3),
              visited_artifacts: visitedList,
              tour_progress: tourProgress,
            });
          }
        }
      } catch (geminiErr) {
        console.warn("[Chat API] Gemini generation fallback to local RAG:", geminiErr);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Intelligent Question-Intent & Tone Synthesizer (Zero-Latency Local Engine)
    // ─────────────────────────────────────────────────────────────────────────────
    const validTone = ["concise", "friendly", "educational"].includes(tone) ? tone : "educational";
    const name = artifact.name || "this exhibit";
    const cat = artifact.category || "Museum Artifact";
    const gallery = artifact.galleryName || artifact.gallery || "Smithsonian Collection";
    const period = artifact.period || "Historical Period";
    const origin = artifact.origin || "Historical Provenance";
    const artist = artifact.artist || "";
    const desc = artifact.description || "";
    const sig = aiCtx.historicalSignificance || ext.historical_significance || ext.significance || "";
    const mat = aiCtx.material || ext.material_and_technique || ext.dimensions_and_materials || "";
    const dims = aiCtx.dimensions || ext.dimensions_and_materials || ext.size_and_mass || ext.specifications || "";

    // 1. Check if asking for definition / word meaning / external concept
    const isWordQuery = Boolean(
      q.startsWith("what is a ") || q.startsWith("what is an ") ||
      q.includes(" mean") || q.startsWith("define ") || q.startsWith("meaning of ") ||
      q.startsWith("explain the word ") || q.startsWith("explain the concept ") ||
      q.startsWith("what does ") || q.startsWith("what is meant by ")
    );

    let intent = "overview";
    let curatorNote = "";

    if (isWordQuery) {
      intent = "word_concept";
      curatorNote = "\n\n*(Curator's Note: This explanation draws upon broader historical and scientific knowledge beyond our primary museum catalog record.)*";
    } else if (
      q.includes("when") || q.includes("create") || q.includes("date") || q.includes("period") ||
      q.includes("era") || q.includes("age") || q.includes("year") || q.includes("dynasty") ||
      q.includes("epoch") || q.includes("how old") || q.includes("century") || q.includes("timeline")
    ) {
      intent = "when";
    } else if (
      q.includes("used for") || q.includes("purpose") || q.includes("function") ||
      q.includes("how does it work") || q.includes("how did it work") || q.includes("operation") ||
      q.includes("what did it do") || q.includes("what was it for") || q.includes("mechanism") ||
      q.includes("operate") || q.includes("utility") || q.includes("role")
    ) {
      intent = "purpose";
    } else if (
      q.includes("important") || q.includes("significan") || q.includes("why in museum") ||
      q.includes("legacy") || q.includes("value") || q.includes("special") || q.includes("matter") ||
      q.includes("famous") || q.includes("why care") || q.includes("milestone") || q.includes("achievement")
    ) {
      intent = "significance";
    } else if (
      q.includes("who made") || q.includes("who built") || q.includes("who created") ||
      q.includes("artist") || q.includes("creator") || q.includes("sculptor") ||
      q.includes("inventor") || q.includes("architect") || q.includes("collector") ||
      q.includes("who designed") || q.includes("maker")
    ) {
      intent = "creator";
    } else if (
      q.includes("where") || q.includes("found") || q.includes("origin") || q.includes("site") ||
      q.includes("excavat") || q.includes("bonebed") || q.includes("tar pit") ||
      q.includes("quarry") || q.includes("provenance") || q.includes("come from")
    ) {
      intent = "origin";
    } else if (
      q.includes("material") || q.includes("made of") || q.includes("craft") || q.includes("medium") ||
      q.includes("dimension") || q.includes("weight") || q.includes("weigh") || q.includes("heavy") ||
      q.includes("size") || q.includes("mass") || q.includes("metal") || q.includes("marble") ||
      q.includes("bronze") || q.includes("stone") || q.includes("specs")
    ) {
      intent = "materials";
    } else if (
      q.includes("eat") || q.includes("diet") || q.includes("food") || q.includes("prey") ||
      q.includes("hunt") || q.includes("herbivore") || q.includes("carnivore") || q.includes("seagrass")
    ) {
      intent = "diet";
    } else if (
      q.includes("tooth") || q.includes("teeth") || q.includes("fang") || q.includes("horn") ||
      q.includes("frill") || q.includes("jaw") || q.includes("skull") || q.includes("tusk") ||
      q.includes("engine") || q.includes("propulsion") || q.includes("speed")
    ) {
      intent = "anatomy";
    } else if (
      q.includes("crew") || q.includes("astronaut") || q.includes("mission") ||
      q.includes("flight") || q.includes("space") || q.includes("moon") || q.includes("orbit")
    ) {
      intent = "mission";
    } else {
      const otherArtifact = artifactsData.find(
        (a) => a.id !== artifact.id && (
          q.includes(a.name.toLowerCase()) ||
          q.includes(a.id.toLowerCase())
        )
      );
      if (otherArtifact && (q.includes("compare") || q.includes("versus") || q.includes(" vs ") || q.includes("differ") || q.includes("unlike"))) {
        intent = "comparison";
      } else {
        intent = "overview";
      }
    }

    // Synthesize content based on intent and tone
    let primaryText = "";

    // ── INTENT: WHEN WAS IT CREATED / PERIOD / AGE ──────────────────────────
    if (intent === "when") {
      const chronologyDetails = ext.dynasty_and_period || ext.age_and_formation || ext.chronology_and_extinction || ext.inventor_and_date || ext.flight_record || ext.deep_space_firsts || "";
      if (validTone === "concise") {
        primaryText = `The ${name} dates to ${period}${origin ? ` and originated in ${origin}` : ""}.${chronologyDetails ? ` Chronological context: ${chronologyDetails.slice(0, 160)}.` : ""}`;
      } else if (validTone === "friendly") {
        primaryText = `Step back in time! The ${name} dates to ${period}${origin ? `, hailing from ${origin}` : ""}.\n\nWhat makes this era so captivating is how it reflects the pinnacle of ${cat}. ${chronologyDetails || `It represents a momentous time in human history preserved here in ${gallery}.`}`;
      } else {
        primaryText = `Chronological & Historical Context:\n\nThe ${name} was created in ${period}${origin ? `, with geographic origin in ${origin}` : ""}. As a marquee exhibit in ${gallery}, it provides scholars and visitors an authentic window into that era.\n\n${chronologyDetails ? `Historical Timeline Details:\n${chronologyDetails}` : `Dating from ${period}, this specimen represents a critical benchmark in the study of ${cat}.`}`;
      }
    }

    // ── INTENT: WHAT WAS IT USED FOR / PURPOSE / FUNCTION ───────────────────
    else if (intent === "purpose") {
      const purposeDetails = ext.religious_and_ritual_use || ext.mission_and_crew || ext.engineering_details || ext.sound_barrier_break || ext.propulsion || ext.life_support || ext.hunting_style || ext.defense_and_combat || ext.scientific_breakthrough || ext.first_transmission || ext.symposium_culture || "";
      if (validTone === "concise") {
        primaryText = `The ${name} was designed and utilized for: ${purposeDetails ? purposeDetails.slice(0, 200) : desc}.`;
      } else if (validTone === "friendly") {
        primaryText = `Fascinating question! The ${name} had an indispensable real-world role.\n\n${purposeDetails || desc}\n\nSeeing it up close in 3D truly highlights the ingenuity that went into its everyday function!`;
      } else {
        primaryText = `Functional Purpose & Operational Role:\n\nThe ${name} served a vital function in its historical and technical domain.\n\n${purposeDetails ? `Operational Breakdown:\n${purposeDetails}` : `Primary Application:\n${desc}`}\n\nIts design exemplifies the pragmatic and cultural requirements of ${cat} in ${gallery}.`;
      }
    }

    // ── INTENT: WHY IS IT IMPORTANT / SIGNIFICANCE / LEGACY ─────────────────
    else if (intent === "significance") {
      const sigDetails = sig || ext.historic_milestones || ext.impact_on_civilization || ext.deep_space_firsts || ext.significance || "";
      if (validTone === "concise") {
        primaryText = `The ${name} is of paramount historical importance: ${sigDetails.slice(0, 220)}.`;
      } else if (validTone === "friendly") {
        primaryText = `This is truly one of the crown jewels of our museum collection! The ${name} is important because ${sigDetails || desc}.\n\nIt continues to inspire historians, scientists, and visitors from around the world.`;
      } else {
        primaryText = `Curatorial Significance & Cultural Legacy:\n\nThe ${name} holds profound historical and scientific significance.\n\n${sigDetails}\n\nWithin the ${gallery}, it stands as an enduring benchmark of human achievement and natural history.`;
      }
    }

    // ── INTENT: WHO MADE IT / ARTIST / CREATOR / DISCOVERER ─────────────────
    else if (intent === "creator") {
      const creatorDetails = ext.biography_and_artist || ext.sculptor_and_commission || ext.inventors || ext.specimen_and_collector || ext.astronaut_and_flight || "";
      const creatorName = artist || (artifact.institution ? `curated by ${artifact.institution}` : "historic creators");
      if (validTone === "concise") {
        primaryText = `The ${name} is attributed to ${creatorName}.${creatorDetails ? ` ${creatorDetails.slice(0, 180)}.` : ""}`;
      } else if (validTone === "friendly") {
        primaryText = `Let's talk about the remarkable minds behind this! The ${name} is attributed to ${creatorName}.\n\n${creatorDetails || `Their work represents a groundbreaking contribution to ${cat}.`}`;
      } else {
        primaryText = `Creator Biography & Historical Authorship:\n\nThe ${name} is credited to ${creatorName}.\n\n${creatorDetails ? `Biographical Context:\n${creatorDetails}` : `Documented in museum archives under ${cat}, this work highlights extraordinary artistry and innovation.`}`;
      }
    }

    // ── INTENT: WHERE WAS IT FOUND / ORIGIN / DISCOVERY SITE ────────────────
    else if (intent === "origin") {
      const siteDetails = ext.discovery_and_site || ext.specimen_and_discovery || ext.tar_pits_preservation || ext.provenance || ext.specimen_and_origin || "";
      if (validTone === "concise") {
        primaryText = `The ${name} originated from ${origin}.${siteDetails ? ` Site details: ${siteDetails.slice(0, 180)}.` : ""}`;
      } else if (validTone === "friendly") {
        primaryText = `The journey of the ${name} began in ${origin}!\n\n${siteDetails || `It was preserved and safely transported to ${artifact.institution || "our museum"} to be shared with the public.`}`;
      } else {
        primaryText = `Geographic Origin & Discovery Provenance:\n\nOfficial records trace the ${name} to ${origin}.\n\n${siteDetails ? `Excavation & Field Record:\n${siteDetails}` : `Preservation History:\nAcquired and conserved in accordance with Smithsonian archival standards for ${cat}.`}`;
      }
    }

    // ── INTENT: MATERIALS / MADE OF / DIMENSIONS ────────────────────────────
    else if (intent === "materials") {
      const matDetails = ext.material_and_technique || ext.dimensions_and_materials || ext.size_and_mass || ext.thermal_protection || ext.pottery_technique || "";
      if (validTone === "concise") {
        primaryText = `Materials: ${mat || "Composite museum materials"}. Dimensions: ${dims || "Standard archival dimensions"}.${matDetails ? ` Technique: ${matDetails.slice(0, 150)}.` : ""}`;
      } else if (validTone === "friendly") {
        primaryText = `The craftsmanship on the ${name} is extraordinary! It is made of ${mat || "specialized materials"} with dimensions measuring ${dims || "impressive proportions"}.\n\n${matDetails || "Every surface tells a story of meticulous engineering and master craftsmanship."}`;
      } else {
        primaryText = `Physical Specifications & Material Composition:\n\n- Primary Material: ${mat || "Specialized medium"}\n- Physical Dimensions: ${dims || "Cataloged scale"}\n\nTechnical Craftsmanship:\n${matDetails || `Constructed in accordance with the finest standards of ${cat}.`}`;
      }
    }

    // ── INTENT: DIET / ECOLOGY / WHAT DID IT EAT ─────────────────────────────
    else if (intent === "diet") {
      const dietDetails = ext.diet_and_ecosystem || ext.diet_and_size || ext.hunting_style || ext.bite_force || ext.molar_dentition || "";
      if (validTone === "concise") {
        primaryText = `Diet and feeding ecology: ${dietDetails ? dietDetails.slice(0, 200) : "Paleontological dietary adaptations cataloged in museum records."}`;
      } else if (validTone === "friendly") {
        primaryText = `Curious about what it ate? Here's the prehistoric feeding story of the ${name}!\n\n${dietDetails || desc}`;
      } else {
        primaryText = `Paleo-Ecology & Trophic Adaptations:\n\n${dietDetails ? dietDetails : `The specimen exhibit in ${gallery} displays distinctive anatomical markers indicating specialized feeding behaviors.`}`;
      }
    }

    // ── INTENT: ANATOMY / HORNS / TEETH / ENGINE ────────────────────────────
    else if (intent === "anatomy") {
      const anatDetails = ext.saber_fangs || ext.jaw_mechanics || ext.horns_and_frill || ext.tusk_adaptation || ext.skull_and_teeth || ext.sound_barrier_break || ext.airplane_design || ext.propulsion || "";
      if (validTone === "concise") {
        primaryText = `Anatomical & mechanical features: ${anatDetails ? anatDetails.slice(0, 200) : desc}.`;
      } else if (validTone === "friendly") {
        primaryText = `Look closely at the 3D model! These distinct features are what make the ${name} iconic.\n\n${anatDetails || desc}`;
      } else {
        primaryText = `Morphological & Structural Analysis:\n\n${anatDetails ? anatDetails : desc}\n\nThese physical adaptations showcase the unique evolutionary or engineering specialization of the exhibit.`;
      }
    }

    // ── INTENT: MISSION / CREW / SPACEFLIGHT ────────────────────────────────
    else if (intent === "mission") {
      const missionDetails = ext.mission_and_crew || ext.splashdown_and_recovery || ext.flight_record || ext.historic_milestones || ext.deep_space_firsts || "";
      if (validTone === "concise") {
        primaryText = `Mission record: ${missionDetails ? missionDetails.slice(0, 220) : desc}.`;
      } else if (validTone === "friendly") {
        primaryText = `The human and aerospace adventure behind the ${name} is breathtaking!\n\n${missionDetails || desc}`;
      } else {
        primaryText = `Aerospace Mission & Flight Log:\n\n${missionDetails ? missionDetails : desc}\n\nPreserved in the Smithsonian National Air and Space Museum collection to document historic human spaceflight breakthroughs.`;
      }
    }

    // ── INTENT: WORD / CONCEPT INQUIRY (ADDITIONAL KNOWLEDGE) ───────────────
    else if (intent === "word_concept") {
      // Determine what word or concept is being asked about
      let term = question.replace(/^(what is an?|what does|what do|define|meaning of|explain the word|explain the concept of|what is meant by)\s+/i, "").replace(/(\s+mean|\s+in\s+this\s+context|\?)+$/i, "").trim();
      if (!term || term.length < 2) term = "this historical concept";

      if (validTone === "concise") {
        primaryText = `In the context of the ${name}, "${term}" refers to a fundamental historical, scientific, or cultural principle related to ${cat}. Specifically, it relates to how ${desc.slice(0, 160)}.`;
      } else if (validTone === "friendly") {
        primaryText = `Great question! When we explore the ${name}, understanding "${term}" really opens up the story.\n\nIn historical and scientific studies, "${term}" refers to the key concept that influenced the creation, operation, or classification of this ${cat}. When you inspect this exhibit in ${gallery}, you can observe this principle directly reflected in its design and historical context.`;
      } else {
        primaryText = `Conceptual & Terminological Analysis: "${term}"\n\nIn curatorial and scientific scholarship surrounding the ${name}, the term "${term}" represents an essential principle. It contextualizes the historical era of ${period} and the specialized craftsmanship or scientific breakthroughs associated with ${cat}.\n\nWithin this exhibit's documented record, this concept directly informs the function, symbolism, and physical composition documented by the ${artifact.institution || "National Museum"}.`;
      }
    }

    // ── INTENT: COMPARISON ("Compare with ...") ─────────────────────────────
    else if (intent === "comparison") {
      let otherArtifact = artifactsData.find(
        (a) => a.id !== artifact.id && (
          q.includes(a.name.toLowerCase()) ||
          q.includes(a.id.toLowerCase())
        )
      );
      if (!otherArtifact && priorArtifact) {
        otherArtifact = priorArtifact;
      }

      if (otherArtifact) {
        if (validTone === "concise") {
          primaryText = `Comparative Analysis: While the ${name} (${period}) served as ${desc.slice(0, 120)}..., the ${otherArtifact.name} (${otherArtifact.period}) represents ${otherArtifact.description.slice(0, 120)}... Both showcase complementary historical breakthroughs in ${gallery}.`;
        } else if (validTone === "friendly") {
          primaryText = `What a wonderful comparison across your museum tour! Placing the ${name} alongside the ${otherArtifact.name} reveals an inspiring contrast:\n\n• The ${name} dates to ${period} and highlights ${sig || "its historic significance and craftsmanship"}.\n• Meanwhile, the ${otherArtifact.name} from ${otherArtifact.period} highlights ${otherArtifact.aiContext?.historicalSignificance || otherArtifact.description}.\n\nTogether, they show how human achievement and scientific discovery advanced across our museum collections!`;
        } else {
          primaryText = `Curatorial Comparative Analysis: ${name} vs. ${otherArtifact.name}\n\n1. Chronological & Cultural Milestones:\nThe ${name} originates from ${origin} (${period}), whereas the ${otherArtifact.name} represents ${otherArtifact.origin || "its historical epoch"} (${otherArtifact.period}).\n\n2. Functional & Material Contrast:\nWhile the ${name} was created for "${desc.slice(0, 160)}", the ${otherArtifact.name} embodies "${otherArtifact.description.slice(0, 160)}".\n\n3. Curatorial Tour Synthesis:\nExamining both exhibits together illuminates the broader technological and aesthetic transitions that define this museum tour.`;
        }
      } else {
        primaryText = `Curatorial Overview: The ${name} is an extraordinary centerpiece of ${gallery}, dating to ${period}. ${desc}`;
      }
    }

    // ── INTENT: OVERVIEW / DEFAULT ("What is this?", "Tell me more") ────────
    else {
      if (validTone === "concise") {
        primaryText = `${name} (${period}, ${origin}): ${desc} ${sig ? `Significance: ${sig.slice(0, 150)}.` : ""}`.trim();
      } else if (validTone === "friendly") {
        primaryText = `Welcome to the ${name}! This is one of the most beloved highlights in ${gallery}.\n\n${desc}\n\nWhat makes this exhibit truly unforgettable is that ${sig || "it preserves an invaluable piece of our shared heritage for visitors across the globe."}`;
      } else {
        const extValues = Object.entries(ext);
        const topInsight = extValues.length > 0 ? `\n\n${extValues[0][0].replace(/_/g, " ").toUpperCase()}:\n${extValues[0][1]}` : "";
        primaryText = `Curatorial Exhibit Overview:\n\nThe ${name} is an extraordinary highlight of ${gallery}, dating to ${period} and originating from ${origin}.\n\n${desc}${topInsight}\n\nHistorical Significance:\n${sig || "A foundational piece of cultural and scientific heritage."}`;
      }
    }

    // Append Curator Note if this drew upon broader knowledge
    answer = primaryText + curatorNote;

    const related_suggestions = artifactsData
      .filter((a) => a.id !== artifact.id)
      .slice(0, 3)
      .map((a) => ({
        artifact_id: a.id,
        artifact_name: a.name,
        gallery: a.galleryName || a.gallery || "Smithsonian Collection",
      }));

    const suggested_followups = generateDynamicFollowups(
      artifact,
      question,
      history,
      related_suggestions,
      priorArtifact
    );

    return NextResponse.json({
      answer,
      source: {
        artifact: artifact.name,
        gallery: artifact.galleryName || artifact.gallery || "Smithsonian Collection",
      },
      sources,
      evidence: chunkEvidence,
      confidence: confidence,
      refused: false,
      artifact_id: artifact.id,
      artifact_name: artifact.name,
      period: artifact.period,
      origin: artifact.origin,
      related_suggestions,
      suggested_followups,
      visited_artifacts: visitedList,
      tour_progress: tourProgress,
    });
  } catch (error) {
    console.error("[Chat API Error]", error);
    return NextResponse.json(
      { error: "Internal curator pipeline error", details: error.message },
      { status: 500 }
    );
  }
}
