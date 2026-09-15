"use client";

import { useState, useEffect } from "react";
import { xrStore } from "@/utils/xrStore";

export function useWebXRSupport() {
  const [isSupported, setIsSupported] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [diagnostics, setDiagnostics] = useState({});

  useEffect(() => {
    async function checkSupport() {
      if (typeof window === "undefined") {
        setIsChecking(false);
        return;
      }

      const isSecure = window.isSecureContext;
      const hasXr = "xr" in navigator;
      const ua = navigator.userAgent;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
      const isIOS = /iPhone|iPad|iPod/i.test(ua);

      const diag = {
        isSecureContext: isSecure,
        hasNavigatorXR: hasXr,
        hasXrStore: !!xrStore,
        userAgent: ua,
        isMobile,
        isIOS,
        immersiveArSupported: false,
      };

      if (!isSecure) {
        setIsSupported(false);
        setErrorMessage(
          "WebXR requires HTTPS or localhost (Secure Context). If testing on a mobile phone over LAN, access via HTTPS or a tunnel like ngrok."
        );
        setDiagnostics(diag);
        setIsChecking(false);
        return;
      }

      if (!hasXr) {
        setIsSupported(false);
        setErrorMessage(
          isIOS
            ? "iOS Safari does not support WebXR natively by default. Please use Chrome on Android or a WebXR-compatible viewer app on iOS."
            : "WebXR API (navigator.xr) is not supported by this browser. Please use Chrome on Android."
        );
        setDiagnostics(diag);
        setIsChecking(false);
        return;
      }

      try {
        const supported = await navigator.xr.isSessionSupported("immersive-ar");
        diag.immersiveArSupported = supported;
        setIsSupported(supported);

        if (!supported) {
          setErrorMessage(
            "Mobile WebXR AR (immersive-ar) is not supported on this device/browser combination."
          );
        }

        if (process.env.NODE_ENV !== "production") {
          console.groupCollapsed("%c[WebXR AR Diagnostics Checklist]", "color: #f59e0b; font-weight: bold;");
          console.log("1. navigator.xr available:", hasXr);
          console.log("2. isSecureContext (HTTPS/localhost):", isSecure);
          console.log("3. immersive-ar mode supported:", supported);
          console.log("4. xrStore instance ready:", !!xrStore);
          console.log("5. Device type:", isMobile ? (isIOS ? "iOS Mobile" : "Android Mobile") : "Desktop");
          console.log("6. User Agent:", ua);
          console.groupEnd();
        }
      } catch (err) {
        setIsSupported(false);
        setErrorMessage("Failed to check WebXR AR support: " + (err.message || String(err)));
      } finally {
        setDiagnostics(diag);
        setIsChecking(false);
      }
    }

    checkSupport();
  }, []);

  return { isSupported, isChecking, errorMessage, diagnostics };
}

