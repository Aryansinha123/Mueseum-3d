"use client";

import React from "react";
import { X, Navigation, MapPin } from "lucide-react";

export function MuseumMap({
  isOpen,
  onClose,
  artifacts,
  galleries,
  cameraPosition,
  onTeleport,
}) {
  if (!isOpen) return null;

  // Convert 3D world coordinates [x, z] to 2D Map SVG pixels
  // Museum bounds: X: -22 to +22, Z: -22 to +22
  const worldToMap = (x, z) => {
    const mapSize = 340;
    const px = ((x + 22) / 44) * mapSize;
    const py = ((z + 22) / 44) * mapSize;
    return { x: px, y: py };
  };

  const visitorPos = cameraPosition
    ? worldToMap(cameraPosition[0], cameraPosition[2])
    : worldToMap(0, 17);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base tracking-wide text-amber-100">
              MUSEUM FLOOR PLAN & NAVIGATOR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive 2D Vector Floor Plan Map */}
        <div className="relative w-full aspect-square bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 340 340" className="w-full h-full">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="340" height="340" fill="url(#grid)" />

            {/* Perimeter Wall Outline */}
            <rect
              x="20"
              y="20"
              width="300"
              height="300"
              fill="none"
              stroke="#334155"
              strokeWidth="4"
              rx="12"
            />

            {/* GALLERY ROOM BOUNDARIES & LABELS */}

            {/* Entrance Atrium */}
            <rect
              x="110"
              y="270"
              width="120"
              height="40"
              fill="#1e293b"
              stroke="#f59e0b"
              strokeWidth="1.5"
              rx="6"
              className="cursor-pointer hover:fill-amber-500/20 transition-all"
              onClick={() => onTeleport([0, 1.7, 17])}
            />
            <text x="170" y="294" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">
              ENTRANCE ATRIUM
            </text>

            {/* Central Rotunda Lobby */}
            <circle
              cx="170"
              cy="170"
              r="45"
              fill="#0f172a"
              stroke="#475569"
              strokeWidth="2"
              className="cursor-pointer hover:fill-slate-800 transition-all"
              onClick={() => onTeleport([0, 1.7, 5])}
            />
            <text x="170" y="174" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
              LOBBY ROTUNDA
            </text>

            {/* Gallery 1 (Left Wing) */}
            <rect
              x="30"
              y="110"
              width="90"
              height="120"
              fill="#1e1b4b"
              stroke="#6366f1"
              strokeWidth="1.5"
              rx="8"
              className="cursor-pointer hover:fill-indigo-900/40 transition-all"
              onClick={() => onTeleport([-12, 1.7, 0])}
            />
            <text x="75" y="170" fill="#a5b4fc" fontSize="9" fontWeight="bold" textAnchor="middle">
              GALLERY 1
            </text>
            <text x="75" y="184" fill="#818cf8" fontSize="7" textAnchor="middle">
              Classical
            </text>

            {/* Gallery 2 (Right Wing) */}
            <rect
              x="220"
              y="110"
              width="90"
              height="120"
              fill="#312e81"
              stroke="#818cf8"
              strokeWidth="1.5"
              rx="8"
              className="cursor-pointer hover:fill-indigo-900/40 transition-all"
              onClick={() => onTeleport([12, 1.7, 0])}
            />
            <text x="265" y="170" fill="#a5b4fc" fontSize="9" fontWeight="bold" textAnchor="middle">
              GALLERY 2
            </text>
            <text x="265" y="184" fill="#818cf8" fontSize="7" textAnchor="middle">
              Medieval
            </text>

            {/* Gallery 3 (Rear Main Hall) */}
            <rect
              x="70"
              y="30"
              width="200"
              height="75"
              fill="#451a03"
              stroke="#d97706"
              strokeWidth="1.5"
              rx="8"
              className="cursor-pointer hover:fill-amber-900/40 transition-all"
              onClick={() => onTeleport([0, 1.7, -12])}
            />
            <text x="170" y="65" fill="#fde68a" fontSize="10" fontWeight="bold" textAnchor="middle">
              GALLERY 3: ANCIENT WONDERS
            </text>

            {/* ARTIFACT PINS */}
            {artifacts.map((art) => {
              const pos = worldToMap(art.position[0], art.position[2]);
              return (
                <g
                  key={art.id}
                  className="cursor-pointer group"
                  onClick={() => onTeleport([art.position[0], 1.7, art.position[2] + 2.5])}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="9"
                    fill="#f59e0b"
                    className="group-hover:scale-125 transition-all shadow-md"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 3}
                    fill="#0f172a"
                    fontSize="7"
                    fontWeight="extrabold"
                    textAnchor="middle"
                  >
                    {art.id.replace("ART", "")}
                  </text>
                </g>
              );
            })}

            {/* VISITOR POSITION BLUE DOT */}
            <g>
              <circle
                cx={visitorPos.x}
                cy={visitorPos.y}
                r="7"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="2"
                className="animate-pulse"
              />
              <circle
                cx={visitorPos.x}
                cy={visitorPos.y}
                r="14"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                opacity="0.6"
              />
            </g>
          </svg>
        </div>

        {/* Legend & Instructions */}
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400 border border-white" />
            <span>Visitor Location</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Artifact Exhibits (Click to Teleport)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
