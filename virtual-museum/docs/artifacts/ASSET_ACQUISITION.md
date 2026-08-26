# Virtual Museum — 3D Asset Acquisition Guide

This document details the exact steps to manually acquire, convert, and integrate
real 3D GLB museum assets for each exhibit slot (ART001–ART005).

---

## ⚠️ Important Principles

- **Do NOT download random models** and assign them to artifact slots.
- **Do NOT rename unrelated assets** and present them as a verified exhibit.
- **Only place a GLB in a slot** once you have verified the artifact's identity,
  source institution, license, and that the 3D model genuinely represents the
  listed object.
- If a source provides only an OBJ or FBX, convert it to GLB using Blender (free,
  open-source) before placing it.

---

## Universal Manual Process

Follow these steps for every artifact:

**STEP 1** — Open the recommended official source listed for that artifact.

**STEP 2** — Search for the exact artifact name or search keywords listed below.

**STEP 3** — Confirm the result actually corresponds to the artifact (compare name,
period, origin, institution, and description against the metadata in
`src/data/artifacts.js`).

**STEP 4** — Verify the license on the asset page. Acceptable licenses:
  - `CC0 1.0 Universal` (Public Domain — no restrictions)
  - `CC BY 4.0` (Attribution required, commercial use allowed)
  - `CC BY-NC 4.0` (Attribution + Non-commercial — academic/educational use only)
  - Do **not** use `All Rights Reserved` or unlicensed assets.

**STEP 5** — If a downloadable 3D model exists, click the Download button and
select `GLB` or `GLTF` format where available.

**STEP 6** — If the source provides `OBJ` or `FBX` format instead of GLB:
  1. Open [Blender](https://www.blender.org/) (free).
  2. `File → Import → Wavefront (.obj)` or `FBX (.fbx)`.
  3. Review the model visually for correctness.
  4. `File → Export → glTF 2.0 (.glb/.gltf)`.
  5. Choose **GLB** format (single binary file).
  6. Save the exported file.

**STEP 7** — Rename the final file exactly to: `model.glb`

**STEP 8** — Place the file at the correct destination path shown in the table below.

**STEP 9** — The `npm run dev` server is already running. If you just placed the file,
  the Next.js dev server will hot-reload automatically. No restart is needed in
  most cases. If the model does not appear, restart with `npm run dev`.

**STEP 10** — Open `http://localhost:3000` in your browser.

**STEP 11** — Walk to the exhibit position in the 3D museum and verify the model renders.

**STEP 12** — Check:
  - Model appears on pedestal (not floating, not sunken into floor).
  - Scale is reasonable (not microscopic or giant).
  - Click the exhibit — confirm the metadata drawer opens with correct info.
  - Open the browser Developer Console → confirm the artifact now shows `✓ FOUND` in the
    pipeline validation table instead of `✗ MISSING`.

---

## ART001 — Handaxe from India

| Field | Value |
|---|---|
| Artifact Name | Handaxe from India (Isampur Acheulean Handaxe) |
| Period | c. 1.1 Million Years Old |
| Origin | Isampur, Karnataka, India |
| Recommended Source | **Smithsonian 3D** |
| Official Page | https://humanorigins.si.edu/evidence/3d-collection/artifacts/handaxe-isampur-india |
| Search Keywords | `Isampur handaxe`, `Acheulean handaxe India`, `handaxe Karnataka` |
| 3D Model Available | **LIKELY — Smithsonian 3D actively hosts downloadable GLBs for their Human Origins collection. Verify on the page.** |
| License | CC0 1.0 Universal (Smithsonian Open Access) |
| Attribution Required | No (CC0), but voluntary credit to Smithsonian recommended |
| Expected Filename | `model.glb` |
| Destination Path | `public/models/artifacts/ART001/model.glb` |
| Conversion Required | No — Smithsonian 3D distributes GLB natively |

**Download steps:**
1. Go to https://3d.si.edu
2. Search "Handaxe from India" or "Isampur"
3. On the artifact page, click **Downloads** → select **Low-Res GLB** or **High-Res GLB**
4. Rename to `model.glb` and place at the destination path.

---

## ART002 — Attic Black-Figure Amphora

| Field | Value |
|---|---|
| Artifact Name | Attic Black-Figure Amphora |
| Period | c. 540 BCE |
| Origin | Attica, Greece |
| Recommended Source | **Smithsonian 3D** or **The Metropolitan Museum of Art** |
| Official Page | https://3d.si.edu (search "amphora") or https://www.metmuseum.org/art/collection |
| Search Keywords | `black-figure amphora`, `Attic amphora GLB`, `Greek pottery 3D` |
| 3D Model Available | **UNKNOWN — Must verify.** Met Museum has Open Access images but 3D models are rare. Smithsonian 3D may have related pottery. |
| License | CC0 (Smithsonian / Met Open Access) or CC BY 4.0 |
| Attribution Required | Depends on source license |
| Expected Filename | `model.glb` |
| Destination Path | `public/models/artifacts/ART002/model.glb` |
| Conversion Required | Possibly — if source provides OBJ, convert via Blender |

**Verification steps:**
1. Go to https://3d.si.edu and search "amphora" or "Greek pottery"
2. Also check https://sketchfab.com/search?q=black+figure+amphora&licenses=cc0,by
3. Confirm the item is specifically a **black-figure** Attic amphora before accepting the model.
4. If no direct GLB download is available on an official source, do not use an unverified substitute.

---

## ART003 — Royal Ceremonial Gemmed Crown

| Field | Value |
|---|---|
| Artifact Name | Royal Ceremonial Gemmed Crown |
| Period | 12th Century CE |
| Origin | Holy Roman Empire |
| Recommended Source | **Europeana** or **Sketchfab Cultural Heritage (CC0/CC BY)** |
| Official Page | https://www.europeana.eu/en/search?query=medieval+crown |
| Search Keywords | `medieval crown 3D`, `Holy Roman Empire crown`, `gemmed crown GLB`, `regalia 3D model` |
| 3D Model Available | **UNKNOWN — Must verify.** Medieval regalia 3D models are uncommon on open sources. |
| License | CC0 or CC BY 4.0 required |
| Attribution Required | Depends on source |
| Expected Filename | `model.glb` |
| Destination Path | `public/models/artifacts/ART003/model.glb` |
| Conversion Required | Possibly — OBJ or FBX sources require Blender conversion |

**Verification steps:**
1. Search Europeana: https://www.europeana.eu/en/search?query=crown&qf=TYPE%3A%223D%22
2. Search Sketchfab: https://sketchfab.com/search?q=medieval+crown&licenses=cc0,by&type=models
3. Only use a model that clearly represents a jewelled medieval crown from European regalia tradition.

---

## ART004 — Cuneiform Decree Tablet

| Field | Value |
|---|---|
| Artifact Name | Cuneiform Decree Tablet |
| Period | c. 1800 BCE |
| Origin | Mesopotamia (Babylon) |
| Recommended Source | **Smithsonian 3D** or **The British Museum 3D** |
| Official Page | https://3d.si.edu (search "cuneiform") or https://sketchfab.com/britishmuseum |
| Search Keywords | `cuneiform tablet 3D`, `Babylonian clay tablet GLB`, `Mesopotamia inscription model` |
| 3D Model Available | **LIKELY — British Museum has published 3D scans of cuneiform tablets on Sketchfab.** |
| License | CC BY 4.0 (British Museum Sketchfab) or CC0 (Smithsonian) |
| Attribution Required | Yes if CC BY — credit The British Museum |
| Expected Filename | `model.glb` |
| Destination Path | `public/models/artifacts/ART004/model.glb` |
| Conversion Required | Sketchfab allows GLB download directly |

**Download steps:**
1. Go to https://sketchfab.com/britishmuseum
2. Search "cuneiform" or "clay tablet"
3. On the 3D model page, click **Download** → select **GLB** or **Original Format**
4. Confirm license is CC BY or more permissive before downloading
5. Rename to `model.glb` and place at the destination path.
6. Update `institution` in `src/data/artifacts.js` for ART004 to `"The British Museum"` and update `license` to `"CC BY 4.0 (The British Museum)"`.

---

## ART005 — Golden Obelisk of Memphis

| Field | Value |
|---|---|
| Artifact Name | Golden Obelisk of Memphis |
| Period | 13th Century BCE |
| Origin | Memphis, Ancient Egypt |
| Recommended Source | **Smithsonian 3D** or **Europeana 3D** |
| Official Page | https://3d.si.edu (search "obelisk" or "Egypt") |
| Search Keywords | `Egyptian obelisk 3D`, `Memphis obelisk GLB`, `Egyptian stele model`, `hieroglyphic obelisk` |
| 3D Model Available | **UNKNOWN — Must verify.** Egyptian obelisks exist in several museums but 3D downloadable assets are rare. |
| License | CC0 or CC BY 4.0 required |
| Attribution Required | Depends on source |
| Expected Filename | `model.glb` |
| Destination Path | `public/models/artifacts/ART005/model.glb` |
| Conversion Required | Possibly — OBJ or FBX sources require Blender conversion |

**Verification steps:**
1. Search Smithsonian 3D: https://3d.si.edu — query "Egypt" or "obelisk"
2. Search Sketchfab cultural heritage: https://sketchfab.com/search?q=egyptian+obelisk&licenses=cc0,by
3. Only accept a model clearly representing an Egyptian obelisk or similar monumental stele.

---

## 📋 Master Asset Checklist

| ID | Artifact | Recommended Source | Model Available? | License | Manual Action Required | Destination Path |
|----|----------|--------------------|-----------------|---------|------------------------|------------------|
| ART001 | Handaxe from India | Smithsonian 3D (humanorigins.si.edu) | **LIKELY** — Verify on 3d.si.edu and download GLB | CC0 1.0 Universal | Download GLB, rename to model.glb | `public/models/artifacts/ART001/model.glb` |
| ART002 | Attic Black-Figure Amphora | Smithsonian 3D or The Met Open Access | **UNKNOWN** — Must search 3d.si.edu; Met rarely has 3D | CC0 or CC BY 4.0 | Search both sources; verify object matches | `public/models/artifacts/ART002/model.glb` |
| ART003 | Royal Ceremonial Gemmed Crown | Europeana 3D or Sketchfab Cultural Heritage | **UNKNOWN** — Medieval regalia 3D models are uncommon | CC0 or CC BY 4.0 | Search Europeana 3D filter and Sketchfab | `public/models/artifacts/ART003/model.glb` |
| ART004 | Cuneiform Decree Tablet | British Museum on Sketchfab | **LIKELY** — British Museum publishes cuneiform scans on Sketchfab | CC BY 4.0 | Download GLB from sketchfab.com/britishmuseum; update institution in artifacts.js | `public/models/artifacts/ART004/model.glb` |
| ART005 | Golden Obelisk of Memphis | Smithsonian 3D or Europeana 3D | **UNKNOWN** — Egyptian obelisk 3D assets are uncommon online | CC0 or CC BY 4.0 | Search Smithsonian 3D and Sketchfab | `public/models/artifacts/ART005/model.glb` |

---

## Blender GLB Conversion Guide (If Needed)

If a source provides OBJ, FBX, or other formats instead of GLB:

1. Download [Blender](https://www.blender.org/download/) (free, open-source).
2. Open Blender → `File → Import → [choose your format]`.
3. Select and import the downloaded file.
4. Inspect the model visually to confirm it represents the correct artifact.
5. `File → Export → glTF 2.0 (.glb/.gltf)`.
6. In the export dialog:
   - Format: **GLB** (single binary file, preferred)
   - Check: Include normals, Include UV, Include materials
   - Uncheck: Apply modifiers (unless model has issues)
7. Save and rename the output file to `model.glb`.
8. Place at the correct destination path from the table above.

---

## How to Verify in Browser After Placing a GLB

1. Ensure `npm run dev` is running.
2. Open `http://localhost:3000`.
3. Open **Chrome DevTools → Console** (`F12`).
4. Look for the pipeline validation table logged on startup:

```
[Virtual Museum Pipeline] 3D Asset Validation Audit
┌─────────┬──────────────────────────────┬────────────────────────┐
│ Exhibit │ Configured Model Path         │ Asset Status           │
├─────────┼──────────────────────────────┼────────────────────────┤
│ ART001  │ /models/artifacts/ART001/... │ ✓ FOUND (3D GLB Ready) │
│ ART002  │ /models/artifacts/ART002/... │ ✗ MISSING              │
...
```

5. Walk to the artifact pedestal in the museum and confirm the 3D model renders
   correctly on top of the pedestal.
6. Click the exhibit → verify the information drawer opens with correct metadata.
7. Switch to **Orbit Inspect** mode to examine the model from all angles.
