"use client";

import React from "react";

export function Floor() {
  return (
    <group>
      {/* Main Polished Museum Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 60]} />
        <meshStandardMaterial
          color="#1a1c23"
          roughness={0.18}
          metalness={0.35}
        />
      </mesh>

      {/* Decorative Marble Border Trim Inlays */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[7.8, 8.2, 32]} />
        <meshStandardMaterial color="#c5a059" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Gallery Walkway Inlays */}
      {/* Gallery 1 Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, 0.004, 0]}>
        <planeGeometry args={[8, 16]} />
        <meshStandardMaterial color="#222530" roughness={0.25} metalness={0.2} />
      </mesh>

      {/* Gallery 2 Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, 0.004, 0]}>
        <planeGeometry args={[8, 16]} />
        <meshStandardMaterial color="#222530" roughness={0.25} metalness={0.2} />
      </mesh>

      {/* Gallery 3 Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -14]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#222530" roughness={0.25} metalness={0.2} />
      </mesh>
    </group>
  );
}
