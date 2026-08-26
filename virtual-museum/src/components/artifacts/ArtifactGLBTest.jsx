"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function TestModel() {
  const modelPath = "/models/artifacts/ART001/model.glb";
  console.log("[GLB LOAD START] ART001 from isolated test");
  const gltf = useGLTF(modelPath);
  console.log("[GLB LOAD SUCCESS] ART001", gltf);
  console.log("[GLB SCENE] ART001 scene object", gltf.scene);

  // Compute Bounding Box & Stats
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  let meshCount = 0;
  let childCount = 0;
  gltf.scene.traverse((child) => {
    childCount++;
    if (child.isMesh) {
      meshCount++;
      child.frustumCulled = false;
    }
  });

  console.log(`ART001 children count: ${childCount}`);
  console.log(`ART001 mesh count: ${meshCount}`);
  console.log(`ART001 bounding box min: (${box.min.x.toFixed(3)}, ${box.min.y.toFixed(3)}, ${box.min.z.toFixed(3)}) max: (${box.max.x.toFixed(3)}, ${box.max.y.toFixed(3)}, ${box.max.z.toFixed(3)})`);
  console.log(`ART001 size: (${size.x.toFixed(3)}, ${size.y.toFixed(3)}, ${size.z.toFixed(3)})`);
  console.log(`ART001 center: (${center.x.toFixed(3)}, ${center.y.toFixed(3)}, ${center.z.toFixed(3)})`);

  return <primitive object={gltf.scene} position={[0, 0, 0]} scale={[1, 1, 1]} />;
}

export function ArtifactGLBTest() {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "#111" }}>
      <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={2} />
        <Suspense fallback={null}>
          <TestModel />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
