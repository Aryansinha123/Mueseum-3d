"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { artifactsData, galleriesData } from "@/data/artifacts";
import { MuseumHUD } from "@/components/ui/MuseumHUD";
import { ArtifactInfo } from "@/components/ui/ArtifactInfo";
import { MuseumMap } from "@/components/ui/MuseumMap";
import { ControlsOverlay } from "@/components/ui/ControlsOverlay";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

// Dynamically import 3D Canvas component to prevent Next.js SSR evaluation
const MuseumCanvas = dynamic(
  () => import("@/components/museum/Museum").then((mod) => mod.Museum),
  { ssr: false }
);

export default function Home() {
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [controlMode, setControlMode] = useState("first-person"); // 'first-person' or 'inspect'
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([0, 1.65, 23]);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // Compute current gallery location based on camera coordinates
  const currentGalleryName = useMemo(() => {
    const [x, y, z] = cameraPosition;
    if (z > 18) return "Main Entrance Doorway";
    if (z > 3 && Math.abs(x) < 7) return "Central Rotunda Lobby";
    if (x < -7) return "Gallery 1: Classical Antiquities";
    if (x > 7) return "Gallery 2: Medieval Treasures";
    if (z < -8) return "Final Gallery 3: Ancient Wonders Hall";
    return "Central Rotunda Lobby";
  }, [cameraPosition]);

  const handleSelectArtifact = (artifact) => {
    setSelectedArtifact(artifact);
  };

  const handleCloseArtifactInfo = () => {
    setSelectedArtifact(null);
    setControlMode("first-person");
  };

  const handleExploreArtifact = () => {
    setControlMode("inspect");
  };

  const handleTeleport = (targetPos) => {
    setCameraPosition(targetPos);
    setIsMapOpen(false);
  };

  const handleResetCamera = () => {
    setCameraPosition([0, 1.65, 23]);
    setSelectedArtifact(null);
    setControlMode("first-person");
  };

  return (
    <main className="w-screen h-screen relative overflow-hidden bg-slate-950 select-none">
      {/* 3D Preloader Screen */}
      <LoadingScreen />

      {/* Main 3D Canvas Viewport */}
      <MuseumCanvas
        selectedArtifact={selectedArtifact}
        onSelectArtifact={handleSelectArtifact}
        controlMode={controlMode}
        onCameraMove={setCameraPosition}
        isPointerLocked={isPointerLocked}
        setIsPointerLocked={setIsPointerLocked}
      />

      {/* Top HUD Header & Floating Controls */}
      <MuseumHUD
        controlMode={controlMode}
        setControlMode={setControlMode}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenControls={() => setIsControlsOpen(true)}
        onResetCamera={handleResetCamera}
        selectedArtifact={selectedArtifact}
        currentGalleryName={currentGalleryName}
      />

      {/* Artifact Inspect Detail Modal */}
      {selectedArtifact && (
        <ArtifactInfo
          artifact={selectedArtifact}
          onClose={handleCloseArtifactInfo}
          onExplore={handleExploreArtifact}
        />
      )}

      {/* 2D Interactive Museum Floorplan Map */}
      <MuseumMap
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        artifacts={artifactsData}
        galleries={galleriesData}
        cameraPosition={cameraPosition}
        onTeleport={handleTeleport}
      />

      {/* Keyboard & Touch Navigation Guide */}
      <ControlsOverlay
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
      />
    </main>
  );
}
