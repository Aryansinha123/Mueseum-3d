"use client";

import React, { useRef, useEffect } from "react";
import { ARPlacementIndicator } from "./ARPlacementIndicator";
import { ARArtifact } from "./ARArtifact";
import * as THREE from "three";

export function ARScene({
  selectedArtifact,
  onSelectArtifact,
  isPlaced,
  setIsPlaced,
  placedPosition,
  setPlacedPosition,
  lastHitPosition,
  setLastHitPosition,
  arScale,
  rotationY,
}) {
  const lastHitRef = useRef(lastHitPosition);

  // Keep ref synchronized with state
  useEffect(() => {
    lastHitRef.current = lastHitPosition;
  }, [lastHitPosition]);

  const handleHitUpdate = (hitData) => {
    if (!isPlaced && hitData && hitData.position) {
      lastHitRef.current = hitData.position;
      setLastHitPosition(hitData.position);
    }
  };

  const attemptPlacement = () => {
    if (!isPlaced && lastHitRef.current) {
      setPlacedPosition([...lastHitRef.current]);
      setIsPlaced(true);
    }
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    attemptPlacement();
  };

  // Listen to native WebXR session 'select' event for 100% reliable screen tap-to-place on mobile
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.xr) return;

    let activeSession = null;

    const handleSessionSelect = () => {
      attemptPlacement();
    };

    // Try attaching to active WebXR session if available
    navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
      if (!supported) return;
      // WebXR session listener hookup
      const checkSession = setInterval(() => {
        if (window.__activeXRSession) {
          activeSession = window.__activeXRSession;
          activeSession.addEventListener("select", handleSessionSelect);
          clearInterval(checkSession);
        }
      }, 500);

      setTimeout(() => clearInterval(checkSession), 5000);
    });

    return () => {
      if (activeSession) {
        activeSession.removeEventListener("select", handleSessionSelect);
      }
    };
  }, [isPlaced]);

  return (
    <group>
      {/* AR Scene Directional & Ambient Lighting */}
      <directionalLight position={[5, 10, 5]} intensity={1.8} />
      <ambientLight intensity={1.0} />

      {/* Transparent Tap Receiver Plane (visible=true + opacity=0 ensures R3F raycasting catches touch taps) */}
      {!isPlaced && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          onPointerDown={handlePointerDown}
          onClick={handlePointerDown}
          visible={true}
        >
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial
            transparent={true}
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Surface Hit Test Reticle */}
      {!isPlaced && (
        <ARPlacementIndicator
          active={!isPlaced}
          onHitUpdate={handleHitUpdate}
        />
      )}

      {/* Placed AR Artifact Model */}
      {isPlaced && selectedArtifact && placedPosition && (
        <ARArtifact
          artifact={selectedArtifact}
          position={placedPosition}
          rotationY={rotationY}
          arScale={arScale}
          isSelected={true}
          onSelect={onSelectArtifact}
        />
      )}
    </group>
  );
}
