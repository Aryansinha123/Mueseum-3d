"use client";

import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

export function AutoFitModel({ object, targetSize = 0.65, userScale = 1, artifactId }) {
  const groupRef = useRef();

  useLayoutEffect(() => {
    if (!object || !groupRef.current) return;

    // Clone scene to prevent global state side effects
    const cloned = object.clone(true);

    // Compute 3D Bounding Box of the model
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    console.log(
      `[BOUNDING BOX] ${artifactId || "Model"} size: (${size.x.toFixed(3)}, ${size.y.toFixed(3)}, ${size.z.toFixed(3)}) maxDim: ${maxDim.toFixed(3)}`
    );

    if (maxDim === 0 || !Number.isFinite(maxDim)) {
      console.warn(`[AutoFitModel] Invalid maxDim for ${artifactId || "Model"}: ${maxDim}`);
      return;
    }

    // Calculate normalization scale factor
    const scaleFactor = (targetSize / maxDim) * userScale;
    if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) return;

    // Calculate center offsets so bottom of mesh aligns at y = 0
    const centerX = -(box.min.x + size.x / 2) * scaleFactor;
    const centerY = -box.min.y * scaleFactor; // Bottom alignment at y = 0
    const centerZ = -(box.min.z + size.z / 2) * scaleFactor;

    console.log(
      `[FINAL TRANSFORM] ${artifactId || "Model"} pos: (${centerX.toFixed(3)}, ${centerY.toFixed(3)}, ${centerZ.toFixed(3)}) scaleScalar: ${scaleFactor.toFixed(4)}`
    );

    if (!Number.isFinite(centerX) || !Number.isFinite(centerY) || !Number.isFinite(centerZ)) return;

    // Apply transformation matrix to group
    cloned.position.set(centerX, centerY, centerZ);
    cloned.scale.setScalar(scaleFactor);

    // Enable shadow casting & receiving on all child meshes and disable frustum culling for safety
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
      }
    });

    // Clear previous children and attach normalized model
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }
    groupRef.current.add(cloned);
  }, [object, targetSize, userScale, artifactId]);

  return <group ref={groupRef} />;
}
