"use client";

import React from "react";
import { Text } from "@react-three/drei";

export function Door({ position, rotation, title, subtitle }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Outer Door Frame Archway */}
      {/* Left Pillar */}
      <mesh position={[-1.6, 1.8, 0]}>
        <boxGeometry args={[0.3, 3.6, 0.4]} />
        <meshStandardMaterial color="#22242a" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Right Pillar */}
      <mesh position={[1.6, 1.8, 0]}>
        <boxGeometry args={[0.3, 3.6, 0.4]} />
        <meshStandardMaterial color="#22242a" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Top Header Beam */}
      <mesh position={[0, 3.75, 0]}>
        <boxGeometry args={[3.5, 0.3, 0.4]} />
        <meshStandardMaterial color="#22242a" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Left Door Leaf (Partially Open Frame) */}
      <mesh position={[-0.75, 1.75, 0.15]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[1.35, 3.4, 0.08]} />
        <meshStandardMaterial color="#4a2c1d" roughness={0.4} />
      </mesh>
      {/* Left Brass Door Handle */}
      <mesh position={[-0.2, 1.7, 0.28]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Right Door Leaf (Partially Open Frame) */}
      <mesh position={[0.75, 1.75, 0.15]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[1.35, 3.4, 0.08]} />
        <meshStandardMaterial color="#4a2c1d" roughness={0.4} />
      </mesh>
      {/* Right Brass Door Handle */}
      <mesh position={[0.2, 1.7, 0.28]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Illuminated Header Sign above Door */}
      {title && (
        <group position={[0, 4.15, 0.22]}>
          <mesh>
            <boxGeometry args={[3.6, 0.5, 0.06]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </mesh>
          <Text
            position={[0, 0.06, 0.04]}
            fontSize={0.16}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {title.toUpperCase()}
          </Text>
          {subtitle && (
            <Text
              position={[0, -0.12, 0.04]}
              fontSize={0.09}
              color="#94a3b8"
              anchorX="center"
              anchorY="middle"
            >
              {subtitle}
            </Text>
          )}
        </group>
      )}
    </group>
  );
}
