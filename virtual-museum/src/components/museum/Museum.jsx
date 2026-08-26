"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { XR } from "@react-three/xr";
import { xrStore } from "../../utils/xrStore";
import { MuseumEnvironment } from "./MuseumEnvironment";
import { ArtifactManager } from "../artifacts/ArtifactManager";
import { MuseumControls } from "../controls/MuseumControls";
import { ARScene } from "../ar/ARScene";
import { artifactsData } from "../../data/artifacts";

function WebGLFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center z-20">
      <div className="max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
        <h2 className="text-xl font-bold text-amber-400 mb-2">3D Viewport Notice</h2>
        <p className="text-slate-300 text-sm mb-4">
          WebGL rendering is operating in compatibility mode or context was reset.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
        >
          Reload 3D Museum
        </button>
      </div>
    </div>
  );
}

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
  const [hasWebGLError, setHasWebGLError] = useState(false);

  useEffect(() => {
    const handleContextLost = (e) => {
      e.preventDefault();
      console.warn("[Museum] WebGL Context Lost");
      setHasWebGLError(true);
    };

    window.addEventListener("webglcontextlost", handleContextLost);
    return () => window.removeEventListener("webglcontextlost", handleContextLost);
  }, []);

  if (hasWebGLError) {
    return <WebGLFallback />;
  }

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
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            setHasWebGLError(true);
          });
        }}
      >
        <Suspense fallback={null}>
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
        </Suspense>
      </Canvas>
    </div>
  );
}

