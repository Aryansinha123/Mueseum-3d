# 🛠️ Technology Stack & AR Technical Documentation

This document provides a comprehensive overview of the framework, technology stack, libraries, and WebAR/WebXR specific implementations used in the **Virtual Museum AR/VR Project**.

---

## 🏗️ 1. Core Framework & UI Stack

| Technology / Library | Version | Purpose & Description |
| :--- | :--- | :--- |
| **Next.js (App Router)** | `16.3.1` | Full-stack React framework providing server-side rendering, client component routing, optimized asset management (`/public/models/`), and production build optimization. |
| **React** | `19.2.8` | Core UI library managing declarative component structures, state hooks (`useState`, `useRef`, `useCallback`), and interactive HUD overlays. |
| **React DOM** | `19.2.8` | DOM-rendering package for React web integration. |
| **Tailwind CSS** | `^4.0` | Utility-first CSS framework for responsive layout design, glassmorphic UI panels, dark mode styling, and mobile HUD controls. |
| **Lucide React** | `^1.33.0` | SVG iconography set used across the UI (AR toggle buttons, navigation icons, info modals, audio toggle). |

---

## 🎨 2. 3D Graphics & WebGL Rendering

| Library | Version | Purpose & Description |
| :--- | :--- | :--- |
| **Three.js (`three`)** | `^0.185.1` | Low-level WebGL 3D rendering engine handling 3D scene graphs, lighting, shadow mapping, PBR materials, matrix transformations, vector math, and GLTF asset parsing. |
| **React Three Fiber (`@react-three/fiber`)** | `^9.7.0` | React reconciler for Three.js. Allows construction of complex 3D scenes using modular React components (`<Canvas>`, `<mesh>`, `<ambientLight>`, `useFrame`, `useThree`). |
| **React Three Drei (`@react-three/drei`)** | `^10.7.8` | Production helpers and shader abstractions for R3F, including: <br>• `useGLTF`: Asynchronous loading and caching of 3D models (`.glb`/`.gltf`).<br>• `OrbitControls`: Interactive touch/mouse 3D camera controls.<br>• `Html`: 3D spatial annotations overlaid onto artifact pedestals.<br>• `Environment`: Image-based lighting (IBL) and ambient environment reflections. |

---

## 🥽 3. AR-Specific Technology (WebAR & WebXR Stack)

The project leverages **WebXR**—an open W3C standard—allowing high-performance Augmented Reality directly inside modern mobile browsers (WebAR) without requiring any native app installation.

### Key AR Libraries & APIs

#### A. `@react-three/xr` (`^6.6.30`)
Acts as the primary React integration layer between WebXR hardware APIs and the React Three Fiber 3D scene.
* **XR Store (`createXRStore`)**: Central state container initializing WebXR session configuration.
  ```javascript
  export const xrStore = createXRStore({
    hitTest: true,       // Enables real-world surface raycasting
    domOverlay: true,    // Renders HTML UI over passthrough camera
    depthSensing: false, // Disabled to save mobile GPU memory & battery
  });
  ```
* **Event Listener (`useXREvent("select")`)**: Listens directly to WebXR tap inputs for placing 3D artifacts onto detected surfaces.
* **Surface Reticle (`ARPlacementIndicator`)**: Dynamically updates reticle position based on WebXR hit-test raycasts against real-world floors or tables.

#### B. WebXR Device API (W3C Standard Browser API)
* **Passthrough Camera Feed**: Blends the physical device camera stream with real-time WebGL 3D graphics.
* **Spatial Tracking & 6DoF**: Tracks device position and orientation in real-world physical 3D space.
* **Real-time Surface Detection (Hit Testing)**: Projects continuous raycasts into physical space to locate planar surfaces (floors, desks, tables).

#### C. AR UI & Interaction Layer
* **DOM Overlay (`domOverlay: true`)**: Keeps HTML/CSS controls (scale sliders, rotation controls, exit buttons) visible and interactive over the AR camera feed.
* **Tap-to-Place Logic**: Translates WebXR surface hit coordinates into 3D world space coordinates for model placement.
* **Real-world Scaling & Rotation**: Enables users to dynamically scale (`0.1x` to `3.0x`) and rotate artifacts in real-world space.

---

## 📂 File Architecture Summary

```
virtual-museum/
├── src/
│   ├── components/
│   │   ├── ar/
│   │   │   ├── ARScene.jsx              # Main AR WebGL scene & placement handler
│   │   │   ├── ARArtifact.jsx           # Placed 3D artifact rendering in AR
│   │   │   └── ARPlacementIndicator.jsx  # Surface detection reticle indicator
│   │   ├── museum/
│   │   │   ├── Museum.jsx               # 3D Virtual Museum walkthrough scene
│   │   │   └── ArtifactModel.jsx        # 3D artifact loader & pedestal display
│   │   └── ui/                          # HUD & AR control overlays
│   └── utils/
│       └── xrStore.js                   # WebXR session configuration & store
└── public/
    └── models/                          # 3D GLTF/GLB museum exhibit assets
```
