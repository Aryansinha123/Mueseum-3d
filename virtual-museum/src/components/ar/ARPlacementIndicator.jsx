"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useXRHitTest } from "@react-three/xr";
import * as THREE from "three";

export function ARPlacementIndicator({ active, onHitUpdate }) {
  const reticleRef = useRef();
  const matrixRef = useRef(new THREE.Matrix4());

  useXRHitTest((results, getWorldMatrix) => {
    if (!active || !results || results.length === 0) {
      if (reticleRef.current) {
        reticleRef.current.visible = false;
      }
      return;
    }

    // Process closest surface hit result
    const hit = results[0];
    if (hit && getWorldMatrix(matrixRef.current, hit)) {
      if (reticleRef.current) {
        matrixRef.current.decompose(
          reticleRef.current.position,
          reticleRef.current.quaternion,
          reticleRef.current.scale
        );
        reticleRef.current.visible = true;

        if (onHitUpdate) {
          onHitUpdate({
            position: [
              reticleRef.current.position.x,
              reticleRef.current.position.y,
              reticleRef.current.position.z,
            ],
            quaternion: [
              reticleRef.current.quaternion.x,
              reticleRef.current.quaternion.y,
              reticleRef.current.quaternion.z,
              reticleRef.current.quaternion.w,
            ],
            matrix: matrixRef.current,
          });
        }
      }
    } else if (reticleRef.current) {
      reticleRef.current.visible = false;
    }
  }, "viewer");

  useFrame((state, delta) => {
    if (reticleRef.current && reticleRef.current.visible) {
      const ringMesh = reticleRef.current.children[0];
      if (ringMesh) {
        ringMesh.rotation.z += delta * 1.5;
      }
    }
  });

  return (
    <group ref={reticleRef} visible={false}>
      {/* Outer Placement Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.2, 0.24, 36]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Target Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[0.08, 0.12, 36]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center Target Dot */}
      <mesh position={[0, 0.012, 0]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
