"use client";

import React from "react";
import { ARPlacementIndicator } from "./ARPlacementIndicator";
import { ARArtifact } from "./ARArtifact";

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
    if (!isPlaced) {
      setLastHitPosition(hitData.position);
    }
  };

  const handlePointerDownScreen = (e) => {
    if (!isPlaced && lastHitPosition) {
      setPlacedPosition(lastHitPosition);
      setIsPlaced(true);
    }
  };

  return (
    <group onPointerDown={handlePointerDownScreen}>
      {/* AR Scene Ambient & Directional Lighting */}
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <ambientLight intensity={0.9} />

      {/* Plane Placement Indicator */}
      {!isPlaced && (
        <ARPlacementIndicator
          active={!isPlaced}
          onHitUpdate={handleHitUpdate}
        />
      )}

      {/* Anchored AR Artifact */}
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
