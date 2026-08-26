"use client";

import { createXRStore } from "@react-three/xr";

export const xrStore =
  typeof window !== "undefined"
    ? createXRStore({
        depthSensing: false,
        hitTest: true,
      })
    : null;
