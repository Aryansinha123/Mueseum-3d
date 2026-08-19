"use client";

import React from "react";
import { Text } from "@react-three/drei";

export function Gallery({ title, subtitle, position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wall Sign Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.2, 0.9, 0.04]} />
        <meshStandardMaterial color="#181a20" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Brass Frame Accent */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[4.3, 1.0, 0.02]} />
        <meshStandardMaterial color="#c5a059" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Title Text */}
      <Text
        position={[0, 0.12, 0.03]}
        fontSize={0.2}
        color="#fef08a"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {title.toUpperCase()}
      </Text>
      {/* Subtitle Text */}
      <Text
        position={[0, -0.16, 0.03]}
        fontSize={0.11}
        color="#cbd5e1"
        anchorX="center"
        anchorY="middle"
      >
        {subtitle}
      </Text>
    </group>
  );
}
