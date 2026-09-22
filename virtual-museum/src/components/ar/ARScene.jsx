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
  arScale,
  rotationY,
}) {
  // Real-time hit position tracked in a ref to avoid 60fps React re-renders
  const lastHitRef = useRef([0, 0, 0]);

  const attemptPlacement = useCallback(() => {
    if (!isPlaced && lastHitRef.current) {
      setPlacedPosition([...lastHitRef.current]);
      setIsPlaced(true);
    }
  }, [isPlaced, setPlacedPosition, setIsPlaced]);

  // Use @react-three/xr's useXREvent to listen for WebXR session 'select' events.
  useXREvent("select", () => {
    attemptPlacement();
  });

  // Fallback: handle R3F pointer events for testing
  const handlePointerDown = (e) => {
    e.stopPropagation();
    attemptPlacement();
  };

  return (
    <group>
      {/* AR Scene Directional & Ambient Lighting */}
      <directionalLight position={[5, 10, 5]} intensity={1.8} />
      <ambientLight intensity={1.0} />

      {/* Transparent Tap Receiver Plane (active before placement) */}
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

      {/* Instant Surface Hit Test Reticle */}
      {!isPlaced && (
        <ARPlacementIndicator
          active={!isPlaced}
          lastHitRef={lastHitRef}
        />
      )}

      {/* Placed AR Artifact Model */}
      {isPlaced && selectedArtifact && placedPosition && (
        <ARArtifact
          artifact={selectedArtifact}
          position={placedPosition}
          rotationY={rotationY}
          arScale={arScale}
          isSelected={true}
          onSelect={onSelectArtifact}
        />
      )}
    </group>
  );
}

