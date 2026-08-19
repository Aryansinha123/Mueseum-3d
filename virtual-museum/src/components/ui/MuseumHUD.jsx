"use client";

import React from "react";
import {
  Landmark,
  Map,
  HelpCircle,
  Eye,
  Footprints,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export function MuseumHUD({
  controlMode,
  setControlMode,
  onOpenMap,
  onOpenControls,
  onResetCamera,
  selectedArtifact,
  currentGalleryName,
}) {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 md:p-6">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Top Left Branding & Current Location */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-100 px-4 py-2.5 rounded-2xl shadow-xl">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-md shadow-amber-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold tracking-wide text-amber-200">
              VIRTUAL HERITAGE MUSEUM
            </h1>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {currentGalleryName || "Museum Entrance Atrium"}
            </p>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Mode Switcher */}
          <button
            onClick={() =>
              setControlMode(controlMode === "first-person" ? "inspect" : "first-person")
            }
            className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all shadow-lg hover:border-amber-500/50"
            title="Toggle Navigation Mode"
          >
            {controlMode === "first-person" ? (
              <>
                <Footprints className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">First-Person Walk</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Orbit Inspect</span>
              </>
            )}
          </button>

          {/* Map Button */}
          <button
            onClick={onOpenMap}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Museum Map</span>
          </button>

          {/* Reset Camera */}
          <button
            onClick={onResetCamera}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all shadow-lg hover:border-slate-700"
            title="Reset Camera to Entrance"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenControls}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all shadow-lg hover:border-slate-700"
            title="Controls & Navigation Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM HINT PILL */}
      {!selectedArtifact && (
        <div className="pointer-events-none self-center mb-2">
          <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 text-slate-300 text-xs px-4 py-2 rounded-full shadow-2xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Use <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-amber-300">WASD</kbd> or Drag Mouse to Walk • Click any exhibit pedestal to inspect
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
