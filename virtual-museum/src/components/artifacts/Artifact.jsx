"use client";

import React, { useState, useEffect, Component, Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { ArtifactPlaceholder } from "./ArtifactPlaceholder";
import { AutoFitModel } from "./AutoFitModel";

// Error Boundary for missing GLB model files
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `${this.props.artifactId} model not found or failed to load. Place the Smithsonian GLB at public${this.props.modelPath}`
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function GlbModelLoader({ modelPath, scale, artifactId }) {
  const { scene } = useGLTF(modelPath);
  return <AutoFitModel object={scene} userScale={scale || 1} targetSize={0.65} />;
}

export function Artifact({
  artifact,
  isSelected,
  onSelectArtifact,
}) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Log development helpful notice if GLB path is set
    if (artifact.modelPath && process.env.NODE_ENV !== "production") {
      // dev console notice logged when GLB error boundary catches or loads
    }
  }, [artifact]);

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelectArtifact) {
      onSelectArtifact(artifact);
    }
  };

  const placeholder = (
    <ArtifactPlaceholder
      id={artifact.id}
      isHovered={isHovered}
      isSelected={isSelected}
    />
  );

  return (
    <group
      position={artifact.position}
      rotation={artifact.rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Base highlight ring when hovered or selected */}
      {(isHovered || isSelected) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial
            color={isSelected ? "#f59e0b" : "#3b82f6"}
            transparent
            opacity={isSelected ? 0.85 : 0.5}
          />
        </mesh>
      )}

      {/* Render real GLB model with ErrorBoundary fallback to procedural 3D artifact */}
      {artifact.modelPath ? (
        <ModelErrorBoundary
          artifactId={artifact.id}
          modelPath={artifact.modelPath}
          fallback={placeholder}
        >
          <Suspense fallback={placeholder}>
            <GlbModelLoader
              modelPath={artifact.modelPath}
              scale={artifact.scale}
              artifactId={artifact.id}
            />
          </Suspense>
        </ModelErrorBoundary>
      ) : (
        placeholder
      )}

      {/* 3D Floating Beacon Marker */}
      {(isHovered || isSelected) && (
        <group position={[0, 1.6, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color={isSelected ? "#f59e0b" : "#3b82f6"} />
          </mesh>
        </group>
      )}
    </group>
  );
}
