"use client";

import React from "react";
import { Floor } from "./Floor";
import { Walls } from "./Walls";
import { Ceiling } from "./Ceiling";
import { Entrance } from "./Entrance";
import { Gallery } from "./Gallery";
import { Door } from "./Door";

export function MuseumEnvironment() {
  return (
    <group>
      {/* Overall Ambient & Hemisphere Lights */}
      <ambientLight intensity={0.75} color="#fff8ee" />
      <hemisphereLight
        skyColor="#fff0db"
        groundColor="#1e2029"
        intensity={0.8}
      />

      {/* Sun/Skylight Directional Light with Shadows */}
      <directionalLight
        position={[5, 14, 5]}
        intensity={1.2}
        color="#fffaf0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Central Rotunda Chandelier Light */}
      <pointLight position={[0, 4.2, 0]} intensity={14} color="#ffe8c2" distance={18} />

      {/* Architectural Elements */}
      <Floor />
      <Walls />
      <Ceiling />
      <Entrance />

      {/* ================= DOORS & PORTALS ================= */}
      {/* 1. Main Entrance Door (Walk in from outside -> Entrance Lobby) */}
      <Door
        position={[0, 0, 19.5]}
        rotation={[0, 0, 0]}
        title="MAIN ENTRANCE DOOR"
        subtitle="WALK FORWARD TO ENTER LOBBY"
      />

      {/* 2. Gallery 1 Door Portal (Lobby -> Left Gallery) */}
      <Door
        position={[-7, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        title="GALLERY 1 DOOR"
        subtitle="CLASSICAL ANTIQUITIES"
      />

      {/* 3. Gallery 2 Door Portal (Lobby -> Right Gallery) */}
      <Door
        position={[7, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        title="GALLERY 2 DOOR"
        subtitle="MEDIEVAL TREASURES"
      />

      {/* 4. Final Gallery 3 Door Portal (Lobby -> Rear Final Gallery) */}
      <Door
        position={[0, 0, -8]}
        rotation={[0, 0, 0]}
        title="FINAL GALLERY 3 DOOR"
        subtitle="ANCIENT WONDERS HALL"
      />

      {/* Gallery Wall Signage Banners */}
      <Gallery
        title="Gallery 1"
        subtitle="Classical Antiquities"
        position={[-11, 3.4, 6]}
        rotation={[0, 0, 0]}
      />

      <Gallery
        title="Gallery 2"
        subtitle="Medieval Treasures"
        position={[11, 3.4, 6]}
        rotation={[0, 0, 0]}
      />

      <Gallery
        title="Gallery 3"
        subtitle="Ancient Wonders Hall"
        position={[0, 3.4, -21.6]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}
