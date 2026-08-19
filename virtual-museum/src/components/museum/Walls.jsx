"use client";

import React from "react";

export function Walls() {
  const wallMaterialProps = {
    color: "#e8e5de",
    roughness: 0.7,
    metalness: 0.05,
  };

  const trimMaterialProps = {
    color: "#282a30",
    roughness: 0.3,
    metalness: 0.5,
  };

  const wallHeight = 5;

  return (
    <group>
      {/* ================= OUTER PERIMETER WALLS ================= */}
      {/* Rear Perimeter Wall (Gallery 3 Back Wall) */}
      <mesh position={[0, wallHeight / 2, -22]} receiveShadow castShadow>
        <boxGeometry args={[44, wallHeight, 0.4]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
      {/* Baseboard Trim for Rear Wall */}
      <mesh position={[0, 0.15, -21.78]}>
        <boxGeometry args={[44, 0.3, 0.04]} />
        <meshStandardMaterial {...trimMaterialProps} />
      </mesh>

      {/* Front Perimeter Wall (Entrance Exit Wall) */}
      {/* Left Front Section */}
      <mesh position={[-14, wallHeight / 2, 22]} receiveShadow castShadow>
        <boxGeometry args={[16, wallHeight, 0.4]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
      {/* Right Front Section */}
      <mesh position={[14, wallHeight / 2, 22]} receiveShadow castShadow>
        <boxGeometry args={[16, wallHeight, 0.4]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>

      {/* Left Outer Perimeter Wall */}
      <mesh position={[-22, wallHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.4, wallHeight, 44]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
      {/* Baseboard Trim Left */}
      <mesh position={[-21.78, 0.15, 0]}>
        <boxGeometry args={[0.04, 0.3, 44]} />
        <meshStandardMaterial {...trimMaterialProps} />
      </mesh>

      {/* Right Outer Perimeter Wall */}
      <mesh position={[22, wallHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.4, wallHeight, 44]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
      {/* Baseboard Trim Right */}
      <mesh position={[21.78, 0.15, 0]}>
        <boxGeometry args={[0.04, 0.3, 44]} />
        <meshStandardMaterial {...trimMaterialProps} />
      </mesh>

      {/* ================= INTERIOR DIVIDER WALLS & DOORWAYS ================= */}

      {/* Left Wall Divider (between Lobby and Gallery 1) */}
      {/* Front Half of Left Divider */}
      <mesh position={[-7, wallHeight / 2, 12]} receiveShadow castShadow>
        <boxGeometry args={[0.4, wallHeight, 16]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
      {/* Rear Half of Left Divider */}
      <mesh position={[-7, wallHeight / 2, -12]} receiveShadow castShadow>
        <boxGeometry args={[0.4, wallHeight, 16]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
      {/* Archway Header Beam over Left Doorway */}
      <mesh position={[-7, 4.3, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.4, 1.4, 8]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>

      {/* Right Wall Divider (between Lobby and Gallery 2) */}
      {/* Front Half of Right Divider */}
      <mesh position={[7, wallHeight / 2, 12]} receiveShadow castShadow>
        <boxGeometry args={[0.4, wallHeight, 16]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
      {/* Rear Half of Right Divider */}
      <mesh position={[7, wallHeight / 2, -12]} receiveShadow castShadow>
        <boxGeometry args={[0.4, wallHeight, 16]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
      {/* Archway Header Beam over Right Doorway */}
      <mesh position={[7, 4.3, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.4, 1.4, 8]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>

      {/* Rear Wall Divider (between Lobby and Gallery 3) */}
      {/* Left Section of Rear Divider */}
      <mesh position={[-14, wallHeight / 2, -8]} receiveShadow castShadow>
        <boxGeometry args={[14, wallHeight, 0.4]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
      {/* Right Section of Rear Divider */}
      <mesh position={[14, wallHeight / 2, -8]} receiveShadow castShadow>
        <boxGeometry args={[14, wallHeight, 0.4]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
      {/* Archway Header Beam over Rear Doorway */}
      <mesh position={[0, 4.3, -8]} receiveShadow castShadow>
        <boxGeometry args={[14, 1.4, 0.4]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
    </group>
  );
}
