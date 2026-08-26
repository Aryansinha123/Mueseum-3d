"use client";

import { useState, useEffect } from "react";

export function useWebXRSupport() {
  const [isSupported, setIsSupported] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function checkSupport() {
      if (typeof window === "undefined") {
        setIsChecking(false);
        return;
      }

      if (!("xr" in navigator)) {
        setIsSupported(false);
        setErrorMessage("WebXR is not supported by your browser/device.");
        setIsChecking(false);
        return;
      }

      try {
        const supported = await navigator.xr.isSessionSupported("immersive-ar");
        setIsSupported(supported);
        if (!supported) {
          setErrorMessage("Mobile AR (immersive-ar) is not supported on this device.");
        }
      } catch (err) {
        setIsSupported(false);
        setErrorMessage("Failed to check WebXR AR support: " + err.message);
      } finally {
        setIsChecking(false);
      }
    }

    checkSupport();
  }, []);

  return { isSupported, isChecking, errorMessage };
}
