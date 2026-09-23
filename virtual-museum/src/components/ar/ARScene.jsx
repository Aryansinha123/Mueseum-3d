"use client";

import React, { useRef, useCallback } from "react";
import { useXREvent } from "@react-three/xr";
import { ARPlacementIndicator } from "./ARPlacementIndicator";
import { ARArtifact } from "./ARArtifact";
import * as THREE from "three";

export function ARScene({
  selectedArtifact,
  onSelectArtifact,
  isPlaced,
  setIsPlaced,
  placedPosition,
  setPlacedPosition,
  placedQuaternion,
  setPlacedQuaternion,
  arScale,
  rotationY,
}) {
  // Real-time hit position & orientation tracked in refs to avoid 60fps React re-renders
  const lastHitRef = useRef([0, 0, 0]);
  const lastHitQuatRef = useRef([0, 0, 0, 1]);

  const attemptPlacement = useCallback(() => {
    if (!isPlaced && lastHitRef.current) {
      console.log("[AR] Artifact placed");
      setPlacedPosition([...lastHitRef.current]);
      if (lastHitQuatRef.current && setPlacedQuaternion) {
        setPlacedQuaternion([...lastHitQuatRef.current]);
      }
      setIsPlaced(true);
      console.log("[AR] Artifact transform locked");
    }
  }, [isPlaced, setPlacedPosition, setPlacedQuaternion, setIsPlaced]);

  // Listen for WebXR session tap/select events to confirm placement
  useXREvent("select", () => {
    attemptPlacement();
  });

  // Fallback pointer event handler for testing
  const handlePointerDown = (e) => {
    e.stopPropagation();
    attemptPlacement();
  };

  return (
    <group>
      {/* AR Scene Directional & Ambient Lighting */}
      <directionalLight position={[5, 10, 5]} intensity={1.8} />
      <ambientLight intensity={1.0} />

      {/* Transparent Tap Receiver Plane (active BEFORE placement only) */}
      {!isPlaced && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          onPointerDown={handlePointerDown}
          onClick={handlePointerDown}
          visible={true}
        >
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial
            transparent={true}
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Surface Detection Reticle - Active ONLY BEFORE placement */}
      {!isPlaced && (
        <ARPlacementIndicator
          active={!isPlaced}
          lastHitRef={lastHitRef}
          lastHitQuatRef={lastHitQuatRef}
        />
      )}

      {/* Placed & Locked AR Artifact Model */}
      {isPlaced && selectedArtifact && placedPosition && (
        <ARArtifact
          artifact={selectedArtifact}
          position={placedPosition}
          quaternion={placedQuaternion}
          rotationY={rotationY}
          arScale={arScale}
          isSelected={true}
          onSelect={onSelectArtifact}
        />
      )}
    </group>
  );
}

