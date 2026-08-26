"use client";

// Cache for checked GLB asset availability results
const assetAvailabilityCache = new Map();

/**
 * Probes whether a 3D GLB model file exists at the given public path.
 * Uses a lightweight HEAD request to prevent downloading heavy binary payloads or causing 404 crashes.
 *
 * @param {string} modelPath - Relative path from /public (e.g. "/models/artifacts/ART001/model.glb")
 * @returns {Promise<boolean>}
 */
export async function checkGlbAssetExists(modelPath) {
  if (!modelPath) return false;
  if (assetAvailabilityCache.has(modelPath)) {
    return assetAvailabilityCache.get(modelPath);
  }

  try {
    const res = await fetch(modelPath, { method: "HEAD" });
    const exists = res.ok;
    assetAvailabilityCache.set(modelPath, exists);
    return exists;
  } catch (err) {
    assetAvailabilityCache.set(modelPath, false);
    return false;
  }
}

/**
 * Audits all configured museum artifacts and logs a structured status table in the developer console.
 *
 * @param {Array} artifacts - Array of artifact metadata objects from artifacts.js
 */
export async function validateArtifactAssets(artifacts) {
  if (typeof window === "undefined" || process.env.NODE_ENV === "production") return;

  const results = await Promise.all(
    artifacts.map(async (art) => {
      const exists = await checkGlbAssetExists(art.modelPath);
      return {
        "Exhibit ID": art.id,
        "Exhibit Name": art.name,
        "Configured Model Path": art.modelPath,
        "Institution": art.institution || art.source || "Unknown",
        "Asset Status": exists ? "✓ FOUND (3D GLB Ready)" : "✗ MISSING (Placeholder Active)",
      };
    })
  );

  console.groupCollapsed(
    "%c[Virtual Museum Pipeline] 3D Asset Validation Audit",
    "color: #f59e0b; font-weight: bold; font-size: 12px;"
  );
  console.table(results);
  console.info(
    "To integrate real 3D models, place GLB files at public/models/artifacts/<ARTIFACT_ID>/model.glb"
  );
  console.groupEnd();

  return results;
}
