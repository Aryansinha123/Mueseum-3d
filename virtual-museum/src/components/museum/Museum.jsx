"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { XR } from "@react-three/xr";
import { xrStore } from "../../utils/xrStore";
import { MuseumEnvironment } from "./MuseumEnvironment";
import { ArtifactManager } from "../artifacts/ArtifactManager";
import { MuseumControls } from "../controls/MuseumControls";
import { ARScene } from "../ar/ARScene";
import { artifactsData } from "../../data/artifacts";

export function Museum({
  selectedArtifact,
  onSelectArtifact,
  controlMode,
  onCameraMove,
  isPointerLocked,
  setIsPointerLocked,
  isArMode,
  isPlaced,
  setIsPlaced,
  placedPosition,
  setPlacedPosition,
  lastHitPosition,
  setLastHitPosition,
  arScale,
  rotationY,
}) {
  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950">
      <Canvas
        shadows={!isArMode ? "basic" : false}
        camera={{
          fov: 60,
          near: 0.1,
          far: 100,
          position: [0, 1.65, 23],
        }}
        gl={{ antialias: true }}
      >
        {isArMode ? (
          /* Active Mobile AR Session Scene */
          <XR store={xrStore}>
            <ARScene
              selectedArtifact={selectedArtifact}
              onSelectArtifact={onSelectArtifact}
              isPlaced={isPlaced}
              setIsPlaced={setIsPlaced}
              placedPosition={placedPosition}
              setPlacedPosition={setPlacedPosition}
              lastHitPosition={lastHitPosition}
              setLastHitPosition={setLastHitPosition}
              arScale={arScale}
              rotationY={rotationY}
            />
          </XR>
        ) : (
          /* Standard Desktop 3D Museum Experience */
          <>
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
          </>
        )}
      </Canvas>
    </div>
  );
}

