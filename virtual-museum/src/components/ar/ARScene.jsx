"use client";

import React, { useRef, useCallback, useEffect } from "react";
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
  // Real-time hit position tracked in refs to avoid 60fps React re-renders
  const lastHitRef = useRef([0, 0, 0]);
  const placementCooldownRef = useRef(0);
  const prevIsPlacedRef = useRef(isPlaced);

  // When placement is cleared (via the Move option), enforce a cooldown to ignore the initiating tap
  useEffect(() => {
    if (prevIsPlacedRef.current && !isPlaced) {
      placementCooldownRef.current = Date.now() + 600;
      lastHitRef.current = [0, 0, 0];
      console.log("[AR] Placement cleared for repositioning (Move mode active)");
    }
    prevIsPlacedRef.current = isPlaced;
  }, [isPlaced]);

  const attemptPlacement = useCallback(() => {
    if (Date.now() < placementCooldownRef.current) {
      console.log("[AR] Placement tap ignored during cooldown");
      return;
    }
    if (!isPlaced) {
      const pos = lastHitRef.current || [0, 0, 0];
      console.log("[AR] Artifact placed at", pos);
      setPlacedPosition([...pos]);
      setIsPlaced(true);
      console.log("[AR] Artifact transform locked");
    }
  }, [isPlaced, setPlacedPosition, setIsPlaced]);

  // Listen for WebXR session tap/select events to confirm placement
  useXREvent("select", () => {
    attemptPlacement();
  });

  // Fallback pointer event handler for testing
  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (e.point) {
      lastHitRef.current = [e.point.x, e.point.y, e.point.z];
    }
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
        />
      )}

      {/* Placed & Locked AR Artifact Model */}
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

