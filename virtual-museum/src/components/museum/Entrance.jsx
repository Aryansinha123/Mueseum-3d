"use client";

import React from "react";
import { Text } from "@react-three/drei";

export function Entrance() {
  return (
    <group position={[0, 0, 17]}>
      {/* Welcome Information Desk */}
      <mesh position={[0, 0.55, -2]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 1.1, 0.9]} />
        <meshStandardMaterial color="#1a1c23" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Information Desk Wooden Top Counter */}
      <mesh position={[0, 1.12, -2]}>
        <boxGeometry args={[3.4, 0.08, 1.0]} />
        <meshStandardMaterial color="#8a633b" roughness={0.3} />
      </mesh>

      {/* Welcome Banner Arch Sign mounted high above entrance portal */}
      <group position={[0, 3.8, 1.5]}>
        {/* Signboard Backing */}
        <mesh>
          <boxGeometry args={[6.5, 0.75, 0.08]} />
          <meshStandardMaterial color="#111216" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Brass Border */}
        <mesh position={[0, 0, 0.045]}>
          <boxGeometry args={[6.6, 0.82, 0.02]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Title Text */}
        <Text
          position={[0, 0.08, 0.06]}
          fontSize={0.26}
          color="#fef08a"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          VIRTUAL HERITAGE MUSEUM
        </Text>
        {/* Subtitle */}
        <Text
          position={[0, -0.16, 0.06]}
          fontSize={0.12}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          INTERACTIVE 3D CULTURAL GALLERY
        </Text>
      </group>
    </group>
  );
}
