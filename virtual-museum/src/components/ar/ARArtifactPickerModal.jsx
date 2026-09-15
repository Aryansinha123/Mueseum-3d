"use client";

import React, { useState } from "react";
import {
  X,
  Smartphone,
  Search,
  CheckCircle2,
  Box,
  Layers,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { catalogArtifacts } from "@/data/artifacts";

export function ARArtifactPickerModal({
  isOpen,
  onClose,
  selectedArtifact,
  onSelectArtifact,
  onConfirmEnterAr,
  isArSupported = true,
  arErrorMessage = null,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (!isOpen) return null;

  // Filter artifacts by search query & category
  const categories = [
    "all",
    ...new Set(catalogArtifacts.map((a) => a.category?.split("/")[0].trim())),
  ];

  const filteredArtifacts = catalogArtifacts.filter((art) => {
    const matchesSearch =
      art.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.institution?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      art.category?.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const activeArtifact = selectedArtifact || catalogArtifacts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-all animate-fadeIn select-none">
      <div
        className="w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-slate-900/95 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-amber-200 tracking-wide flex items-center gap-2">
                SELECT AR EXHIBIT
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {catalogArtifacts.length} Artifacts
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Choose an exhibit to project into your physical space
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Close Picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="px-5 pt-3 pb-2 flex flex-col gap-2.5 bg-slate-900/50 border-b border-slate-800/50">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by artifact name, ID, or institution..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap capitalize cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ARTIFACT CATALOG GRID / SHEET */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scrollbar">
          {filteredArtifacts.map((artifact) => {
            const isSelected = activeArtifact?.id === artifact.id;
            return (
              <div
                key={artifact.id}
                onClick={() => onSelectArtifact(artifact)}
                className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-900/20 border-amber-500/80 shadow-lg shadow-amber-500/10 scale-[1.01]"
                    : "bg-slate-950/60 hover:bg-slate-800/50 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        isSelected
                          ? "bg-amber-500/30 text-amber-300 border-amber-500/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {artifact.id}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[140px]">
                      {artifact.period || "Historical Artifact"}
                    </span>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 animate-scaleIn" />
                  )}
                </div>

                <div className="mb-2">
                  <h3
                    className={`text-xs sm:text-sm font-bold leading-snug line-clamp-1 ${
                      isSelected ? "text-amber-200" : "text-slate-200 group-hover:text-white"
                    }`}
                  >
                    {artifact.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {artifact.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                  <span className="truncate max-w-[180px]">
                    {artifact.institution || artifact.category}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-400/80">
                    <Box className="w-3 h-3" />
                    3D GLB
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Active selection summary */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="truncate">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Selected for AR
              </span>
              <p className="text-xs font-bold text-amber-300 truncate max-w-[200px] sm:max-w-[240px]">
                {activeArtifact.name}
              </p>
            </div>
          </div>

          {/* Enter AR Button */}
          <button
            onClick={() => onConfirmEnterAr(activeArtifact)}
            disabled={!isArSupported}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
              isArSupported
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 hover:scale-[1.02] active:scale-95"
                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>ENTER MOBILE AR</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* AR Unsupported Warning if applicable */}
        {!isArSupported && (
          <div className="bg-amber-500/10 border-t border-amber-500/20 px-4 py-2 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              {arErrorMessage || "WebXR AR is not available on this device/browser."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
