"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

export function MuseumControls({
  controlMode, // 'first-person' or 'inspect'
  selectedArtifact,
  onCameraMove,
  isPointerLocked,
  setIsPointerLocked,
}) {
  const { camera } = useThree();
  const orbitRef = useRef();
  const pointerLockRef = useRef();

  // Keys press tracking
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Touch virtual direction tracking for mobile
  const touchDirection = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (controlMode !== "first-person") return;
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [controlMode]);

  // Frame update loop for First-Person movement & camera collision bounds
  useFrame((state, delta) => {
    if (controlMode === "first-person") {
      const speed = 6.0 * delta;
      const moveVector = new THREE.Vector3();

      // Forward/backward vector relative to camera look direction
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0; // Lock to horizontal ground walking plane
      forward.normalize();

      const side = new THREE.Vector3(-forward.z, 0, forward.x).normalize();

      if (keys.current.forward) moveVector.addScaledVector(forward, speed);
      if (keys.current.backward) moveVector.addScaledVector(forward, -speed);
      if (keys.current.left) moveVector.addScaledVector(side, -speed);
      if (keys.current.right) moveVector.addScaledVector(side, speed);

      // Apply touch joystick input if present
      if (touchDirection.current.y !== 0) {
        moveVector.addScaledVector(forward, -touchDirection.current.y * speed);
      }
      if (touchDirection.current.x !== 0) {
        moveVector.addScaledVector(side, touchDirection.current.x * speed);
      }

      // Propose new position
      const newX = THREE.MathUtils.clamp(camera.position.x + moveVector.x, -20.5, 20.5);
      const newZ = THREE.MathUtils.clamp(camera.position.z + moveVector.z, -20.5, 20.5);

      camera.position.x = newX;
      camera.position.z = newZ;
      camera.position.y = 1.65; // Fixed eye level height

      // Notify parent for minimap dot updates
      if (onCameraMove) {
        onCameraMove([camera.position.x, camera.position.y, camera.position.z]);
      }
    }
  });

  if (controlMode === "inspect" && selectedArtifact) {
    const [ax, ay, az] = selectedArtifact.position;
    const targetY = (selectedArtifact.pedestalHeight || 1.2) + 0.4;

    return (
      <OrbitControls
        ref={orbitRef}
        target={[ax, targetY, az]}
        enablePan={true}
        enableZoom={true}
        minDistance={1.2}
        maxDistance={5.0}
        maxPolarAngle={Math.PI / 2 + 0.05} // Prevent camera going below floor
        autoRotate={true}
        autoRotateSpeed={0.8}
      />
    );
  }

  return (
    <>
      {isPointerLocked ? (
        <PointerLockControls
          ref={pointerLockRef}
          onUnlock={() => setIsPointerLocked && setIsPointerLocked(false)}
        />
      ) : (
        <OrbitControls
          ref={orbitRef}
          enablePan={true}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 - 0.02}
          minDistance={1}
          maxDistance={35}
        />
      )}
    </>
  );
}
