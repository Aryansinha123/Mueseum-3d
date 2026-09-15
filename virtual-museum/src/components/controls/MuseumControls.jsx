"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

// Reusable static vectors to avoid per-frame allocations inside useFrame
const _moveVector = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _side = new THREE.Vector3();

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
  const lastReportedPos = useRef([0, 1.65, 23]);
  const lastReportTime = useRef(0);

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
      _moveVector.set(0, 0, 0);

      // Forward/backward vector relative to camera look direction
      camera.getWorldDirection(_forward);
      _forward.y = 0; // Lock to horizontal ground walking plane
      _forward.normalize();

      _side.set(-_forward.z, 0, _forward.x).normalize();

      if (keys.current.forward) _moveVector.addScaledVector(_forward, speed);
      if (keys.current.backward) _moveVector.addScaledVector(_forward, -speed);
      if (keys.current.left) _moveVector.addScaledVector(_side, -speed);
      if (keys.current.right) _moveVector.addScaledVector(_side, speed);

      // Apply touch joystick input if present
      if (touchDirection.current.y !== 0) {
        _moveVector.addScaledVector(_forward, -touchDirection.current.y * speed);
      }
      if (touchDirection.current.x !== 0) {
        _moveVector.addScaledVector(_side, touchDirection.current.x * speed);
      }

      // Propose new position
      const newX = THREE.MathUtils.clamp(camera.position.x + _moveVector.x, -20.5, 20.5);
      const newZ = THREE.MathUtils.clamp(camera.position.z + _moveVector.z, -20.5, 20.5);

      camera.position.x = newX;
      camera.position.z = newZ;
      camera.position.y = 1.65; // Fixed eye level height

      // Throttled parent notification for minimap dot updates (only on >0.25m movement or 150ms interval)
      const now = state.clock.getElapsedTime() * 1000;
      const dx = camera.position.x - lastReportedPos.current[0];
      const dz = camera.position.z - lastReportedPos.current[2];
      const distSq = dx * dx + dz * dz;

      if (onCameraMove && (distSq > 0.0625 || now - lastReportTime.current > 150)) {
        lastReportedPos.current = [camera.position.x, camera.position.y, camera.position.z];
        lastReportTime.current = now;
        onCameraMove(lastReportedPos.current);
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
      ) : controlMode === "inspect" ? (
        <OrbitControls
          ref={orbitRef}
          enablePan={true}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 - 0.02}
          minDistance={1}
          maxDistance={35}
        />
      ) : null}
    </>
  );
}
