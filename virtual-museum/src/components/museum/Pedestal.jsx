"use client";

import React from "react";
import { Text } from "@react-three/drei";

export function Pedestal({
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
        target-position={[0, 1.2, 0]}
        angle={0.45}
        penumbra={0.6}
        intensity={isSelected ? 35 : 22}
        color={isSelected ? "#fff6e0" : "#ffedd5"}
        castShadow
        distance={9}
      />

      {/* Subtle floor light ring under pedestal */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.85, 32]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.15} />
      </mesh>

      {/* Main Pedestal Base Block */}
      <mesh position={[0, pedestalHeight / 2, 0]} onClick={handleClick} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.72, pedestalHeight, 32]} />
        <meshStandardMaterial
          color="#1e2022"
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>

      {/* Upper Pedestal Molded Cap */}
      <mesh position={[0, pedestalHeight - 0.03, 0]}>
        <cylinderGeometry args={[0.7, 0.67, 0.06, 32]} />
        <meshStandardMaterial color="#2c2e33" roughness={0.2} metalness={0.6} />
      </mesh>

      {/* Lower Pedestal Plinth Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.75, 0.8, 0.1, 32]} />
        <meshStandardMaterial color="#111215" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Brass Plaque on Front of Pedestal */}
      <group position={[0, pedestalHeight * 0.6, 0.68]} rotation={[0, 0, 0]}>
        {/* Brass Plate */}
        <mesh>
          <boxGeometry args={[0.6, 0.22, 0.02]} />
          <meshStandardMaterial color="#b89742" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Text on Plaque */}
        <Text
          position={[0, 0.04, 0.015]}
          fontSize={0.05}
          color="#1a140a"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {artifact.name.toUpperCase()}
        </Text>

        <Text
          position={[0, -0.04, 0.015]}
          fontSize={0.032}
          color="#382c16"
          anchorX="center"
          anchorY="middle"
        >
          {`${artifact.id} • ${artifact.period}`}
        </Text>
      </group>
    </group>
  );
}
