"use client";

import React, { useState, useEffect, Component, Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
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

function GlbModelLoader({ modelPath, scale, artifactId }) {
  const gltf = useGLTF(modelPath);

  // Preserve frustum culling on child meshes for GPU optimization
  useMemo(() => {
    if (gltf?.scene) {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = true;
        }
      });
    }
  }, [gltf]);

  return (
    <AutoFitModel
      object={gltf.scene}
      userScale={scale || 1}
      targetSize={0.65}
      artifactId={artifactId}
    />
  );
}

export const Artifact = React.memo(function Artifact({
  artifact,
  isSelected,
  onSelectArtifact,
  cameraPosition,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAssetPresent, setIsAssetPresent] = useState(false);
  const { camera } = useThree();

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
      }
    }

    verifyAsset();
    return () => {
      isMounted = false;
    };
  }, [artifact]);

  // Compute distance from camera to artifact position for proximity lazy loading
  const isWithinProximity = useMemo(() => {
    if (isSelected || isHovered) return true;
    const camX = cameraPosition ? cameraPosition[0] : camera.position.x;
    const camZ = cameraPosition ? cameraPosition[2] : camera.position.z;
    const artX = artifact.position ? artifact.position[0] : 0;
    const artZ = artifact.position ? artifact.position[2] : 0;
    const dx = camX - artX;
    const dz = camZ - artZ;
    return dx * dx + dz * dz <= 625; // 25 meters radius
  }, [cameraPosition, camera.position.x, camera.position.z, artifact.position, isSelected, isHovered]);

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

  // Pedestal height offset: top of pedestal is at y = pedestalHeight (default 1.2)
  const pedestalHeight = artifact.pedestalHeight || 1.2;
  const artifactPositionY = (artifact.position ? artifact.position[1] : 0) + pedestalHeight;
  const artifactPosition = [
    artifact.position ? artifact.position[0] : 0,
    artifactPositionY,
    artifact.position ? artifact.position[2] : 0,
  ];

  return (
    <group
      position={artifactPosition}
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

      {/* Render real GLB model ONLY if within viewing proximity & asset exists; otherwise render procedural placeholder */}
      {isAssetPresent && artifact.modelPath && isWithinProximity ? (
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
        <group position={[0, 0.8, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color={isSelected ? "#f59e0b" : "#3b82f6"} />
          </mesh>
        </group>
      )}
    </group>
  );
});
