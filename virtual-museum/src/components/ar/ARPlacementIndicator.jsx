"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useXRHitTest } from "@react-three/xr";
import * as THREE from "three";

export function ARPlacementIndicator({ active, onHitUpdate }) {
  const reticleRef = useRef();
  const matrixRef = useRef(new THREE.Matrix4());

  useXRHitTest((results, getWorldMatrix) => {
    if (!active || results.length === 0) return;

    if (getWorldMatrix(matrixRef.current, results[0])) {
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
    }
  }, "viewer");

  useFrame((state, delta) => {
    if (reticleRef.current && reticleRef.current.visible) {
      const ringMesh = reticleRef.current.children[0];
      if (ringMesh) {
        ringMesh.rotation.z += delta * 1.2;
      }
    }
  });

  return (
    <group ref={reticleRef} visible={false}>
      {/* Outer Placement Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.18, 0.22, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner Target Center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <circleGeometry args={[0.06, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Center Beacon Point */}
      <mesh position={[0, 0.015, 0]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
