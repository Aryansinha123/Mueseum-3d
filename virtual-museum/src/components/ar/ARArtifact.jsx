"use client";

import React, { useState, useRef, Component, Suspense } from "react";
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

function GlbARLoader({ modelPath, userScale, arScaleMultiplier }) {
  const { scene } = useGLTF(modelPath);
  const totalScale = (userScale || 1) * (arScaleMultiplier || 1);
  return <AutoFitModel object={scene} userScale={totalScale} targetSize={0.5} />;
}

export function ARArtifact({
  artifact,
  position,
  rotationY = 0,
  arScale = 1.0,
  isSelected,
  onSelect,
  onUpdateTransform,
}) {
  const groupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  // Touch gesture state tracking
  const touchStartRef = useRef({
    distance: 0,
    angle: 0,
    position: [0, 0],
    isDragging: false,
    isPinching: false,
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(artifact);
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
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
    >
      {/* Selection Base Indicator Ring */}
      {(isSelected || isHovered) && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.35, 32]} />
          <meshBasicMaterial
            color={isSelected ? "#f59e0b" : "#60a5fa"}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Render GLB model without pedestal */}
      {artifact.modelPath ? (
        <ARModelErrorBoundary fallback={placeholder}>
          <Suspense fallback={placeholder}>
            <GlbARLoader
              modelPath={artifact.modelPath}
              userScale={artifact.scale}
              arScaleMultiplier={arScale}
            />
          </Suspense>
        </ARModelErrorBoundary>
      ) : (
        placeholder
      )}

      {/* Selection Beacon */}
      {isSelected && (
        <mesh position={[0, 0.8 * arScale, 0]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      )}
    </group>
  );
}
