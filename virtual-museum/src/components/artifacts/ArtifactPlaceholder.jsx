"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function ArtifactPlaceholder({ id, isHovered, isSelected }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle subtle breathing rotation for exhibits
      const speed = isSelected ? 0.8 : isHovered ? 0.4 : 0.15;
      groupRef.current.rotation.y += delta * speed;
    }
  });

  // Render unique procedural 3D model based on artifact ID
  switch (id) {
    case "ART001":
      // Bust of Socrates
      return (
        <group ref={groupRef} position={[0, 0.4, 0]}>
          {/* Base Stand */}
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.22, 0.25, 0.12, 32]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Torso & Shoulders */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.2, 0.35, 0.4, 16]} />
            <meshStandardMaterial color="#ded7cc" roughness={0.5} />
          </mesh>
          {/* Neck */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.2, 16]} />
            <meshStandardMaterial color="#e5ded3" roughness={0.45} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.38, 0.02]}>
            <sphereGeometry args={[0.17, 32, 32]} />
            <meshStandardMaterial color="#e8e1d7" roughness={0.4} />
          </mesh>
          {/* Beard detail */}
          <mesh position={[0, 0.3, 0.13]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#d4ccbf" roughness={0.6} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, 0.39, 0.17]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.035, 0.1, 12]} />
            <meshStandardMaterial color="#e0d9cd" roughness={0.4} />
          </mesh>
        </group>
      );

    case "ART002":
      // Attic Black-Figure Amphora
      return (
        <group ref={groupRef} position={[0, 0.5, 0]}>
          {/* Base pedestal attachment */}
          <mesh position={[0, -0.42, 0]}>
            <cylinderGeometry args={[0.15, 0.18, 0.08, 32]} />
            <meshStandardMaterial color="#943d24" roughness={0.4} />
          </mesh>
          {/* Lower Body Taper */}
          <mesh position={[0, -0.22, 0]}>
            <coneGeometry args={[0.3, 0.35, 32]} rotation={[Math.PI, 0, 0]} />
            <meshStandardMaterial color="#b34928" roughness={0.35} />
          </mesh>
          {/* Main Rounded Body */}
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.32, 32, 32]} />
            <meshStandardMaterial color="#1a1412" roughness={0.3} metalness={0.1} />
          </mesh>
          {/* Neck */}
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.16, 0.22, 0.28, 32]} />
            <meshStandardMaterial color="#b34928" roughness={0.4} />
          </mesh>
          {/* Rim Flange */}
          <mesh position={[0, 0.49, 0]}>
            <torusGeometry args={[0.17, 0.03, 16, 32]} />
            <meshStandardMaterial color="#80331b" roughness={0.3} />
          </mesh>
          {/* Left Handle */}
          <mesh position={[-0.24, 0.22, 0]} rotation={[0, 0, 0.2]}>
            <torusGeometry args={[0.16, 0.03, 16, 32, Math.PI * 1.1]} />
            <meshStandardMaterial color="#1a1412" roughness={0.4} />
          </mesh>
          {/* Right Handle */}
          <mesh position={[0.24, 0.22, 0]} rotation={[0, 0, -0.2]}>
            <torusGeometry args={[0.16, 0.03, 16, 32, Math.PI * 1.1]} />
            <meshStandardMaterial color="#1a1412" roughness={0.4} />
          </mesh>
        </group>
      );

    case "ART003":
      // Royal Ceremonial Gemmed Crown
      return (
        <group ref={groupRef} position={[0, 0.35, 0]}>
          {/* Main Crown Base Ring */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.16, 32, 1, true]} />
            <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.85} side={2} />
          </mesh>
          {/* Solid inner velvet cushion */}
          <mesh position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#6b0f1a" roughness={0.8} />
          </mesh>
          {/* 8 Crown Peaks */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.sin(angle) * 0.3;
            const z = Math.cos(angle) * 0.3;
            return (
              <group key={i} position={[x, 0.15, z]} rotation={[0, angle, 0]}>
                <mesh position={[0, 0.08, 0]}>
                  <coneGeometry args={[0.06, 0.18, 4]} />
                  <meshStandardMaterial color="#ffae00" roughness={0.15} metalness={0.9} />
                </mesh>
                {/* Gem on tip */}
                <mesh position={[0, 0.18, 0]}>
                  <sphereGeometry args={[0.03, 16, 16]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? "#e60033" : "#0055ff"}
                    roughness={0.1}
                    metalness={0.3}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      );

    case "ART004":
      // Cuneiform Decree Tablet
      return (
        <group ref={groupRef} position={[0, 0.45, 0]}>
          {/* Brass Holder Mount */}
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.45, 0.05, 0.25]} />
            <meshStandardMaterial color="#8a7335" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Main Clay Tablet Slab */}
          <mesh position={[0, 0.1, 0]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.42, 0.52, 0.08]} />
            <meshStandardMaterial color="#c2a685" roughness={0.8} />
          </mesh>
          {/* Cuneiform Line Grooves */}
          {[-0.15, -0.08, 0.0, 0.08, 0.15, 0.22].map((yOffset, idx) => (
            <mesh key={idx} position={[0, yOffset + 0.1, 0.045]} rotation={[-0.2, 0, 0]}>
              <boxGeometry args={[0.34, 0.015, 0.01]} />
              <meshStandardMaterial color="#8c7254" roughness={0.9} />
            </mesh>
          ))}
        </group>
      );

    case "ART005":
      // Golden Obelisk of Memphis
      return (
        <group ref={groupRef} position={[0, 0.8, 0]}>
          {/* Heavy Granite Base */}
          <mesh position={[0, -0.65, 0]}>
            <boxGeometry args={[0.55, 0.2, 0.55]} />
            <meshStandardMaterial color="#362d2b" roughness={0.5} />
          </mesh>
          {/* Tapered Shaft */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.18, 0.35, 1.3, 4]} />
            <meshStandardMaterial color="#4a3e3b" roughness={0.4} />
          </mesh>
          {/* Golden Pyramidion Peak */}
          <mesh position={[0, 0.88, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.26, 0.3, 4]} />
            <meshStandardMaterial color="#ffd700" roughness={0.15} metalness={0.95} />
          </mesh>
        </group>
      );

    case "ART011":
      // Salwasiren qatarensis Fossil Skeleton
      return (
        <group ref={groupRef} position={[0, 0.45, 0]}>
          {/* Paleontology display stand */}
          <mesh position={[0, -0.38, 0]}>
            <boxGeometry args={[0.6, 0.06, 0.35]} />
            <meshStandardMaterial color="#1e2024" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Fossil Rock Matrix Slab */}
          <mesh position={[0, -0.28, 0]}>
            <boxGeometry args={[0.56, 0.12, 0.32]} />
            <meshStandardMaterial color="#8c8275" roughness={0.85} />
          </mesh>
          {/* Curved Spine / Vertebral Column */}
          <mesh position={[0, -0.15, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.045, 0.48, 16]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ded5c5" roughness={0.7} />
          </mesh>
          {/* Ribs Array */}
          {[-0.18, -0.12, -0.06, 0.0, 0.06, 0.12, 0.18].map((xOffset, idx) => (
            <mesh key={idx} position={[xOffset, -0.19, 0]} rotation={[0.4, 0, 0]}>
              <torusGeometry args={[0.09, 0.016, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#cfc5b4" roughness={0.65} />
            </mesh>
          ))}
          {/* Cranium / Snout */}
          <mesh position={[0.26, -0.14, 0]} rotation={[0, 0, -0.2]}>
            <coneGeometry args={[0.07, 0.16, 12]} rotation={[0, 0, -Math.PI / 2]} />
            <meshStandardMaterial color="#d4cab8" roughness={0.7} />
          </mesh>
        </group>
      );

    case "ART012":
      // Tyrannosaurus rex Skull
      return (
        <group ref={groupRef} position={[0, 0.45, 0]}>
          {/* Cranium Vault */}
          <mesh position={[-0.05, 0.1, 0]}>
            <boxGeometry args={[0.34, 0.24, 0.22]} />
            <meshStandardMaterial color="#948472" roughness={0.75} />
          </mesh>
          {/* Heavy Snout / Maxilla */}
          <mesh position={[0.18, 0.05, 0]}>
            <boxGeometry args={[0.26, 0.16, 0.15]} />
            <meshStandardMaterial color="#887866" roughness={0.8} />
          </mesh>
          {/* Lower Jaw (Mandible) */}
          <mesh position={[0.1, -0.1, 0]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.38, 0.08, 0.14]} />
            <meshStandardMaterial color="#7a6b5a" roughness={0.8} />
          </mesh>
          {/* Eye Socket (Orbit) Cavity */}
          <mesh position={[-0.02, 0.12, 0.1]}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial color="#1f1a17" roughness={0.9} />
          </mesh>
          <mesh position={[-0.02, 0.12, -0.1]}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial color="#1f1a17" roughness={0.9} />
          </mesh>
          {/* Upper Serrated Teeth */}
          {[0.08, 0.15, 0.22, 0.28].map((xOff, idx) => (
            <mesh key={`t-${idx}`} position={[xOff, -0.05, 0.06]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.015, 0.06, 6]} />
              <meshStandardMaterial color="#e0d5c1" roughness={0.5} />
            </mesh>
          ))}
          {[0.08, 0.15, 0.22, 0.28].map((xOff, idx) => (
            <mesh key={`t2-${idx}`} position={[xOff, -0.05, -0.06]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.015, 0.06, 6]} />
              <meshStandardMaterial color="#e0d5c1" roughness={0.5} />
            </mesh>
          ))}
        </group>
      );

    case "ART013":
      // Triceratops horridus ("Hatcher")
      return (
        <group ref={groupRef} position={[0, 0.45, 0]}>
          {/* Massive Parietal Neck Frill */}
          <mesh position={[-0.14, 0.2, 0]} rotation={[0, 0, -0.3]}>
            <cylinderGeometry args={[0.28, 0.26, 0.04, 16, 1, false, 0, Math.PI]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#877764" roughness={0.8} />
          </mesh>
          {/* Skull Cranium */}
          <mesh position={[0.02, 0.05, 0]}>
            <boxGeometry args={[0.26, 0.18, 0.18]} />
            <meshStandardMaterial color="#948471" roughness={0.75} />
          </mesh>
          {/* Left Brow Horn */}
          <mesh position={[0.1, 0.24, 0.09]} rotation={[-0.2, 0, 0.6]}>
            <coneGeometry args={[0.035, 0.32, 12]} />
            <meshStandardMaterial color="#ded4bf" roughness={0.6} />
          </mesh>
          {/* Right Brow Horn */}
          <mesh position={[0.1, 0.24, -0.09]} rotation={[0.2, 0, 0.6]}>
            <coneGeometry args={[0.035, 0.32, 12]} />
            <meshStandardMaterial color="#ded4bf" roughness={0.6} />
          </mesh>
          {/* Nasal Horn */}
          <mesh position={[0.22, 0.14, 0]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.025, 0.14, 10]} />
            <meshStandardMaterial color="#ded4bf" roughness={0.6} />
          </mesh>
          {/* Beaked Snout */}
          <mesh position={[0.22, 0.0, 0]}>
            <coneGeometry args={[0.06, 0.15, 8]} rotation={[0, 0, -Math.PI / 2]} />
            <meshStandardMaterial color="#786a58" roughness={0.8} />
          </mesh>
        </group>
      );

    case "ART014":
      // Woolly Mammoth Tusk & Molar
      return (
        <group ref={groupRef} position={[0, 0.45, 0]}>
          {/* Massive Sweeping Curved Tusk */}
          <mesh position={[-0.05, 0.1, 0]} rotation={[0.3, 0.4, 0.8]}>
            <torusGeometry args={[0.34, 0.045, 16, 32, Math.PI * 0.9]} />
            <meshStandardMaterial color="#e8decc" roughness={0.45} />
          </mesh>
          {/* Tusk Tip */}
          <mesh position={[0.26, 0.34, 0.08]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.04, 0.14, 16]} />
            <meshStandardMaterial color="#ebd9b5" roughness={0.4} />
          </mesh>
          {/* Mammoth Molar Block (Distinct high-crowned ridge plates) */}
          <mesh position={[0.0, -0.22, 0.08]}>
            <boxGeometry args={[0.22, 0.16, 0.12]} />
            <meshStandardMaterial color="#5e5345" roughness={0.85} />
          </mesh>
          {/* Enamel Plates / Ridges on Molar */}
          {[-0.08, -0.04, 0.0, 0.04, 0.08].map((xOff, idx) => (
            <mesh key={`m-${idx}`} position={[xOff, -0.13, 0.08]}>
              <boxGeometry args={[0.015, 0.04, 0.11]} />
              <meshStandardMaterial color="#d4c9b2" roughness={0.6} />
            </mesh>
          ))}
        </group>
      );

    case "ART015":
      // Smilodon fatalis (Sabertooth Cat Skull)
      return (
        <group ref={groupRef} position={[0, 0.45, 0]}>
          {/* Compact Carnivore Cranium */}
          <mesh position={[-0.06, 0.06, 0]}>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshStandardMaterial color="#8a7c6b" roughness={0.7} />
          </mesh>
          {/* Snout & Zygomatic Arches */}
          <mesh position={[0.1, 0.02, 0]}>
            <boxGeometry args={[0.18, 0.12, 0.13]} />
            <meshStandardMaterial color="#7a6c5b" roughness={0.75} />
          </mesh>
          {/* Left Iconic Saber Fang */}
          <mesh position={[0.12, -0.14, 0.06]} rotation={[-0.05, 0, 0.18]}>
            <coneGeometry args={[0.022, 0.28, 12]} rotation={[Math.PI, 0, 0]} />
            <meshStandardMaterial color="#eae2d2" roughness={0.35} metalness={0.1} />
          </mesh>
          {/* Right Iconic Saber Fang */}
          <mesh position={[0.12, -0.14, -0.06]} rotation={[0.05, 0, 0.18]}>
            <coneGeometry args={[0.022, 0.28, 12]} rotation={[Math.PI, 0, 0]} />
            <meshStandardMaterial color="#eae2d2" roughness={0.35} metalness={0.1} />
          </mesh>
          {/* Mandible Jaw */}
          <mesh position={[0.06, -0.1, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.2, 0.05, 0.1]} />
            <meshStandardMaterial color="#695c4d" roughness={0.8} />
          </mesh>
        </group>
      );
  }
}
