"use client";

import React, { useState, useRef, useEffect } from "react";
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
  X,
  RotateCcw,
  User,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Layers,
  MapPin
} from "lucide-react";
import { askCurator } from "@/utils/api/curator";
import { catalogArtifacts } from "@/data/artifacts";

const QUICK_QUESTIONS = [
  "What is this?",
  "Tell me more",
  "When was it created?",
  "What was it used for?",
  "Why is it important?",
  "What materials were used?"
];

const DEEP_DIVE_TOPICS = [
  { label: "🏛️ Era & Context", query: "When was it created and what major historical events were taking place then?" },
  { label: "⚙️ Operation", query: "What was it used for and how did it function?" },
  { label: "🔬 Materials", query: "What materials and craftsmanship were used to build it?" },
  { label: "🌟 Legacy", query: "Why is it important and what is its historical legacy?" },
];

const NOTE_MARKER = "*(Curator's Note:";

function subscribeTour(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("museum_tour_updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("museum_tour_updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getTourSnapshot() {
  if (typeof window === "undefined") return "[]";
  try {
    return sessionStorage.getItem("museum_tour_visited") || "[]";
  } catch {
    return "[]";
  }
}

function getTourServerSnapshot() {
  return "[]";
}

export function AICuratorPanel({
  artifact,
  onSelectArtifact,
  isAr = false,
  onClose,
  className = ""
}) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [tone, setTone] = useState("educational"); // 'educational', 'concise', 'friendly'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTooltipId, setActiveTooltipId] = useState(null);
  const [expandedEvidenceId, setExpandedEvidenceId] = useState(null);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  // Phase D: Museum Tour Journey Memory (Subscribed via useSyncExternalStore)
  const tourSnapshot = React.useSyncExternalStore(subscribeTour, getTourSnapshot, getTourServerSnapshot);
  const storedVisited = React.useMemo(() => {
    try {
      const parsed = JSON.parse(tourSnapshot);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [tourSnapshot]);

  // Synchronize active artifact into visited exhibits list
  const visitedArtifacts = React.useMemo(() => {
    if (!artifact?.id) return storedVisited;
    if (storedVisited.includes(artifact.id)) return storedVisited;
    return [...storedVisited, artifact.id];
  }, [artifact, storedVisited]);

  const [isTourDrawerOpen, setIsTourDrawerOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const idCounterRef = useRef(0);

  // Synchronize active artifact into sessionStorage external store (no setState in effect)
  useEffect(() => {
    if (typeof window === "undefined" || !artifact?.id) return;
    try {
      const stored = sessionStorage.getItem("museum_tour_visited");
      const list = stored ? JSON.parse(stored) : [];
      if (!list.includes(artifact.id)) {
        list.push(artifact.id);
        sessionStorage.setItem("museum_tour_visited", JSON.stringify(list));
        window.dispatchEvent(new Event("museum_tour_updated"));
      }
    } catch {
      // ignore
    }
  }, [artifact?.id]);

  // Prior artifact in visitor's tour sequence different from currently viewed exhibit
  const priorArtifactId = visitedArtifacts
    .slice()
    .reverse()
    .find((id) => id !== artifact?.id);
  const priorArtifact = priorArtifactId
    ? catalogArtifacts.find((a) => a.id === priorArtifactId)
    : null;

  // Auto-scroll to latest message when messages or loading changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Clean up any ongoing speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeak = (msgId, rawText) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text: strip markdown footnotes and formatting
    const cleanSpeechText = (rawText || "")
      .replace(/\*\(Curator's Note:.*?\)\*/gi, "")
      .replace(/[*#_`>]/g, "")
      .replace(/•|-/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (msgId, text) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  const executeAsk = async (qText) => {
    const trimmed = (qText || "").trim();
    if (!trimmed || isLoading) return;

    idCounterRef.current += 1;
    const userMessage = {
      id: `user-${idCounterRef.current}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Extract prior exchange history for multi-turn RAG grounding
    const historyPayload = messages
      .filter((m) => m.role === "user" || m.role === "curator")
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);
    setErrorMsg(null);

    if (isAr) {
      console.log("[AR CURATOR] Placed artifact:", artifact?.id || null);
      console.log("[AR CURATOR] Question:", trimmed);
    } else {
      console.log("[CURATOR DEBUG] Question:", trimmed, "Artifact:", artifact?.id || null);
    }

    try {
      const resData = await askCurator({
        question: trimmed,
        artifact_id: artifact?.id || null,
        tone: tone,
        history: historyPayload,
        visited_artifacts: visitedArtifacts,
      });

      if (Array.isArray(resData.visited_artifacts) && resData.visited_artifacts.length > 0) {
        try {
          const stored = sessionStorage.getItem("museum_tour_visited");
          const current = stored ? JSON.parse(stored) : [];
          const merged = Array.from(new Set([...current, ...resData.visited_artifacts]));
          sessionStorage.setItem("museum_tour_visited", JSON.stringify(merged));
          window.dispatchEvent(new Event("museum_tour_updated"));
        } catch {
          // ignore
        }
      }

      idCounterRef.current += 1;
      const curatorMessage = {
        id: `curator-${idCounterRef.current}`,
        role: "curator",
        content: resData.answer,
        confidence: resData.confidence,
        source: resData.source,
        evidence: resData.evidence,
        refused: resData.refused,
        suggested_followups: resData.suggested_followups || [],
        related_suggestions: resData.related_suggestions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, curatorMessage]);
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
    executeAsk(qText);
  };

  const handleResetChat = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setMessages([]);
    setErrorMsg(null);
    setQuestion("");
  };

  const handleRecommendationClick = (suggestedId) => {
    if (!onSelectArtifact) return;
    const targetObj = catalogArtifacts.find((a) => a.id === suggestedId);
    if (targetObj) {
      onSelectArtifact(targetObj);
    }
  };

  // Render text with highlighted Curator's Note callout if broader knowledge was drawn
  const renderCuratorMessageContent = (content) => {
    if (!content) return null;
    const noteIdx = content.indexOf(NOTE_MARKER);
    if (noteIdx === -1) {
      return (
        <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-200">
          {content}
        </p>
      );
    }

    const mainPart = content.slice(0, noteIdx).trim();
    const rawNote = content.slice(noteIdx);
    const cleanedNote = rawNote
      .replace(/^\*\(/, "")
      .replace(/\)\*$/, "")
      .replace(/^Curator's Note:\s*/i, "")
      .trim();

    return (
      <div className="space-y-2.5">
        <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-200">
          {mainPart}
        </p>
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-200/90 leading-normal italic font-sans">
            <strong className="font-semibold text-amber-300 not-italic block mb-0.5">
              Curator&apos;s Scholarly Context:
            </strong>
            {cleanedNote}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900/95 text-slate-100 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ${className}`}>
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 shrink-0">
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

        <div className="flex items-center gap-1.5">
          {/* Phase D: Interactive Tour Journey Badge */}
          <button
            type="button"
            onClick={() => setIsTourDrawerOpen((prev) => !prev)}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border shadow-sm ${
              isTourDrawerOpen
                ? "bg-amber-500/30 text-amber-200 border-amber-500/60"
                : "bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 hover:text-amber-200 border-slate-700"
            }`}
            title="Toggle Tour Journey & Visited Exhibits"
            aria-label="Tour Journey"
          >
            <span>🏛️</span>
            <span className="hidden sm:inline">Tour:</span>
            <span>{visitedArtifacts.length} explored</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isTourDrawerOpen ? "rotate-180 text-amber-300" : "text-slate-400"}`} />
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleResetChat}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1 text-[10px] px-2"
              title="Start New Conversation"
              aria-label="New Chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

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
      </div>

      {/* ── PHASE D: EXPANDABLE TOUR JOURNEY DRAWER ── */}
      {isTourDrawerOpen && (
        <div className="my-2 p-3 rounded-2xl bg-slate-950/95 border border-amber-500/40 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Visitor Tour Journey Memory</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
              {visitedArtifacts.length} of {catalogArtifacts.length} Exhibits ({Math.round((visitedArtifacts.length / Math.max(catalogArtifacts.length, 1)) * 100)}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((visitedArtifacts.length / Math.max(catalogArtifacts.length, 1)) * 100))}%` }}
            />
          </div>

          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
              <span>Explored In This Session:</span>
              <span className="text-[9px] text-slate-500 font-normal">tap to inspect</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {visitedArtifacts.map((vId) => {
                const vArt = catalogArtifacts.find((a) => a.id === vId);
                const isCurrent = artifact?.id === vId;
                return (
                  <button
                    key={vId}
                    type="button"
                    onClick={() => {
                      if (!isCurrent && onSelectArtifact && vArt) {
                        onSelectArtifact(vArt);
                      }
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      isCurrent
                        ? "bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-sm"
                        : "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <MapPin className="w-2.5 h-2.5 text-amber-400" />
                    <span>{vArt ? vArt.name : vId}</span>
                    {isCurrent && <span className="text-[9px] text-amber-400 font-bold ml-0.5">(Now)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {priorArtifact && artifact && (
            <button
              type="button"
              onClick={() => {
                setIsTourDrawerOpen(false);
                executeAsk(`How does the ${artifact.name} compare to the ${priorArtifact.name}?`);
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 border border-amber-500/50 text-amber-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <span>⚖️</span>
              <span>Compare with {priorArtifact.name}</span>
            </button>
          )}
        </div>
      )}

      {/* ── ACTIVE EXHIBIT BANNER ── */}
      <div className="pt-2 shrink-0">
        {artifact ? (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                {isAr ? <Smartphone className="w-3.5 h-3.5 text-amber-400" /> : <Bot className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="truncate">
                <div className="text-[9px] font-extrabold uppercase text-amber-400 tracking-wider">
                  {isAr ? "Active Placed Exhibit" : "Currently viewing"}
                </div>
                <div className="text-xs font-bold text-slate-100 truncate">
                  {artifact.name}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0">
              {artifact.id}
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-2 text-slate-400 text-xs">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>General museum knowledge mode</span>
          </div>
        )}
      </div>

      {/* ── PRIOR EXHIBIT COMPARISON SHORTCUT (Phase D) ── */}
      {priorArtifact && artifact && (
        <div className="pt-1.5 shrink-0">
          <button
            type="button"
            onClick={() => executeAsk(`How does the ${artifact.name} compare to the ${priorArtifact.name}?`)}
            disabled={isLoading}
            className="w-full px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-slate-950 border border-amber-500/40 hover:border-amber-500/70 text-amber-200 text-[11px] font-medium flex items-center justify-between group transition-all cursor-pointer shadow-sm disabled:opacity-50 text-left active:scale-[0.99]"
          >
            <span className="flex items-center gap-1.5 truncate pr-2">
              <span className="text-amber-400 text-xs">⚖️</span>
              <span className="text-amber-300 font-bold">Compare Tour Exhibits:</span>
              <span className="truncate text-slate-300">{artifact.name} vs. {priorArtifact.name}</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      )}

      {/* ── TONE CONTROLS ── */}
      <div className="flex items-center justify-between gap-1 p-1 rounded-xl bg-slate-950/60 border border-slate-800/80 shrink-0">
        <span className="text-[10px] uppercase font-extrabold text-slate-400 px-2">
          Tone:
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTone("educational")}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
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
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
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
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
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

      {/* ── CHAT STREAM CONTAINER ── */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-0 pt-1 pb-1">
        {/* Welcome Empty State */}
        {messages.length === 0 && !isLoading && !errorMsg && (
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-center space-y-3 my-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <Sparkles className="w-5 h-5 opacity-90" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-200">
                Interactive AI Museum Dialogue
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Ask about {artifact ? `the ${artifact.name}` : "any exhibit in the collection"}. The curator remembers our dialogue history and suggests deeper topics as you explore.
              </p>
            </div>

            {/* Deep-Dive Categories & Starters in Welcome Card */}
            <div className="pt-2 text-left space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                Curator Inquiries & Topics:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEEP_DIVE_TOPICS.map((topic, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => executeAsk(topic.query)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 font-medium transition-all cursor-pointer shadow-sm text-left flex items-center gap-1"
                  >
                    <span>{topic.label}</span>
                  </button>
                ))}
              </div>

              {priorArtifact && artifact && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => executeAsk(`How does the ${artifact.name} compare to the ${priorArtifact.name}?`)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-slate-900 border border-amber-500/40 hover:border-amber-500/70 text-amber-200 text-[11px] font-semibold flex items-center justify-between group transition-all cursor-pointer shadow-sm text-left active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-1.5 truncate pr-2">
                      <span className="text-amber-400">⚖️</span>
                      <span className="text-amber-300 font-bold">Compare with prior exhibit:</span>
                      <span className="truncate text-slate-300">{priorArtifact.name}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}

              <div className="pt-1 flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.slice(0, 3).map((qText) => (
                  <button
                    key={qText}
                    type="button"
                    onClick={() => handleQuickQuestion(qText)}
                    className="px-2.5 py-1 rounded-lg text-[10px] bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-all cursor-pointer shadow-sm text-left"
                  >
                    {qText}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Multi-Turn Messages Stream */}
        {messages.map((msg) => {
          // System divider
          if (msg.role === "system") {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="text-[10px] font-mono text-amber-300/80 bg-slate-950/80 border border-amber-500/30 px-3 py-1 rounded-full shadow-sm">
                  {msg.content}
                </span>
              </div>
            );
          }

          // User message bubble
          if (msg.role === "user") {
            return (
              <div key={msg.id} className="flex justify-end items-end gap-2 pl-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="space-y-0.5 text-right max-w-[85%]">
                  <div className="p-3 rounded-2xl rounded-br-sm bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-medium text-xs shadow-md leading-relaxed text-left">
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-slate-500 pr-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
                <div className="w-6 h-6 rounded-lg bg-amber-600/30 border border-amber-600/50 flex items-center justify-center text-amber-300 shrink-0 mb-3.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          }

          // Curator message bubble
          const isLatestCurator = messages.filter((m) => m.role === "curator").slice(-1)[0]?.id === msg.id;
          const isEvidenceOpen = expandedEvidenceId === msg.id;
          const isTooltipOpen = activeTooltipId === msg.id;
          const isSpeaking = speakingMsgId === msg.id;
          const isCopied = copiedMsgId === msg.id;

          // Authentic confidence score calculation & styling
          const numericConfidence = typeof msg.confidence === "number" ? msg.confidence : parseFloat(msg.confidence) || 0;
          const displayScore = (numericConfidence <= 1 ? numericConfidence * 100 : numericConfidence).toFixed(1);
          const isHighConfidence = numericConfidence >= 0.65;
          const isMediumConfidence = numericConfidence >= 0.45 && numericConfidence < 0.65;

          return (
            <div key={msg.id} className="flex flex-col items-start space-y-2 pr-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div
                className={`w-full rounded-2xl rounded-tl-sm p-3.5 border shadow-lg space-y-2.5 ${
                  msg.refused
                    ? "bg-rose-950/20 border-rose-500/30"
                    : "bg-slate-950/90 border-slate-800"
                }`}
              >
                {/* Curator Bubble Header with Authentic Confidence Badge & Action Controls */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <Bot className={`w-3.5 h-3.5 ${msg.refused ? "text-rose-400" : "text-amber-400"}`} />
                    </div>
                    <span className="text-[11px] font-bold text-amber-200">
                      Curator Response
                    </span>
                  </div>

                  {/* Header Actions: Confidence + Audio Speak + Copy */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold flex items-center gap-1 ${
                        msg.refused
                          ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                          : isHighConfidence
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : isMediumConfidence
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      <span>Match: {displayScore}%</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setActiveTooltipId(isTooltipOpen ? null : msg.id)}
                      className="text-slate-400 hover:text-amber-300 transition-colors p-0.5 cursor-pointer"
                      title="Why this confidence score?"
                      aria-label="Confidence score explanation"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>

                    {/* Audio Docent Narration Button */}
                    {!msg.refused && (
                      <button
                        type="button"
                        onClick={() => handleToggleSpeak(msg.id, msg.content)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          isSpeaking
                            ? "text-amber-300 bg-amber-500/20 animate-pulse"
                            : "text-slate-400 hover:text-amber-300 hover:bg-slate-800/80"
                        }`}
                        title={isSpeaking ? "Stop Audio Narration" : "Listen to Curator Narration"}
                        aria-label="Narrate Response"
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Copy Response Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.id, msg.content)}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
                      title={isCopied ? "Copied to clipboard!" : "Copy response"}
                      aria-label="Copy response"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Score Meaning Tooltip */}
                {isTooltipOpen && (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-300 leading-normal flex items-start gap-2 shadow-inner">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-100 mb-0.5">Authentic Neural Similarity</p>
                      <p>
                        This {displayScore}% score is mathematical cosine retrieval similarity against curated museum records. Selected exhibit queries are grounded directly with zero hallucinated figures.
                      </p>
                    </div>
                  </div>
                )}

                {/* Main Curator Answer Content */}
                {renderCuratorMessageContent(msg.content)}

                {/* Source & Catalog Evidence Section (when not refused) */}
                {!msg.refused && (
                  <div className="pt-1 space-y-1.5 border-t border-slate-800/60">
                    {msg.source && (
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <BookOpen className="w-3 h-3 text-amber-400" />
                          <strong className="text-slate-300">{msg.source.artifact}</strong>
                          <span>({msg.source.gallery})</span>
                        </span>

                        {msg.evidence && (
                          <button
                            type="button"
                            onClick={() => setExpandedEvidenceId(isEvidenceOpen ? null : msg.id)}
                            className="text-amber-400/90 hover:text-amber-300 flex items-center gap-0.5 font-semibold transition-colors cursor-pointer"
                          >
                            <span>Evidence</span>
                            {isEvidenceOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    )}

                    {isEvidenceOpen && msg.evidence && (
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300 italic leading-relaxed border-l-2 border-amber-500/80 pl-2.5 mt-1 animate-in fade-in duration-150">
                        &ldquo;{msg.evidence}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {/* ── INTERACTIVE DYNAMIC FOLLOW-UP SUGGESTIONS (Phase C) ── */}
                {msg.suggested_followups && msg.suggested_followups.length > 0 && isLatestCurator && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                    <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center justify-between tracking-wider">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Curator Inquiries & Next Steps:</span>
                      </span>
                      <span className="text-[9px] text-slate-500 font-normal lowercase">tap to ask</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {msg.suggested_followups.map((followup, fIdx) => (
                        <button
                          key={fIdx}
                          type="button"
                          onClick={() => executeAsk(followup)}
                          disabled={isLoading}
                          className="w-full text-left px-3 py-2 rounded-xl text-[11px] bg-slate-900/90 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-amber-200 transition-all flex items-center justify-between group cursor-pointer shadow-sm disabled:opacity-50 active:scale-[0.99]"
                        >
                          <span className="pr-2 leading-snug">{followup}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── RELATED EXHIBITS ── */}
                {msg.related_suggestions && msg.related_suggestions.length > 0 && isLatestCurator && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-amber-300/90 flex items-center gap-1 tracking-wider">
                      <Compass className="w-3 h-3 text-amber-400" />
                      <span>You Might Also Like:</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {msg.related_suggestions.map((rec) => (
                        <button
                          key={rec.artifact_id}
                          type="button"
                          onClick={() => handleRecommendationClick(rec.artifact_id)}
                          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="overflow-hidden pr-2">
                            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                              {rec.artifact_name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
                              <span>{rec.gallery}</span>
                              {isAr && (
                                <span className="text-[9px] font-bold text-amber-400/90 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                                  Place in AR
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[9px] text-slate-500 font-mono text-right pt-0.5">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator State in Stream */}
        {isLoading && (
          <div className="flex items-start gap-2 max-w-[90%] animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-amber-400 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl rounded-tl-sm bg-slate-950/90 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>Curator is consulting exhibit records & generating grounded response...</span>
            </div>
          </div>
        )}

        {/* Backend Error Alert State */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div>{errorMsg}</div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="mt-1 text-[10px] text-rose-400 underline hover:text-rose-200 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── THEMATIC DEEP DIVE SHELF (When conversation is active) ── */}
      {messages.length > 0 && (
        <div className="pt-1 pb-1 shrink-0 overflow-x-auto scrollbar-none flex items-center gap-1.5 border-t border-slate-800/40">
          <span className="text-[9px] uppercase font-bold text-amber-400/80 shrink-0 flex items-center gap-0.5">
            <Compass className="w-3 h-3" />
            <span>Topics:</span>
          </span>
          {priorArtifact && artifact && (
            <button
              type="button"
              onClick={() => executeAsk(`How does the ${artifact.name} compare to the ${priorArtifact.name}?`)}
              disabled={isLoading}
              className="px-2 py-0.5 rounded-lg text-[10px] bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 border border-amber-500/50 text-amber-300 font-bold transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer shrink-0"
              title={`Compare ${artifact.name} with ${priorArtifact.name}`}
            >
              ⚖️ Compare with {priorArtifact.name}
            </button>
          )}
          {DEEP_DIVE_TOPICS.map((topic, tIdx) => (
            <button
              key={tIdx}
              type="button"
              onClick={() => executeAsk(topic.query)}
              disabled={isLoading}
              className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-950 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 font-medium transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer shrink-0"
            >
              {topic.label}
            </button>
          ))}
        </div>
      )}

      {/* ── QUESTION INPUT FORM ── */}
      <form onSubmit={handleAsk} className="pt-2 border-t border-slate-800 flex items-center gap-2 shrink-0">
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
