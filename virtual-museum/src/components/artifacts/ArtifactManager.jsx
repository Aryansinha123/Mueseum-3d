"use client";

import React from "react";
import { Artifact } from "./Artifact";
import { Pedestal } from "../museum/Pedestal";

export const ArtifactManager = React.memo(function ArtifactManager({
  artifacts,
  selectedArtifact,
  onSelectArtifact,
  cameraPosition,
}) {
  return (
    <group>
      {artifacts.map((artifact) => {
        const isSelected = selectedArtifact?.id === artifact.id;
        return (
          <group key={artifact.id}>
            {/* Display Pedestal */}
            <Pedestal
              artifact={artifact}
              isSelected={isSelected}
              onSelectArtifact={onSelectArtifact}
            />

            {/* 3D Artifact Model */}
            <Artifact
              artifact={artifact}
              isSelected={isSelected}
              onSelectArtifact={onSelectArtifact}
              cameraPosition={cameraPosition}
            />
          </group>
        );
      })}
    </group>
  );
});
