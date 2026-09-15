"use client";

import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

// Cache for normalized model clones to prevent repeating expensive Box3 calculations & deep clones
const normalizedCache = new Map();

export function AutoFitModel({ object, targetSize = 0.65, userScale = 1, artifactId }) {
  const groupRef = useRef();

  useLayoutEffect(() => {
    if (!object || !groupRef.current) return;

    const cacheKey = `${artifactId || "model"}_${targetSize}_${userScale}`;
    let cloned;

    if (normalizedCache.has(cacheKey)) {
      cloned = normalizedCache.get(cacheKey).clone(true);
    } else {
      cloned = object.clone(true);

      // Compute 3D Bounding Box of the model
      const box = new THREE.Box3().setFromObject(cloned);
      const size = new THREE.Vector3();
      box.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z);

      if (maxDim > 0 && Number.isFinite(maxDim)) {
        const scaleFactor = (targetSize / maxDim) * userScale;
        if (Number.isFinite(scaleFactor) && scaleFactor > 0) {
          const centerX = -(box.min.x + size.x / 2) * scaleFactor;
          const centerY = -box.min.y * scaleFactor; // Bottom alignment at y = 0
          const centerZ = -(box.min.z + size.z / 2) * scaleFactor;

          if (Number.isFinite(centerX) && Number.isFinite(centerY) && Number.isFinite(centerZ)) {
            cloned.position.set(centerX, centerY, centerZ);
            cloned.scale.setScalar(scaleFactor);
          }
        }
      }

      // Re-enable frustum culling so GPU automatically skips meshes outside the camera view
      cloned.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = true;
        }
      });

      normalizedCache.set(cacheKey, cloned.clone(true));
    }

    // Clear previous children and attach normalized model
    while (groupRef.current && groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    if (groupRef.current) {
      groupRef.current.add(cloned);
    }
  }, [object, targetSize, userScale, artifactId]);

  return <group ref={groupRef} />;
}
