"use client";

import React, { useState, useRef, useEffect, Component, Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { AutoFitModel } from "../artifacts/AutoFitModel";
import { ArtifactPlaceholder } from "../artifacts/ArtifactPlaceholder";
import * as THREE from "three";

class ARModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function GlbARLoader({ modelPath, userScale, artifactId }) {
  const { scene } = useGLTF(modelPath);
  return (
    <AutoFitModel
      object={scene}
      userScale={userScale || 1}
      targetSize={0.65}
      artifactId={artifactId}
    />
  );
}

export function ARArtifact({
  artifact,
  position = [0, 0, 0],
  rotationY = 0,
  arScale = 1.0,
  isSelected = true,
  onSelect,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Preload GLB in Drei cache
  useEffect(() => {
    if (artifact?.modelPath && typeof useGLTF.preload === "function") {
      useGLTF.preload(artifact.modelPath);
    }
  }, [artifact?.modelPath]);

  const placeholder = (
    <ArtifactPlaceholder
      id={artifact.id}
      isHovered={isHovered}
      isSelected={isSelected}
    />
  );

  return (
    /* Level 1: ARAnchor - World Placement Position */
    <group position={position}>
      {/* Level 2: ArtifactRoot - User Transform (Rotation & Scale) */}
      <group
        rotation={[0, rotationY, 0]}
        scale={[arScale, arScale, arScale]}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(artifact);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
        }}
      >
        {/* Selection Base Ring */}
        {(isSelected || isHovered) && (
          <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.4, 32]} />
            <meshBasicMaterial
              color={isSelected ? "#f59e0b" : "#60a5fa"}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Level 3: GLB Model / Procedural Model Normalizer */}
        {artifact.modelPath ? (
          <ARModelErrorBoundary fallback={placeholder}>
            <Suspense fallback={placeholder}>
              <GlbARLoader
                modelPath={artifact.modelPath}
                userScale={artifact.scale}
                artifactId={artifact.id}
              />
            </Suspense>
          </ARModelErrorBoundary>
        ) : (
          placeholder
        )}

        {/* Floating Highlight Beacon */}
        {isSelected && (
          <mesh position={[0, 0.75, 0]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        )}
      </group>
    </group>
  );
}
