"use client";

import React from "react";
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
  const handleHitUpdate = (hitData) => {
    if (!isPlaced && hitData && hitData.position) {
      setLastHitPosition(hitData.position);
    }
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (!isPlaced && lastHitPosition) {
      setPlacedPosition(lastHitPosition);
      setIsPlaced(true);
    }
  };

  return (
    <group>
      {/* AR Scene Lighting */}
      <directionalLight position={[5, 10, 5]} intensity={1.8} />
      <ambientLight intensity={1.0} />

      {/* Invisible Tap Receiver Plane when not placed */}
      {!isPlaced && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          onPointerDown={handlePointerDown}
          visible={false}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial side={THREE.DoubleSide} />
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
