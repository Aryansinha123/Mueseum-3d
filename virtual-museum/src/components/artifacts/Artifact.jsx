"use client";

import React, { useState, useEffect, Component, Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { ArtifactPlaceholder } from "./ArtifactPlaceholder";
import { AutoFitModel } from "./AutoFitModel";
import { checkGlbAssetExists } from "../../utils/artifactValidator";

// Error Boundary for GLB model loading runtime failures
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
        `[Artifact Pipeline] ${this.props.artifactId} model failed to load. Source: ${this.props.institution || "Museum Collection"}. Place GLB at public${this.props.modelPath}`
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

function GlbModelLoader({ modelPath, scale }) {
  const { scene } = useGLTF(modelPath);
  return <AutoFitModel object={scene} userScale={scale || 1} targetSize={0.65} />;
}

export function Artifact({
  artifact,
  isSelected,
  onSelectArtifact,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAssetPresent, setIsAssetPresent] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function verifyAsset() {
      if (!artifact.modelPath) {
        if (isMounted) setIsAssetPresent(false);
        return;
      }
      const exists = await checkGlbAssetExists(artifact.modelPath);
      if (isMounted) {
        setIsAssetPresent(exists);
        if (!exists && process.env.NODE_ENV !== "production") {
          console.info(
            `[Artifact Pipeline] 3D model missing for ${artifact.id}. Place GLB file at public${artifact.modelPath}`
          );
        }
      }
    }

    verifyAsset();

    return () => {
      isMounted = false;
    };
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

      {/* Render real GLB model ONLY if asset exists on disk; otherwise render placeholder cleanly without 404 console errors */}
      {isAssetPresent && artifact.modelPath ? (
        <ModelErrorBoundary
          artifactId={artifact.id}
          modelPath={artifact.modelPath}
          institution={artifact.institution || artifact.source}
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
