"use client";

import React from "react";
import { X, MousePointer, Keyboard, Touchpad, Eye } from "lucide-react";

export function ControlsOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base tracking-wide text-amber-100">
            MUSEUM NAVIGATION CONTROLS
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Keyboard & Mouse Section */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-bold text-amber-400 flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Desktop / Laptop Controls
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-amber-300">W</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-amber-300">A</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-amber-300">S</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-amber-300">D</kbd>
              </div>
              <div className="text-slate-400">Walk around museum floor</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5 text-amber-400" />
                Mouse Drag
              </div>
              <div className="text-slate-400">Look around 360° perspective</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                Left Click Exhibit
              </div>
              <div className="text-slate-400">Inspect artifact & view details</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="font-bold text-slate-200 mb-1">Scroll Wheel</div>
              <div className="text-slate-400">Zoom camera in / out</div>
            </div>
          </div>
        </div>

        {/* Mobile / Touch Section */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h4 className="text-xs uppercase font-bold text-amber-400 flex items-center gap-2">
            <Touchpad className="w-4 h-4" />
            Smartphone / Mobile Controls
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
            On touch devices, drag anywhere on screen to look around. Tap any artifact pedestal to select it and enter 360° inspect mode. Tap the <strong>Museum Map</strong> icon at any time to instantly teleport to any gallery hall!
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
        >
          Got It, Start Exploring
        </button>
      </div>
    </div>
  );
}
