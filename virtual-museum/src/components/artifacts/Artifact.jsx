"use client";

import React, { useState, Component, Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { ArtifactPlaceholder } from "./ArtifactPlaceholder";

// React Error Boundary to catch async 404 / GLTF parsing errors cleanly
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Fall back to 3D procedural placeholder without crashing Canvas
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function GlbModel({ modelPath, scale }) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene.clone()} scale={scale || 1} />;
}

export function Artifact({
  artifact,
  isSelected,
  onSelectArtifact,
}) {
  const [isHovered, setIsHovered] = useState(false);

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
      scale={artifact.scale || 1}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Highlight glow ring on base when hovered or selected */}
      {(isHovered || isSelected) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial
            color={isSelected ? "#f59e0b" : "#3b82f6"}
            transparent
            opacity={isSelected ? 0.8 : 0.5}
          />
        </mesh>
      )}

      {/* Render GLB model if modelPath is specified, wrapped in ErrorBoundary */}
      {artifact.modelPath ? (
        <ModelErrorBoundary fallback={placeholder}>
          <Suspense fallback={placeholder}>
            <GlbModel modelPath={artifact.modelPath} scale={artifact.scale} />
          </Suspense>
        </ModelErrorBoundary>
      ) : (
        placeholder
      )}

      {/* Floating 3D Beacon Indicator */}
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
