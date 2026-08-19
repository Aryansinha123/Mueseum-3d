"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { MuseumEnvironment } from "./MuseumEnvironment";
import { ArtifactManager } from "../artifacts/ArtifactManager";
import { MuseumControls } from "../controls/MuseumControls";
import { artifactsData } from "../../data/artifacts";

export function Museum({
  selectedArtifact,
  onSelectArtifact,
  controlMode,
  onCameraMove,
  isPointerLocked,
  setIsPointerLocked,
}) {
  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950">
      <Canvas
        shadows
        camera={{
          fov: 60,
          near: 0.1,
          far: 100,
          position: [0, 1.65, 23],
        }}
        gl={{ antialias: true }}
      >
        {/* Sky / Ambient background color */}
        <color attach="background" args={["#0c0d10"]} />
        <fog attach="fog" args={["#0c0d10", 15, 50]} />

        {/* 3D Architectural Environment with Doors */}
        <MuseumEnvironment />

        {/* 3D Artifacts & Pedestals */}
        <ArtifactManager
          artifacts={artifactsData}
          selectedArtifact={selectedArtifact}
          onSelectArtifact={onSelectArtifact}
        />

        {/* Navigation & Camera Controller */}
        <MuseumControls
          controlMode={controlMode}
          selectedArtifact={selectedArtifact}
          onCameraMove={onCameraMove}
          isPointerLocked={isPointerLocked}
          setIsPointerLocked={setIsPointerLocked}
        />
      </Canvas>
    </div>
  );
}
