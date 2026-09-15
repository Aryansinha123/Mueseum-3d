"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { artifactsData, catalogArtifacts, galleriesData } from "@/data/artifacts";
import { MuseumHUD } from "@/components/ui/MuseumHUD";
import { ArtifactInfo } from "@/components/ui/ArtifactInfo";
import { MuseumMap } from "@/components/ui/MuseumMap";
import { ControlsOverlay } from "@/components/ui/ControlsOverlay";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AROverlayUI } from "@/components/ar/AROverlayUI";
import { ARArtifactPickerModal } from "@/components/ar/ARArtifactPickerModal";
import { useWebXRSupport } from "@/hooks/useWebXRSupport";
import { xrStore } from "@/utils/xrStore";
import { validateArtifactAssets } from "@/utils/artifactValidator";
import { X, AlertCircle, RotateCcw } from "lucide-react";

// Dynamically import 3D Canvas component to prevent Next.js SSR evaluation
const MuseumCanvas = dynamic(
  () => import("@/components/museum/Museum").then((mod) => mod.Museum),
  { ssr: false }
);

export default function Home() {
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [controlMode, setControlMode] = useState("first-person"); // 'first-person' or 'inspect'
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([0, 1.65, 23]);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // AR Mode & Picker States
  const [isArPickerOpen, setIsArPickerOpen] = useState(false);
  const [isArMode, setIsArMode] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);
  const [placedPosition, setPlacedPosition] = useState(null);
  const [lastHitPosition, setLastHitPosition] = useState(null);
  const [arScale, setArScale] = useState(1.0);
  const [rotationY, setRotationY] = useState(0);
  const [isInfoInArOpen, setIsInfoInArOpen] = useState(false);
  const [arErrorAlert, setArErrorAlert] = useState(null);

  const { isSupported: isArSupported, errorMessage: arSupportError } = useWebXRSupport();

  // Audit 3D GLB assets in dev console on initial load
  useEffect(() => {
    validateArtifactAssets(catalogArtifacts);
  }, []);

  // Compute current gallery location based on camera coordinates
  const currentGalleryName = useMemo(() => {
    const [x, y, z] = cameraPosition;
    if (z > 18) return "Main Entrance Doorway";
    if (z > 3 && Math.abs(x) < 7) return "Central Rotunda Lobby";
    if (x < -7) return "Gallery 1: Classical Antiquities";
    if (x > 7) return "Gallery 2: Smithsonian Technology & Science Hall";
    if (z < -8) return "Gallery 3: Smithsonian Paleontology Hall";
    return "Central Rotunda Lobby";
  }, [cameraPosition]);

  const handleSelectArtifact = (artifact) => {
    setSelectedArtifact(artifact);
  };

  const handleCloseArtifactInfo = () => {
    setSelectedArtifact(null);
    setControlMode("first-person");
  };

  const handleExploreArtifact = () => {
    setControlMode("inspect");
  };

  const handleTeleport = (targetPos) => {
    setCameraPosition(targetPos);
    setIsMapOpen(false);
  };

  const handleResetCamera = () => {
    setCameraPosition([0, 1.65, 23]);
    setSelectedArtifact(null);
    setControlMode("first-person");
  };

  // Step 1: Open AR Artifact Picker Modal
  const handleOpenArPicker = () => {
    setIsArPickerOpen(true);
  };

  // Step 2: Confirm artifact choice & initiate WebXR session
  const handleConfirmEnterAr = (chosenArtifact) => {
    const target = chosenArtifact || selectedArtifact || catalogArtifacts[0];
    setSelectedArtifact(target);
    setIsArPickerOpen(false);

    if (!isArSupported) {
      setArErrorAlert(
        arSupportError || "WebXR AR is not supported on this device or browser. Please try on a WebXR-compatible mobile browser (e.g. Chrome on Android)."
      );
      return;
    }

    setIsArMode(true);
    setIsPlaced(false);
    setPlacedPosition(null);
    setArScale(1.0);
    setRotationY(0);

    if (xrStore && typeof xrStore.enterAR === "function") {
      xrStore
        .enterAR()
        .then((session) => {
          if (session && typeof window !== "undefined") {
            window.__activeXRSession = session;
          }
        })
        .catch((err) => {
          console.warn("[WebXR] Failed to launch AR session:", err);
          setIsArMode(false);
          setArErrorAlert(
            "Unable to start AR session: " +
              (err.message || "Session initialization failed.")
          );
        });
    }
  };

  const handleExitAr = () => {
    setIsArMode(false);
    setIsPlaced(false);
    setPlacedPosition(null);
    setIsInfoInArOpen(false);
  };

  const handleClearPlacement = () => {
    setIsPlaced(false);
    setPlacedPosition(null);
  };

  return (
    <main className="w-screen h-screen relative overflow-hidden bg-slate-950 select-none">
      {/* 3D Preloader Screen */}
      <LoadingScreen />

      {/* Main 3D Canvas Viewport */}
      <MuseumCanvas
        selectedArtifact={selectedArtifact}
        onSelectArtifact={handleSelectArtifact}
        controlMode={controlMode}
        onCameraMove={setCameraPosition}
        isPointerLocked={isPointerLocked}
        setIsPointerLocked={setIsPointerLocked}
        isArMode={isArMode}
        isPlaced={isPlaced}
        setIsPlaced={setIsPlaced}
        placedPosition={placedPosition}
        setPlacedPosition={setPlacedPosition}
        lastHitPosition={lastHitPosition}
        setLastHitPosition={setLastHitPosition}
        arScale={arScale}
        rotationY={rotationY}
      />

      {/* Conditionally Render AR Overlay vs Desktop HUD */}
      {isArMode ? (
        <AROverlayUI
          selectedArtifact={selectedArtifact}
          isPlaced={isPlaced}
          arScale={arScale}
          setArScale={setArScale}
          rotationY={rotationY}
          setRotationY={setRotationY}
          placedPosition={placedPosition}
          setPlacedPosition={setPlacedPosition}
          onClearPlacement={handleClearPlacement}
          onExitAr={handleExitAr}
          onOpenInfo={() => setIsInfoInArOpen(true)}
          onOpenPicker={() => setIsArPickerOpen(true)}
        />
      ) : (
        <>
          {/* Top HUD Header & Floating Controls */}
          <MuseumHUD
            controlMode={controlMode}
            setControlMode={setControlMode}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenControls={() => setIsControlsOpen(true)}
            onResetCamera={handleResetCamera}
            onEnterAr={handleOpenArPicker}
            selectedArtifact={selectedArtifact}
            currentGalleryName={currentGalleryName}
            isArSupported={isArSupported}
          />

          {/* Artifact Inspect Detail Modal */}
          {selectedArtifact && (
            <ArtifactInfo
              artifact={selectedArtifact}
              onClose={handleCloseArtifactInfo}
              onExplore={handleExploreArtifact}
              onEnterAr={() => handleConfirmEnterAr(selectedArtifact)}
            />
          )}

          {/* 2D Interactive Museum Floorplan Map */}
          <MuseumMap
            isOpen={isMapOpen}
            onClose={() => setIsMapOpen(false)}
            artifacts={artifactsData}
            galleries={galleriesData}
            cameraPosition={cameraPosition}
            onTeleport={handleTeleport}
          />

          {/* Keyboard & Touch Navigation Guide */}
          <ControlsOverlay
            isOpen={isControlsOpen}
            onClose={() => setIsControlsOpen(false)}
          />
        </>
      )}

      {/* AR Artifact Selection Picker Modal */}
      <ARArtifactPickerModal
        isOpen={isArPickerOpen}
        onClose={() => setIsArPickerOpen(false)}
        selectedArtifact={selectedArtifact}
        onSelectArtifact={setSelectedArtifact}
        onConfirmEnterAr={handleConfirmEnterAr}
        isArSupported={isArSupported}
        arErrorMessage={arSupportError}
      />

      {/* AR Info & AI Curator Bottom Sheet Drawer */}
      {isArMode && isInfoInArOpen && selectedArtifact && (
        <ArtifactInfo
          artifact={selectedArtifact}
          onClose={() => setIsInfoInArOpen(false)}
          onExplore={() => setIsInfoInArOpen(false)}
        />
      )}

      {/* AR Unsupported / Error Dialog Overlay */}
      {arErrorAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl text-slate-100 text-center flex flex-col items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-200 mb-1">
                AR Not Available
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {arErrorAlert}
              </p>
            </div>
            <button
              onClick={() => setArErrorAlert(null)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Back to Museum</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
