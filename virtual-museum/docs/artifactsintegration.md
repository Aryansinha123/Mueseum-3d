# Master Artifact Integration Guide (`artifactsintegration.md`)

This guide provides a comprehensive, step-by-step walkthrough for adding and integrating new 3D artifacts into the **3D Virtual Museum** web application.

---

## 🏗️ 1. Architecture Overview

The museum artifact system follows a modular, decoupled pipeline:

```text
  ┌──────────────────────────────────────────────────────────┐
  │                 src/data/artifacts.js                    │
  │   Centralized metadata, 3D positions, & GLB file paths   │
  └────────────────────────────┬─────────────────────────────┘
                               │
                               ▼
  ┌──────────────────────────────────────────────────────────┐
  │               ArtifactManager.jsx Component              │
  │     Iterates over artifacts data & renders pedestals     │
  └──────────────┬────────────────────────────┬──────────────┘
                 │                            │
                 ▼                            ▼
  ┌─────────────────────────────┐  ┌─────────────────────────┐
  │        Pedestal.jsx         │  │      Artifact.jsx       │
  │ Spotlight, base & brass plate│  │ Dynamic GLB Loader      │
  └─────────────────────────────┘  └──────────┬──────────────┘
                                              │
                                              ▼
                                   ┌────────────────────┐
                                   │  AutoFitModel.jsx  │
                                   │ Auto Bounding Box  │
                                   │ Normalizer & Scale │
                                   └────────────────────┘
```

---

## 📋 2. Step-by-Step Integration Process

### Step 1: Obtain & Prepare the 3D Asset

1. Download or export your 3D model in `.glb` or `.gltf` format (GLB binary format is strongly recommended).
2. Ensure the asset respects usage rights and open access licensing (e.g. Smithsonian Open Access `CC0`, Creative Commons `CC BY 4.0`, or Public Domain).
3. Create a dedicated artifact subfolder in `public/models/artifacts/`:
   ```bash
   public/models/artifacts/<ARTIFACT_ID>/
   ```
   *Example*: `public/models/artifacts/ART006/`
4. Place the `.glb` file inside the directory and name it `model.glb`:
   ```text
   public/models/artifacts/ART006/model.glb
   ```
5. *(Optional)* Add a preview thumbnail image named `preview.jpg`.

---

### Step 2: Define Metadata in `src/data/artifacts.js`

Open [`src/data/artifacts.js`](file:///c:/Users/hp/CODEBASE/Projects/Museuem%20ARVR/virtual-museum/src/data/artifacts.js) and append a new artifact object to the `artifactsData` array using the following schema template:

```javascript
{
  id: "ART006", // Unique artifact identifier
  name: "Rosetta Inscription Stone", // Human-readable exhibit title
  category: "Historical Epigraphy", // Category classification
  institution: "British Museum", // Preserving institution
  source: "Digital Heritage Collection", // Source organization
  sourceUrl: "https://example.org/models/art006", // Official web page link
  modelPath: "/models/artifacts/ART006/model.glb", // Path relative to /public
  license: "CC BY 4.0", // Usage license
  position: [-14, 0, -10], // 3D coordinates [X, Y, Z] inside museum
  rotation: [0, Math.PI / 4, 0], // Rotation angles [RX, RY, RZ] in radians
  scale: 1.0, // Scale multiplier (default 1.0)
  period: "c. 196 BCE", // Era / Date
  origin: "Rashid (Rosetta), Egypt", // Geographic origin
  description: "A granodiorite stele inscribed with three versions of a decree issued in Memphis...", // Curator text
  galleryId: "gallery-1", // Associated gallery room ID
  galleryName: "Gallery 1: Classical & Epigraphic Antiquities", // Room title badge
  pedestalHeight: 1.2, // Pedestal height offset (default 1.2)
  aiContext: {
    artifact_id: "ART006", // RAG identifier payload
    historicalSignificance: "Key decipherment key for Ancient Egyptian hieroglyphs.",
    material: "Granodiorite Stone",
    dimensions: "112cm x 75cm x 28cm"
  }
}
```

---

### Step 3: Configure 3D Gallery Coordinates

Position the exhibit in 3D space using the `position: [X, Y, Z]` array:

* **X Axis** (Left / Right):
  * Left Wing (Gallery 1): `X` between `-10` and `-18`
  * Central Axis (Lobby / Gallery 3): `X = 0`
  * Right Wing (Gallery 2): `X` between `+10` and `+18`
* **Y Axis** (Height): Keep `Y = 0` (The pedestal height setting automatically handles vertical elevation off the floor).
* **Z Axis** (Depth):
  * Entrance Atrium: `Z = +17` to `+20`
  * Central Rotunda Lobby: `Z = +3` to `+10`
  * Gallery 1 & Gallery 2 Wings: `Z = -6` to `+6`
  * Final Gallery 3 (Ancient Wonders): `Z = -10` to `-18`

---

### Step 4: Automatic Bounding Box Scaling (`AutoFitModel.jsx`)

Different 3D scanners and CAD software export models at wildly different native scales (millimeters to hundreds of meters).

You do **NOT** need to manually compute raw matrix scales!

The [`AutoFitModel.jsx`](file:///c:/Users/hp/CODEBASE/Projects/Museuem%20ARVR/virtual-museum/src/components/artifacts/AutoFitModel.jsx) component automatically:
1. Measures the 3D bounding box of the GLB model using Three.js `Box3`.
2. Normalizes the largest dimension to a standard exhibit size (`0.65` meters).
3. Offsets the Y-axis so the bottom coordinates of the mesh rest cleanly on top of the display pedestal (`y = 0`) without sinking or floating.
4. Centers the X and Z axes over the pedestal plaque.

If a specific model needs to be slightly larger or smaller, simply adjust the `scale` property in `artifacts.js` (e.g. `scale: 1.2` or `scale: 0.8`).

---

### Step 5: Create Artifact Documentation (`docs/artifacts/<ARTIFACT_ID>.md`)

For complete documentation compliance, create a markdown documentation file for the new exhibit at:

`docs/artifacts/<ARTIFACT_ID>.md`

*Example Structure*:
```markdown
# Artifact Documentation: ART006 — Rosetta Inscription Stone

- **Artifact ID**: `ART006`
- **Artifact Name**: Rosetta Inscription Stone
- **Institution**: British Museum
- **Category**: Historical Epigraphy
- **Period**: c. 196 BCE
- **Origin**: Rashid, Egypt
- **Official Source URL**: [https://example.org/models/art006](https://example.org/models/art006)
- **License**: CC BY 4.0
- **Target Model Path**: `public/models/artifacts/ART006/model.glb`

## Description
[Insert official curator description here]
```

---

## 🧪 3. Verification & Testing Checklist

After adding a new artifact, verify:

1. **Development Server**: Run `npm run dev` in `virtual-museum/`.
2. **GLB Model Loading**:
   * If `model.glb` exists: The real 3D model renders centered on top of its pedestal.
   * If `model.glb` is missing: The high-quality 3D procedural placeholder renders safely without crashing, and a dev console notice is logged:
     ```text
     ART006 model not found. Place the GLB at public/models/artifacts/ART006/model.glb
     ```
3. **Plaque Text & Spotlight**: The pedestal front displays the brass plaque engraved with the artifact name and ID, with a focused overhead spotlight.
4. **Interactive Selection**: Clicking/tapping the exhibit opens the detail drawer displaying institution, license, description, and "Ask AI Curator" RAG tab.
5. **2D Museum Map**: Tapping the **Museum Map** button shows the new artifact marker and allows instant teleportation to its display location.
6. **Production Build**: Run `npm run build` to ensure zero compilation or bundling errors.
