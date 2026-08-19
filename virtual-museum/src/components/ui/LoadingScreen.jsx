"use client";

import React, { useState, useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { Compass, Landmark, Sparkles } from "lucide-react";

export function LoadingScreen() {
  const { progress, active } = useProgress();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Auto-dismiss preloader once 3D assets & canvas finish mounting
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoaded || (!active && progress >= 100)) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 backdrop-blur-md transition-opacity duration-500">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/20 via-slate-950 to-indigo-950/30 opacity-80" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        {/* Emblem Icon */}
        <div className="mb-6 p-4 rounded-full bg-amber-500/10 border border-amber-500/30 shadow-lg shadow-amber-500/10 animate-pulse">
          <Landmark className="w-12 h-12 text-amber-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent mb-2">
          VIRTUAL HERITAGE MUSEUM
        </h1>
        <p className="text-slate-400 text-sm mb-8 font-light">
          Entering Museum Entrance Portal...
        </p>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-800/80 rounded-full h-3 p-0.5 border border-slate-700/60 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-amber-500/50"
            style={{ width: `${Math.max(25, progress || 100)}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="flex justify-between w-full text-xs text-slate-400 font-mono mb-6">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            Initializing 3D Galleries
          </span>
          <span className="font-bold text-amber-400">{Math.round(progress || 100)}%</span>
        </div>

        {/* Tip */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800">
          <Compass className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Walk through the Entrance Door to enter the Lobby & Galleries.</span>
        </div>
      </div>
    </div>
  );
}
