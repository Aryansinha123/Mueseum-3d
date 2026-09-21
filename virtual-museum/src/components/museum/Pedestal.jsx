"use client";

import React from "react";
import { Text } from "@react-three/drei";

export const Pedestal = React.memo(function Pedestal({
  artifact,
  isSelected,
  onSelectArtifact,
}) {
  const [x, y, z] = artifact.position;
  const pedestalHeight = artifact.pedestalHeight || 1.2;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelectArtifact) {
      onSelectArtifact(artifact);
    }
  };

  return (
    <group position={[x, 0, z]}>
      {/* Exhibit Spotlight focused on this pedestal */}
      <spotLight
        position={[0, 4.5, 0]}
        angle={0.45}
        penumbra={0.6}
        intensity={isSelected ? 35 : 22}
        color={isSelected ? "#fff6e0" : "#ffedd5"}
        distance={9}
      />

      {/* Subtle floor light ring under pedestal */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.85, 24]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.15} />
      </mesh>

      {/* Main Pedestal Base Block */}
      <mesh position={[0, pedestalHeight / 2, 0]} onClick={handleClick} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.72, pedestalHeight, 24]} />
        <meshStandardMaterial
          color="#1e2022"
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>

      {/* Upper Pedestal Molded Cap */}
      <mesh position={[0, pedestalHeight - 0.03, 0]}>
        <cylinderGeometry args={[0.7, 0.67, 0.06, 24]} />
        <meshStandardMaterial color="#2c2e33" roughness={0.2} metalness={0.6} />
      </mesh>

      {/* Lower Pedestal Plinth Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.75, 0.8, 0.1, 24]} />
        <meshStandardMaterial color="#111215" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Brass Plaque on Front of Pedestal */}
      <group position={[0, pedestalHeight * 0.6, 0.68]} rotation={[0, 0, 0]}>
        {/* Brass Plate — wider & taller to fit long names */}
        <mesh>
          <boxGeometry args={[0.92, 0.32, 0.02]} />
          <meshStandardMaterial color="#b89742" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Thin dark border inset */}
        <mesh position={[0, 0, 0.011]}>
          <boxGeometry args={[0.86, 0.26, 0.002]} />
          <meshStandardMaterial color="#8a6f28" roughness={0.5} metalness={0.6} />
        </mesh>

        {/* Artifact Name — wraps if too long */}
        <Text
          position={[0, 0.055, 0.016]}
          fontSize={0.044}
          color="#1a140a"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          maxWidth={0.8}
          textAlign="center"
          lineHeight={1.15}
          overflowWrap="break-word"
        >
          {artifact.name.toUpperCase()}
        </Text>

        {/* ID + Period sub-line */}
        <Text
          position={[0, -0.095, 0.016]}
          fontSize={0.028}
          color="#382c16"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.8}
          textAlign="center"
        >
          {`${artifact.id} • ${artifact.period}`}
        </Text>
      </group>
    </group>
  );
});
