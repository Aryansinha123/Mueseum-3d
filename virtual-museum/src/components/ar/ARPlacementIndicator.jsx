"use client";

import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useXRHitTest } from "@react-three/xr";
import * as THREE from "three";

// Pre-allocated reusable Three.js objects to avoid per-frame GC allocations
const tempMatrix = new THREE.Matrix4();
const tempPos = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();
const tempScale = new THREE.Vector3();

export function ARPlacementIndicator({ active, lastHitRef, lastHitQuatRef }) {
  const reticleRef = useRef();
  const surfaceDetectedLogged = useRef(false);

  // Reset logging flags on activation
  useEffect(() => {
    if (active) {
      surfaceDetectedLogged.current = false;
    }
  }, [active]);

  // WebXR Hit Test callback - runs only BEFORE placement when active is true
  useXRHitTest((results, getWorldMatrix) => {
    if (!active || !results || results.length === 0) {
      if (reticleRef.current && reticleRef.current.visible) {
        reticleRef.current.visible = false;
      }
      return;
    }

    const hit = results[0];
    if (hit && getWorldMatrix(tempMatrix, hit)) {
      if (reticleRef.current) {
        tempMatrix.decompose(tempPos, tempQuat, tempScale);

        reticleRef.current.position.copy(tempPos);
        reticleRef.current.quaternion.copy(tempQuat);
        
        if (!reticleRef.current.visible) {
          reticleRef.current.visible = true;
          if (!surfaceDetectedLogged.current) {
            console.log("[AR] Surface detected");
            surfaceDetectedLogged.current = true;
          }
        }

        // Store latest hit position & orientation for instant tap lock
        if (lastHitRef) {
          lastHitRef.current = [tempPos.x, tempPos.y, tempPos.z];
        }
        if (lastHitQuatRef) {
          lastHitQuatRef.current = [tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w];
        }
      }
    } else if (reticleRef.current && reticleRef.current.visible) {
      reticleRef.current.visible = false;
    }
  }, "viewer");

  // Lightweight rotational animation for reticle ring
  useFrame((state, delta) => {
    if (active && reticleRef.current && reticleRef.current.visible) {
      const ringMesh = reticleRef.current.children[0];
      if (ringMesh) {
        ringMesh.rotation.z += delta * 1.5;
      }
    }
  });

  if (!active) return null;

  return (
    <group ref={reticleRef} visible={false}>
      {/* Outer Placement Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.2, 0.24, 32]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Inner Target Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Center Target Dot */}
      <mesh position={[0, 0.01, 0]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#ffffff" depthWrite={false} />
      </mesh>
    </group>
  );
}


