"use client";

import React, { useRef, useEffect, useCallback } from "react";
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
  lastHitPosition,
  setLastHitPosition,
  arScale,
  rotationY,
}) {
  const lastHitRef = useRef(lastHitPosition);

  // Keep ref synchronized with state
  useEffect(() => {
    lastHitRef.current = lastHitPosition;
  }, [lastHitPosition]);

  const handleHitUpdate = useCallback(
    (hitData) => {
      if (!isPlaced && hitData && hitData.position) {
        lastHitRef.current = hitData.position;
        setLastHitPosition(hitData.position);
      }
    },
    [isPlaced, setLastHitPosition]
  );

  const attemptPlacement = useCallback(() => {
    if (!isPlaced && lastHitRef.current) {
      setPlacedPosition([...lastHitRef.current]);
      setIsPlaced(true);
    }
  }, [isPlaced, setPlacedPosition, setIsPlaced]);

  // Use @react-three/xr's useXREvent to listen for WebXR session 'select' events.
  // This is the correct, reliable way to handle tap-to-place on mobile AR
  // instead of polling window.__activeXRSession.
  useXREvent("select", () => {
    attemptPlacement();
  });

  // Fallback: also handle R3F pointer events for testing/desktop
  const handlePointerDown = (e) => {
    e.stopPropagation();
    attemptPlacement();
  };

  return (
    <group>
      {/* AR Scene Directional & Ambient Lighting */}
      <directionalLight position={[5, 10, 5]} intensity={1.8} />
      <ambientLight intensity={1.0} />

      {/* Transparent Tap Receiver Plane (visible=true + opacity=0 ensures R3F raycasting catches touch taps) */}
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

      {/* Surface Hit Test Reticle */}
      {!isPlaced && (
        <ARPlacementIndicator
          active={!isPlaced}
          onHitUpdate={handleHitUpdate}
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
