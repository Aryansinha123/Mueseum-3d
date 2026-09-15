"use client";

import { createXRStore } from "@react-three/xr";

// Create the XR store with AR-relevant features.
// hitTest: enables surface detection for tap-to-place.
// domOverlay: enables HTML DOM overlay on top of WebXR pass-through camera.
// depthSensing: disabled to reduce GPU overhead on mobile.
export const xrStore = createXRStore({
  depthSensing: false,
  hitTest: true,
  domOverlay: true,
});

