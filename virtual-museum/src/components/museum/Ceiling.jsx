"use client";

import React from "react";

export function Ceiling() {
  const ceilingHeight = 5;

  return (
    <group position={[0, ceilingHeight, 0]}>
      {/* Main Recessed Ceiling Plane */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial color="#202228" roughness={0.9} />
      </mesh>

      {/* Ceiling Architectural Beams */}
      {[-14, 0, 14].map((x, i) => (
        <mesh key={`beam-x-${i}`} position={[x, -0.15, 0]}>
          <boxGeometry args={[0.6, 0.3, 44]} />
          <meshStandardMaterial color="#14151a" roughness={0.7} />
        </mesh>
      ))}

      {[-12, 0, 12].map((z, i) => (
        <mesh key={`beam-z-${i}`} position={[0, -0.15, z]}>
          <boxGeometry args={[44, 0.3, 0.6]} />
          <meshStandardMaterial color="#14151a" roughness={0.7} />
        </mesh>
      ))}

      {/* Central Glass Skylight Panel */}
      <group position={[0, -0.05, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#7dd3fc"
            emissiveIntensity={0.6}
            roughness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
}
