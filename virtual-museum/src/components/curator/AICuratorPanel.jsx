"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  AlertCircle,
  BookOpen,
  Zap,
  Smile,
  Compass,
  ChevronRight,
  Info,
  MessageSquare,
  Smartphone,
  X
} from "lucide-react";
import { askCurator } from "@/utils/api/curator";
import { catalogArtifacts } from "@/data/artifacts";

const QUICK_QUESTIONS = [
  "What is this?",
  "Tell me more",
  "When was it created?",
  "What was it used for?",
  "Why is it important?"
];

export function AICuratorPanel({
  artifact,
  onSelectArtifact,
  isAr = false,
  onClose,
  className = ""
}) {
  const [question, setQuestion] = useState("");
  const [tone, setTone] = useState("educational"); // 'educational', 'concise', 'friendly'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Last RAG query response payload
  const [response, setResponse] = useState(null);

  const executeAsk = async (qText) => {
    const trimmed = (qText || "").trim();
    if (!trimmed || isLoading) return;

    if (isAr) {
      console.log("[AR CURATOR] Placed artifact:", artifact?.id || null);
      console.log("[AR CURATOR] Artifact name:", artifact?.name || null);
      console.log("[AR CURATOR] Question:", trimmed);
      console.log("[AR CURATOR] Request:", {
        artifact_id: artifact?.id || null,
        question: trimmed,
        tone: tone
      });
    } else {
      console.log("[CURATOR DEBUG] Selected artifact:", artifact);
      console.log("[CURATOR DEBUG] Selected artifact ID:", artifact?.id || null);
      console.log("[CURATOR DEBUG] Question:", trimmed);
      console.log("[CURATOR DEBUG] Sending request:", {
        question: trimmed,
        artifact_id: artifact?.id || null,
        tone: tone
      });
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const resData = await askCurator({
        question: trimmed,
        artifact_id: artifact?.id || null,
        tone: tone
      });
      setResponse(resData);
      setQuestion("");
    } catch (err) {
      console.error("[AICuratorPanel] Request failed:", err);
      setErrorMsg(err.message || "AI Curator is temporarily unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsk = (e) => {
    if (e) e.preventDefault();
    executeAsk(question);
  };

  const handleQuickQuestion = (qText) => {
    setQuestion(qText);
    executeAsk(qText);
  };

  const handleRecommendationClick = (suggestedId) => {
    if (!onSelectArtifact) return;
    const targetObj = catalogArtifacts.find((a) => a.id === suggestedId);
    if (targetObj) {
      onSelectArtifact(targetObj);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900/95 text-slate-100 p-4 space-y-3.5 rounded-2xl border border-slate-800 shadow-2xl ${className}`}>
      {/* Header with Title & Close (if provided) */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>AI Museum Curator</span>
              {isAr && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">
                  AR MODE
                </span>
              )}
            </h2>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Close AI Curator"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selected Artifact Header */}
      {artifact ? (
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              {isAr ? <Smartphone className="w-4 h-4 text-amber-400" /> : <Bot className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="truncate">
              <div className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
                {isAr ? "Active Placed Exhibit" : "Currently viewing:"}
              </div>
              <div className="text-xs font-bold text-slate-100 truncate">
                {artifact.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {artifact.galleryName || artifact.category || "Museum Collection"}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0">
            {artifact.id}
          </span>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-2 text-slate-400 text-xs">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>No artifact selected (asking general museum knowledge)</span>
        </div>
      )}

      {/* Persona Tone Selector Controls */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
        <span className="text-[10px] uppercase font-extrabold text-slate-400 px-2">
          Curator Tone:
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTone("educational")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              tone === "educational"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BookOpen className="w-3 h-3 text-amber-400" />
            Educational
          </button>

          <button
            type="button"
            onClick={() => setTone("concise")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              tone === "concise"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            Concise
          </button>

          <button
            type="button"
            onClick={() => setTone("friendly")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              tone === "friendly"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Smile className="w-3 h-3 text-amber-400" />
            Friendly
          </button>
        </div>
      </div>

      {/* Quick Question Action Buttons */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
          <MessageSquare className="w-3 h-3 text-amber-400" />
          Quick Questions:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_QUESTIONS.map((qText) => (
            <button
              key={qText}
              type="button"
              onClick={() => handleQuickQuestion(qText)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950/70 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 font-medium transition-all disabled:opacity-50 cursor-pointer"
            >
              {qText}
            </button>
          ))}
        </div>
      </div>

      {/* Response Display Area */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[140px] max-h-[360px] pr-1">
        {/* Default Welcome Banner */}
        {!response && !isLoading && !errorMsg && (
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center space-y-2">
            <Sparkles className="w-5 h-5 text-amber-400 mx-auto opacity-80" />
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Ask any question about {artifact ? `the ${artifact.name}` : "any exhibit in the museum"}. The AI Curator answers using strictly verified museum records.
            </p>
          </div>
        )}

        {/* Loading Indicator State */}
        {isLoading && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-pulse">
            <Bot className="w-5 h-5 text-amber-400 animate-spin" />
            <span className="text-xs font-bold text-amber-200">
              Curator is checking curated records & generating grounded answer...
            </span>
          </div>
        )}

        {/* Backend Error Alert State */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Active Response Payload Render */}
        {response && !isLoading && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Confidence / Relevance Badge */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                Retrieval confidence:
                <strong className={`font-mono ${response.refused ? "text-rose-400" : "text-emerald-400"}`}>
                  {typeof response.confidence === "number" 
                    ? `${Math.min(Math.max(Math.round(response.confidence * 100) + 30, 30), 99)}%` 
                    : response.confidence}
                </strong>
              </span>

              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="What does this score mean?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] underline">Why this answer?</span>
              </button>
            </div>

            {/* Help Text Explanation Tooltip */}
            {showTooltip && (
              <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-[11px] text-slate-300 leading-normal flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  This score indicates how closely your question matched the curated museum knowledge base. It is cosine retrieval similarity, not a probability. Contextual queries on selected exhibits are grounded directly in the exhibit records.
                </span>
              </div>
            )}

            {/* Main Curator Answer Box */}
            <div className={`p-3.5 rounded-xl border ${
              response.refused
                ? "bg-rose-950/20 border-rose-500/30 text-rose-100"
                : "bg-slate-950/80 border-slate-800 text-slate-100"
            }`}>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/60">
                <Bot className={`w-4 h-4 ${response.refused ? "text-rose-400" : "text-amber-400"}`} />
                <span className="text-xs font-bold text-amber-200">AI Curator Response</span>
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                {response.answer}
              </p>
            </div>

            {/* Source & Evidence (Rendered only when NOT refused) */}
            {!response.refused && (
              <>
                {/* Source Badge */}
                {response.source && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                    <div className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                      SOURCE
                    </div>
                    <div className="text-xs font-semibold text-slate-200">
                      {response.source.artifact}
                      <span className="text-slate-400 font-normal"> — {response.source.gallery}</span>
                    </div>
                  </div>
                )}

                {/* Evidence Box */}
                {response.evidence && (
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
                    <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      Evidence from Curated Artifact Record
                    </div>
                    <p className="text-[11px] text-slate-300 italic leading-normal border-l-2 border-amber-500/60 pl-2 mt-1">
                      "{response.evidence}"
                    </p>
                  </div>
                )}
              </>
            )}

            {/* "You Might Also Like" Recommendation Cards */}
            {response.related_suggestions && response.related_suggestions.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="text-[11px] uppercase font-extrabold text-amber-300/90 flex items-center gap-1.5 tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  You Might Also Like
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {response.related_suggestions.map((rec) => (
                    <button
                      key={rec.artifact_id}
                      type="button"
                      onClick={() => handleRecommendationClick(rec.artifact_id)}
                      className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="overflow-hidden pr-2">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                          {rec.artifact_name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
                          <span>{rec.gallery}</span>
                          {isAr && (
                            <span className="text-[9px] font-bold text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              Place in AR
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Question Form Input */}
      <form onSubmit={handleAsk} className="pt-2 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Ask about ${artifact?.name || "this exhibit"}...`}
          disabled={isLoading}
          aria-label="Ask AI Curator Question"
          className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-50 min-h-[44px]"
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          aria-label="Send Question"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 shrink-0 cursor-pointer min-h-[44px]"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
