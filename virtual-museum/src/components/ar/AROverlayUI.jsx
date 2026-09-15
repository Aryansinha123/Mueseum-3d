"use client";

import React, { useRef, useEffect } from "react";
import {
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Info,
  Sparkles,
  Move,
  Smartphone,
  Grid,
  RefreshCw,
} from "lucide-react";

export function AROverlayUI({
  selectedArtifact,
  isPlaced,
  arScale,
  setArScale,
  rotationY,
  setRotationY,
  placedPosition,
  setPlacedPosition,
  onClearPlacement,
  onExitAr,
  onOpenInfo,
  onOpenPicker,
}) {
  const touchState = useRef({
    initialDist: 0,
    initialAngle: 0,
    initialScale: 1.0,
    initialRot: 0,
    initialPos: [0, 0, 0],
    isDragging: false,
    isPinching: false,
    touchStartX: 0,
    touchStartY: 0,
  });

  const handleZoomIn = () => {
    setArScale((prev) => Math.min(prev + 0.15, 3.0));
  };

  const handleZoomOut = () => {
    setArScale((prev) => Math.max(prev - 0.15, 0.2));
  };

  const handleRotateLeft = () => {
    setRotationY((prev) => prev - Math.PI / 8);
  };

  const handleRotateRight = () => {
    setRotationY((prev) => prev + Math.PI / 8);
  };

  const handleReset = () => {
    setArScale(1.0);
    setRotationY(0);
  };

  // Touch gesture handler for 1-finger drag move, 2-finger pinch scale & 2-finger rotate
  const handleTouchStart = (e) => {
    if (!isPlaced) return;
    const touches = e.touches;

    if (touches.length === 1) {
      touchState.current.isDragging = true;
      touchState.current.touchStartX = touches[0].clientX;
      touchState.current.touchStartY = touches[0].clientY;
      if (placedPosition) {
        touchState.current.initialPos = [...placedPosition];
      }
    } else if (touches.length === 2) {
      touchState.current.isPinching = true;
      touchState.current.isDragging = false;
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      touchState.current.initialDist = Math.hypot(dx, dy);
      touchState.current.initialAngle = Math.atan2(dy, dx);
      touchState.current.initialScale = arScale;
      touchState.current.initialRot = rotationY;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPlaced) return;
    const touches = e.touches;

    if (touches.length === 1 && touchState.current.isDragging && placedPosition) {
      const dx = (touches[0].clientX - touchState.current.touchStartX) * 0.003;
      const dz = (touches[0].clientY - touchState.current.touchStartY) * 0.003;
      setPlacedPosition([
        touchState.current.initialPos[0] + dx,
        touchState.current.initialPos[1],
        touchState.current.initialPos[2] + dz,
      ]);
    } else if (touches.length === 2 && touchState.current.isPinching) {
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      const currentDist = Math.hypot(dx, dy);
      const currentAngle = Math.atan2(dy, dx);

      if (touchState.current.initialDist > 0) {
        const scaleFactor = currentDist / touchState.current.initialDist;
        const newScale = Math.min(
          Math.max(touchState.current.initialScale * scaleFactor, 0.2),
          3.0
        );
        setArScale(newScale);
      }

      const angleDelta = currentAngle - touchState.current.initialAngle;
      setRotationY(touchState.current.initialRot + angleDelta);
    }
  };

  const handleTouchEnd = () => {
    touchState.current.isDragging = false;
    touchState.current.isPinching = false;
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 select-none touch-none pointer-events-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* TOP HEADER */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Active Artifact & Mode Tag */}
          <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 text-slate-100 px-3.5 py-2 rounded-2xl shadow-2xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Smartphone className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold tracking-wider text-amber-300 uppercase">
                  MOBILE AR MODE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs text-slate-200 font-bold truncate max-w-[160px] sm:max-w-[240px]">
                {selectedArtifact ? selectedArtifact.name : "Select Exhibit"}
              </p>
            </div>
          </div>

          {/* Action Buttons: Change Exhibit & Exit */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={onOpenPicker}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 text-xs font-bold px-3 py-2.5 rounded-xl border border-amber-500/30 shadow-xl transition-all active:scale-95 cursor-pointer"
              title="Change AR Exhibit"
            >
              <Grid className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Exhibits</span>
            </button>

            <button
              onClick={onExitAr}
              className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-xl active:scale-95 border border-red-400/40 cursor-pointer"
              title="Exit Mobile AR"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit AR</span>
            </button>
          </div>
        </div>
      </div>

      {/* MID-SCREEN SCANNING / INTERACTION TOAST */}
      <div className="pointer-events-none self-center max-w-sm w-full my-auto text-center">
        {!isPlaced ? (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 text-amber-200 p-4 rounded-2xl shadow-2xl text-center flex flex-col items-center gap-2 animate-bounce">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <p className="text-xs font-bold tracking-wide text-amber-300">
              Move phone to scan floor or table surface
            </p>
            <p className="text-[11px] text-slate-300 font-normal">
              When target reticle appears, tap screen to place artifact.
            </p>
          </div>
        ) : (
          <div className="pointer-events-auto inline-flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-300 px-4 py-2 rounded-full shadow-lg text-[11px] font-medium">
            <Move className="w-3.5 h-3.5 text-amber-400" />
            <span>1-finger drag to move • 2-finger pinch/twist</span>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS PANEL */}
      {isPlaced && (
        <div className="pointer-events-auto flex flex-col items-center gap-2.5 w-full max-w-md mx-auto mb-2">
          {/* Main Transformation Controls Bar */}
          <div className="flex items-center justify-between gap-1.5 w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-2 rounded-2xl shadow-2xl">
            {/* Scale Out */}
            <button
              onClick={handleZoomOut}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              title="Decrease Scale"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Scale indicator */}
            <div className="text-center px-1">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Scale</span>
              <span className="text-xs font-mono font-extrabold text-amber-300">
                {Math.round(arScale * 100)}%
              </span>
            </div>

            {/* Scale In */}
            <button
              onClick={handleZoomIn}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              title="Increase Scale"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-800 mx-0.5" />

            {/* Rotate Left */}
            <button
              onClick={handleRotateLeft}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl transition-all active:scale-90 text-xs font-bold min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              title="Rotate 45° Left"
            >
              ↺ 45°
            </button>

            {/* Rotate Right */}
            <button
              onClick={handleRotateRight}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl transition-all active:scale-90 text-xs font-bold min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              title="Rotate 45° Right"
            >
              45° ↻
            </button>

            <div className="w-px h-6 bg-slate-800 mx-0.5" />

            {/* Reset Scale/Rotation */}
            <button
              onClick={handleReset}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              title="Reset Transform"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Reposition */}
            <button
              onClick={onClearPlacement}
              className="p-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl transition-all active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              title="Reposition Artifact"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Info & AI Curator Action Button */}
          <button
            onClick={onOpenInfo}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>Artifact Info & AI Curator</span>
          </button>
        </div>
      )}
    </div>
  );
}
