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
  Bot,
  MessageSquare
} from "lucide-react";
import { AICuratorPanel } from "@/components/curator/AICuratorPanel";

export function AROverlayUI({
  selectedArtifact,
  onSelectArtifact,
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
  const [isCuratorOpen, setIsCuratorOpen] = useState(false);

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

  const rafRef = useRef(null);

  const handleSelectRecommendedInAr = (targetArtifact) => {
    if (onSelectArtifact) {
      onSelectArtifact(targetArtifact);
      console.log("[AR CURATOR] Switched AR exhibit to recommendation:", targetArtifact.id, targetArtifact.name);
      setIsCuratorOpen(false);
    }
  };

  // Touch gesture handler for 1-finger drag move, 2-finger pinch scale & 2-finger rotate
  const handleTouchStart = (e) => {
    if (!isPlaced || isCuratorOpen) return;
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
    if (!isPlaced || isCuratorOpen) return;
    const touches = e.touches;

    if (touches.length === 1 && touchState.current.isDragging && placedPosition) {
      // 1-Finger Drag -> Move artifact along horizontal floor plane
      const dx = (touches[0].clientX - touchState.current.touchStartX) * 0.0025;
      const dz = (touches[0].clientY - touchState.current.touchStartY) * 0.0025;
      
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setPlacedPosition([
            touchState.current.initialPos[0] + dx,
            touchState.current.initialPos[1],
            touchState.current.initialPos[2] + dz,
          ]);
          rafRef.current = null;
        });
      }
    } else if (touches.length === 2 && touchState.current.isPinching) {
      // 2-Finger Pinch -> Scale & Rotate artifact
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      const currentDist = Math.hypot(dx, dy);
      const currentAngle = Math.atan2(dy, dx);

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
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
          rafRef.current = null;
        });
      }
    }
  };

  const handleTouchEnd = () => {
    touchState.current.isDragging = false;
    touchState.current.isPinching = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
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
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 text-slate-100 px-3 py-1.5 rounded-2xl shadow-2xl">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Smartphone className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold tracking-wider text-amber-300 uppercase">
                  WEBXR AR
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs text-slate-200 font-bold truncate max-w-[120px] sm:max-w-[200px]">
                {selectedArtifact ? selectedArtifact.name : "Select Exhibit"}
              </p>
            </div>
          </div>

          {/* Action Buttons: AI Curator, Change Exhibit & Exit */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* Quick AI Curator Button in Top Bar (when placed) */}
            {isPlaced && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCuratorOpen(true);
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold px-3 py-2 rounded-xl shadow-xl shadow-amber-500/25 transition-all active:scale-95 cursor-pointer min-h-[44px]"
                title="Ask AI Curator in AR"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">AI Curator</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenPicker) onOpenPicker();
              }}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 text-xs font-bold px-3 py-2 rounded-xl border border-amber-500/30 shadow-xl transition-all active:scale-95 cursor-pointer min-h-[44px]"
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
              className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xl active:scale-95 border border-red-400/40 cursor-pointer min-h-[44px]"
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
        ) : !isCuratorOpen ? (
          <div className="pointer-events-auto inline-flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 text-slate-300 px-4 py-2 rounded-full shadow-lg text-[11px] font-medium animate-fadeIn">
            <Move className="w-3.5 h-3.5 text-amber-400" />
            <span>1-finger drag to move • 2-finger pinch/twist</span>
          </div>
        ) : null}
      </div>

      {/* BOTTOM CONTROLS PANEL (SHOWN ONLY AFTER PLACEMENT & WHEN CURATOR IS CLOSED) */}
      {isPlaced && !isCuratorOpen && (
        <div className="pointer-events-auto flex flex-col items-center gap-2 w-full max-w-lg mx-auto mb-1">
          {/* Main Controls Toolbar */}
          <div className="flex items-center justify-between gap-1 w-full bg-slate-900/95 backdrop-blur-2xl border border-slate-800/90 p-2 rounded-2xl shadow-2xl">
            {/* Reposition (Move) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onClearPlacement) onClearPlacement();
              }}
              className="flex flex-col items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl transition-all active:scale-90 min-w-[44px] min-h-[48px] cursor-pointer"
              title="Reposition Artifact"
            >
              <Move className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">Move</span>
            </button>

            {/* Rotate Left 45° */}
            <button
              onClick={handleRotateLeft}
              className="flex flex-col items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 text-amber-300 rounded-xl transition-all active:scale-90 min-w-[44px] min-h-[48px] cursor-pointer"
              title="Rotate 45° Left"
            >
              <Compass className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">↺ 45°</span>
            </button>

            {/* Rotate Right 45° */}
            <button
              onClick={handleRotateRight}
              className="flex flex-col items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 text-amber-300 rounded-xl transition-all active:scale-90 min-w-[44px] min-h-[48px] cursor-pointer"
              title="Rotate 45° Right"
            >
              <Compass className="w-4 h-4 scale-x-[-1]" />
              <span className="text-[9px] font-bold mt-0.5">45° ↻</span>
            </button>

            {/* Scale Out */}
            <button
              onClick={handleZoomOut}
              className="flex flex-col items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl transition-all active:scale-90 min-w-[40px] min-h-[48px] cursor-pointer"
              title="Decrease Scale"
            >
              <ZoomOut className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">-</span>
            </button>

            {/* Scale Badge */}
            <div className="text-center px-1 min-w-[40px]">
              <span className="text-[8px] text-slate-400 block uppercase font-bold">Scale</span>
              <span className="text-[11px] font-mono font-extrabold text-amber-300">
                {Math.round(arScale * 100)}%
              </span>
            </div>

            {/* Scale In */}
            <button
              onClick={handleZoomIn}
              className="flex flex-col items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl transition-all active:scale-90 min-w-[40px] min-h-[48px] cursor-pointer"
              title="Increase Scale"
            >
              <ZoomIn className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">+</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex flex-col items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-all active:scale-90 min-w-[42px] min-h-[48px] cursor-pointer"
              title="Reset Transform"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">Reset</span>
            </button>

            {/* PROMINENT AI CURATOR BUTTON (CORE FEATURE) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCuratorOpen(true);
              }}
              className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl transition-all active:scale-90 min-w-[56px] min-h-[48px] cursor-pointer shadow-lg shadow-amber-500/25 border border-amber-400/40"
              title="Ask AI Curator about placed exhibit"
            >
              <Bot className="w-4 h-4 animate-bounce" />
              <span className="text-[9px] font-black mt-0.5">Curator</span>
            </button>

            {/* Info Drawer Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenInfo) onOpenInfo();
              }}
              className="flex flex-col items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 text-amber-300 rounded-xl transition-all active:scale-90 min-w-[42px] min-h-[48px] cursor-pointer"
              title="Exhibit Info"
            >
              <Info className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-0.5">Info</span>
            </button>
          </div>
        </div>
      )}

      {/* MOBILE AI CURATOR BOTTOM SHEET DRAWER (INSIDE DOM OVERLAY) */}
      {isCuratorOpen && selectedArtifact && (
        <div className="fixed inset-0 z-[100000] flex flex-col justify-end pointer-events-auto bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div
            className="flex-1 w-full"
            onClick={() => setIsCuratorOpen(false)}
          />

          {/* Bottom Sheet Modal */}
          <div className="w-full max-w-lg mx-auto bg-slate-900 border-t border-x border-amber-500/30 rounded-t-3xl shadow-2xl flex flex-col max-h-[82vh] h-[78vh] animate-in slide-in-from-bottom duration-300 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] overflow-hidden">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-2 shrink-0 opacity-80" />

            {/* Embed AICuratorPanel */}
            <div className="flex-1 p-2 overflow-hidden">
              <AICuratorPanel
                artifact={selectedArtifact}
                onSelectArtifact={handleSelectRecommendedInAr}
                isAr={true}
                onClose={() => setIsCuratorOpen(false)}
                className="h-full border-none p-2 bg-transparent shadow-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!mounted) return null;

  // Render overlay inside WebXR domOverlayRoot if available, or fall back to document.body
  return portalNode ? createPortal(overlayContent, portalNode) : overlayContent;
}
