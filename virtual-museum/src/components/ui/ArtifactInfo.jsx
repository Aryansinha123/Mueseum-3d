"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Info,
  Bot,
  Send,
  Calendar,
  Tag,
  Globe,
  ShieldCheck,
  Eye,
  ExternalLink,
  Building2,
  Smartphone,
} from "lucide-react";
import { AICuratorPanel } from "@/components/curator/AICuratorPanel";

export function ArtifactInfo({
  artifact,
  onClose,
  onExplore,
  onEnterAr,
  onSelectArtifact,
}) {
  const [activeTab, setActiveTab] = useState("details"); // 'details' or 'ai'
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      sender: "curator",
      text: `Hello! I am your AI Museum Curator. Ask me anything about the historical context, materials, or provenance of the ${artifact?.name}.`,
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  if (!artifact) return null;

  // RAG payload format representation
  const ragPayload = {
    artifact_id: artifact.id,
  };

  const handleSendAiQuestion = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAiLoading) return;

    const userText = aiQuestion;
    setAiQuestion("");
    setAiMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsAiLoading(true);

    // Endpoint stub: POST /api/chat { artifact_id: artifact.id, question: userText }
    setTimeout(() => {
      let aiResponseText = `The ${artifact.name} dates from ${artifact.period} in ${artifact.origin || "its historical region"}. ${artifact.aiContext?.historicalSignificance || artifact.description}`;

      if (userText.toLowerCase().includes("material") || userText.toLowerCase().includes("made")) {
        aiResponseText = `This artifact is crafted from ${artifact.aiContext?.material || "authentic archaeological stone/ceramic materials"}. Dimensions: ${artifact.aiContext?.dimensions || "standard museum exhibit scale"}.`;
      }

      setAiMessages((prev) => [
        ...prev,
        {
          sender: "curator",
          text: aiResponseText,
          sources: [artifact.source || "Smithsonian Institution"],
          confidence: "98.4%",
        },
      ]);
      setIsAiLoading(false);
    }, 850);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {artifact.id}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {artifact.galleryName}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-amber-100 tracking-tight">
            {artifact.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/30">
        <button
          onClick={() => setActiveTab("details")}
          className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === "details"
              ? "border-amber-400 text-amber-300 bg-amber-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Info className="w-4 h-4" />
          Artifact Details
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === "ai"
              ? "border-amber-400 text-amber-300 bg-amber-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Bot className="w-4 h-4 text-amber-400" />
          Ask AI Curator
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {activeTab === "details" ? (
          <>
            {/* Quick Metadata Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start gap-2.5">
                <Tag className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Category</div>
                  <div className="text-xs font-semibold text-slate-200">{artifact.category}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Period</div>
                  <div className="text-xs font-semibold text-slate-200">{artifact.period}</div>
                </div>
              </div>
            </div>

            {/* Institution & Source */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  Institution
                </span>
                <span className="font-semibold text-slate-200">
                  {artifact.institution || artifact.source}
                </span>
              </div>

              {artifact.origin && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    Origin
                  </span>
                  <span className="font-semibold text-slate-200">{artifact.origin}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  License
                </span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {artifact.license || "Public Domain"}
                </span>
              </div>

              {artifact.sourceUrl && (
                <div className="pt-2 border-t border-slate-800/80">
                  <a
                    href={artifact.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold"
                  >
                    <span>View on Official Smithsonian 3D</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Official Description */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-amber-300/80">
                Official Curator Description
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {artifact.description}
              </p>
            </div>

            {/* Explore & AR Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={onExplore}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Eye className="w-4 h-4" />
                Explore Artifact 360°
              </button>

              {onEnterAr && (
                <button
                  onClick={onEnterAr}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-amber-500/40 transition-all hover:border-amber-400"
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  View Exhibit in Mobile AR
                </button>
              )}

              <button
                onClick={() => setActiveTab("ai")}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <Bot className="w-4 h-4 text-amber-400" />
                Ask AI Curator Questions
              </button>
            </div>
          </>
        ) : (
          /* AI CURATOR CHAT TAB */
          <AICuratorPanel
            artifact={artifact}
            onSelectArtifact={onSelectArtifact}
            className="h-full border-none p-0 bg-transparent"
          />
        )}
      </div>
    </div>
  );
}
