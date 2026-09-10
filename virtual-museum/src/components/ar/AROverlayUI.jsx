"use client";

import React from "react";
import {
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Info,
  Sparkles,
  Maximize2,
  Move,
  Smartphone,
} from "lucide-react";

export function AROverlayUI({
  selectedArtifact,
  isPlaced,
  arScale,
  setArScale,
  rotationY,
  setRotationY,
  onClearPlacement,
  onExitAr,
  onOpenInfo,
  artifacts = [],
  onSelectArtifact,
}) {
  const handleZoomIn = () => {
    setArScale((prev) => Math.min(prev + 0.15, 3.0));
  };

  const handleZoomOut = () => {
    setArScale((prev) => Math.max(prev - 0.15, 0.3));
  };

  const handleRotateLeft = () => {
    setRotationY((prev) => prev - Math.PI / 8);
  };

  const handleRotateRight = () => {
    setRotationY((prev) => prev + Math.PI / 8);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-between p-4 md:p-6 select-none">
      {/* TOP AR HEADER & EXHIBIT SELECTOR */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between gap-3 w-full">
          {/* AR Branding & Active Artifact */}
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 text-slate-100 px-4 py-2.5 rounded-2xl shadow-2xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold tracking-wider text-amber-300">
                  MOBILE AR MODE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {selectedArtifact ? selectedArtifact.name : "Select exhibit to place"}
              </p>
            </div>
          </div>

          {/* Exit AR Action Button */}
          <button
            onClick={onExitAr}
            className="pointer-events-auto flex items-center gap-2 bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95 border border-red-400/40"
          >
            <X className="w-4 h-4" />
            <span>Exit AR</span>
          </button>
        </div>

        {/* Real GLB Exhibit Selector Bar */}
        {artifacts && artifacts.length > 1 && (
          <div className="pointer-events-auto flex items-center justify-center gap-2 max-w-sm mx-auto overflow-x-auto p-1.5 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl">
            {artifacts.map((art) => {
              const isCurrent = selectedArtifact?.id === art.id;
              return (
                <button
                  key={art.id}
                  onClick={() => onSelectArtifact && onSelectArtifact(art)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isCurrent
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105"
                      : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isCurrent ? "bg-slate-950" : "bg-amber-400"}`} />
                  <span>{art.id} • {art.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* MID-SCREEN PLACEMENT INSTRUCTION TOAST */}
      <div className="pointer-events-none self-center max-w-sm w-full">
        {!isPlaced ? (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 text-amber-200 p-4 rounded-2xl shadow-2xl text-center flex flex-col items-center gap-2 animate-bounce">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <p className="text-xs font-bold tracking-wide">
              Scan camera over floor or table surface
            </p>
            <p className="text-[11px] text-slate-300 font-normal">
              When the yellow placement ring appears, tap screen to anchor artifact.
            </p>
          </div>
        ) : (
          <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 px-4 py-2 rounded-full shadow-lg text-center text-xs font-medium flex items-center justify-center gap-2">
            <Move className="w-3.5 h-3.5 text-amber-400" />
            <span>Pinch to scale • Drag/Rotate controls below</span>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS PANEL */}
      {isPlaced && (
        <div className="pointer-events-auto flex flex-col items-center gap-3 w-full max-w-md mx-auto">
          {/* AR Artifact Transformation Toolbar */}
          <div className="flex items-center justify-between gap-2 w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-2 rounded-2xl shadow-2xl">
            {/* Zoom / Scale Out */}
            <button
              onClick={handleZoomOut}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all active:scale-90"
              title="Decrease Scale"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Scale percentage indicator */}
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Scale</span>
              <span className="text-xs font-mono font-extrabold text-amber-300">
                {Math.round(arScale * 100)}%
              </span>
            </div>

            {/* Zoom / Scale In */}
            <button
              onClick={handleZoomIn}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all active:scale-90"
              title="Increase Scale"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-800 mx-1" />

            {/* Rotate Y-Axis Buttons */}
            <button
              onClick={handleRotateLeft}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl transition-all active:scale-90 text-xs font-bold flex items-center gap-1"
              title="Rotate Left"
            >
              ↺ 45°
            </button>
            <button
              onClick={handleRotateRight}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl transition-all active:scale-90 text-xs font-bold flex items-center gap-1"
              title="Rotate Right"
            >
              45° ↻
            </button>

            <div className="w-px h-6 bg-slate-800 mx-1" />

            {/* Reposition / Clear Placement Button */}
            <button
              onClick={onClearPlacement}
              className="p-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl transition-all active:scale-90"
              title="Reposition Artifact"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={onOpenInfo}
              className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Info className="w-4 h-4" />
              <span>Artifact Info & AI Curator</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
