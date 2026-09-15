"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { xrStore } from "@/utils/xrStore";
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
  Compass,
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
  const [mounted, setMounted] = useState(false);
  const [portalNode, setPortalNode] = useState(null);

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

  // Mount check for SSR & DOM overlay root location
  useEffect(() => {
    setMounted(true);
    const overlayRoot =
      xrStore?.getState?.()?.domOverlayRoot ||
      (typeof document !== "undefined" ? document.body : null);
    setPortalNode(overlayRoot);
  }, []);

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setArScale((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 3.0));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setArScale((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.2));
  };

  const handleRotateLeft = (e) => {
    e?.stopPropagation();
    setRotationY((prev) => prev - Math.PI / 8);
  };

  const handleRotateRight = (e) => {
    e?.stopPropagation();
    setRotationY((prev) => prev + Math.PI / 8);
  };

  const handleReset = (e) => {
    e?.stopPropagation();
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
      // 1-Finger Drag -> Move artifact along horizontal floor plane
      const dx = (touches[0].clientX - touchState.current.touchStartX) * 0.0025;
      const dz = (touches[0].clientY - touchState.current.touchStartY) * 0.0025;
      setPlacedPosition([
        touchState.current.initialPos[0] + dx,
        touchState.current.initialPos[1],
        touchState.current.initialPos[2] + dz,
      ]);
    } else if (touches.length === 2 && touchState.current.isPinching) {
      // 2-Finger Pinch -> Scale & Rotate artifact
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
        setArScale(Number(newScale.toFixed(2)));
      }

      const angleDelta = currentAngle - touchState.current.initialAngle;
      setRotationY(touchState.current.initialRot + angleDelta);
    }
  };

  const handleTouchEnd = () => {
    touchState.current.isDragging = false;
    touchState.current.isPinching = false;
  };

  const overlayContent = (
    <div
      className="fixed inset-0 z-[99999] flex flex-col justify-between p-4 sm:p-6 select-none touch-none pointer-events-none pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
      style={{ touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* TOP BAR - MODE HEADER & ACTION BUTTONS */}
      <div className="flex flex-col gap-2 w-full pt-[env(safe-area-inset-top,0px)]">
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Active Artifact Badge */}
          <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 text-slate-100 px-3.5 py-2 rounded-2xl shadow-2xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Smartphone className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold tracking-wider text-amber-300 uppercase">
                  WEBXR AR MODE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs text-slate-200 font-bold truncate max-w-[140px] sm:max-w-[220px]">
                {selectedArtifact ? selectedArtifact.name : "Select Exhibit"}
              </p>
            </div>
          </div>

          {/* Action Buttons: Change Exhibit & Exit */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenPicker) onOpenPicker();
              }}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 text-xs font-bold px-3 py-2.5 rounded-xl border border-amber-500/30 shadow-xl transition-all active:scale-95 cursor-pointer min-h-[44px]"
              title="Change AR Exhibit"
            >
              <Grid className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Exhibits</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onExitAr) onExitAr();
              }}
              className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-xl active:scale-95 border border-red-400/40 cursor-pointer min-h-[44px]"
              title="Exit Mobile AR"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Exit AR</span>
            </button>
          </div>
        </div>
      </div>

      {/* MID-SCREEN SCANNING vs PLACED TOAST */}
      <div className="pointer-events-none self-center max-w-sm w-full my-auto text-center">
        {!isPlaced ? (
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 text-amber-200 p-4 rounded-2xl shadow-2xl text-center flex flex-col items-center gap-2 animate-bounce">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <p className="text-xs font-extrabold tracking-wide text-amber-300">
              Move your phone to find a surface
            </p>
            <p className="text-[11px] text-slate-300 font-normal leading-tight">
              When the yellow target reticle appears on the floor or table, tap to place artifact.
            </p>
          </div>
        ) : (
          <div className="pointer-events-auto inline-flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 text-slate-300 px-4 py-2 rounded-full shadow-lg text-[11px] font-medium animate-fadeIn">
            <Move className="w-3.5 h-3.5 text-amber-400" />
            <span>1-finger drag to move • 2-finger pinch/twist</span>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS PANEL (SHOWN ONLY AFTER PLACEMENT) */}
      {isPlaced && (
        <div className="pointer-events-auto flex flex-col items-center gap-2.5 w-full max-w-md mx-auto mb-1">
          {/* Minimal Bottom Toolbar */}
          <div className="flex items-center justify-between gap-1 w-full bg-slate-900/95 backdrop-blur-2xl border border-slate-800/90 p-2 rounded-2xl shadow-2xl">
            {/* Reposition (Re-scan) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onClearPlacement) onClearPlacement();
              }}
              className="flex flex-col items-center justify-center p-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl transition-all active:scale-90 min-w-[48px] min-h-[48px] cursor-pointer"
              title="Reposition Artifact"
            >
              <Move className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">Move</span>
            </button>

            <div className="w-px h-7 bg-slate-800/80 mx-0.5" />

            {/* Rotate Left 45° */}
            <button
              onClick={handleRotateLeft}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-800/80 hover:bg-slate-700 text-amber-300 rounded-xl transition-all active:scale-90 min-w-[48px] min-h-[48px] cursor-pointer"
              title="Rotate 45° Left"
            >
              <Compass className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">↺ 45°</span>
            </button>

            {/* Rotate Right 45° */}
            <button
              onClick={handleRotateRight}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-800/80 hover:bg-slate-700 text-amber-300 rounded-xl transition-all active:scale-90 min-w-[48px] min-h-[48px] cursor-pointer"
              title="Rotate 45° Right"
            >
              <Compass className="w-4 h-4 scale-x-[-1]" />
              <span className="text-[9px] font-bold mt-0.5">45° ↻</span>
            </button>

            <div className="w-px h-7 bg-slate-800/80 mx-0.5" />

            {/* Scale Out */}
            <button
              onClick={handleZoomOut}
              className="flex flex-col items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl transition-all active:scale-90 min-w-[44px] min-h-[48px] cursor-pointer"
              title="Decrease Scale"
            >
              <ZoomOut className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">-</span>
            </button>

            {/* Scale Badge */}
            <div className="text-center px-1 min-w-[44px]">
              <span className="text-[8px] text-slate-400 block uppercase font-bold">Scale</span>
              <span className="text-[11px] font-mono font-extrabold text-amber-300">
                {Math.round(arScale * 100)}%
              </span>
            </div>

            {/* Scale In */}
            <button
              onClick={handleZoomIn}
              className="flex flex-col items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl transition-all active:scale-90 min-w-[44px] min-h-[48px] cursor-pointer"
              title="Increase Scale"
            >
              <ZoomIn className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">+</span>
            </button>

            <div className="w-px h-7 bg-slate-800/80 mx-0.5" />

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-all active:scale-90 min-w-[48px] min-h-[48px] cursor-pointer"
              title="Reset Transform"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">Reset</span>
            </button>

            {/* Info Drawer Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenInfo) onOpenInfo();
              }}
              className="flex flex-col items-center justify-center p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-all active:scale-90 min-w-[48px] min-h-[48px] cursor-pointer shadow-md shadow-amber-500/20"
              title="Exhibit Info"
            >
              <Info className="w-4 h-4" />
              <span className="text-[9px] font-extrabold mt-0.5">Info</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (!mounted) return null;

  // Render overlay inside WebXR domOverlayRoot if available, or fall back to document.body
  return portalNode ? createPortal(overlayContent, portalNode) : overlayContent;
}

