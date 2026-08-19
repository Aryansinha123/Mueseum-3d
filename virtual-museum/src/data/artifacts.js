export const artifactsData = [
  {
    id: "ART001",
    name: "Handaxe from India",
    category: "Prehistoric / Archaeological Artifact",
    institution: "Smithsonian Institution",
    source: "Smithsonian Institution",
    sourceUrl: "https://humanorigins.si.edu/evidence/3d-collection/artifacts/handaxe-isampur-india",
    modelPath: "/models/artifacts/ART001/model.glb",
    license: "CC0 1.0 Universal (Smithsonian Open Access)",
    position: [-14, 0, 4],
    rotation: [0, Math.PI / 4, 0],
    scale: 1,
    period: "c. 1.1 Million Years Old",
    origin: "Isampur, Karnataka, India",
    description: "An authentic Acheulean stone handaxe recovered from the Isampur archaeological site in Karnataka, India, dating to approximately 1.1 million years ago. Created by early humans who struck large flakes from limestone cores to shape durable bifacial cutting tools.",
    galleryId: "gallery-1",
    galleryName: "Gallery 1: Classical & Prehistoric Antiquities",
    pedestalHeight: 1.2,
    aiContext: {
      artifact_id: "ART001",
      historicalSignificance: "Key archaeological evidence of Acheulean toolmaking innovation and early hominin dispersal in South Asia.",
      material: "Limestone / Chert",
      dimensions: "approx. 18cm length"
    }
  },
  {
    id: "ART002",
    name: "Attic Black-Figure Amphora",
    category: "Ancient Pottery",
    institution: "Virtual Heritage Collection",
    source: "Virtual Heritage Collection",
    sourceUrl: "https://3d.si.edu",
    modelPath: "/models/artifacts/ART002/model.glb",
    license: "CC BY 4.0",
    position: [-14, 0, -4],
    rotation: [0, -Math.PI / 6, 0],
    scale: 1,
    period: "c. 540 BCE",
    origin: "Attica, Greece",
    description: "An exquisite ceramic storage vessel featuring black-figure narrative painting. Depicts mythological heroic motifs framed by intricate floral palmette borders and double curved handles.",
    galleryId: "gallery-1",
    galleryName: "Gallery 1: Classical Antiquities",
    pedestalHeight: 1.2,
    aiContext: {
      artifact_id: "ART002",
      historicalSignificance: "Amphorae were key export goods used for storing olive oil and wine across Mediterranean trade networks.",
      material: "Terracotta & Slip Glaze",
      dimensions: "58cm x 34cm diameter"
    }
  },
  {
    id: "ART003",
    name: "Royal Ceremonial Gemmed Crown",
    category: "Regalia & Metalwork",
    institution: "Virtual Heritage Collection",
    source: "Virtual Heritage Collection",
    sourceUrl: "https://3d.si.edu",
    modelPath: "/models/artifacts/ART003/model.glb",
    license: "CC BY 4.0",
    position: [14, 0, 4],
    rotation: [0, -Math.PI / 4, 0],
    scale: 1,
    period: "12th Century CE",
    origin: "Holy Roman Empire",
    description: "An ornate ceremonial crown crafted from hammered gold sheet, set with cabochon sapphires, rubies, and freshwater pearls. Features filigree scrollwork and fleur-de-lis cresting points.",
    galleryId: "gallery-2",
    galleryName: "Gallery 2: Medieval & Epigraphic Treasures",
    pedestalHeight: 1.2,
    aiContext: {
      artifact_id: "ART003",
      historicalSignificance: "Symbolized divine right and political sovereignty during coronation rituals of medieval monarchs.",
      material: "22K Gold, Sapphires, Rubies, Pearls",
      dimensions: "22cm diameter x 18cm height"
    }
  },
  {
    id: "ART004",
    name: "Cuneiform Decree Tablet",
    category: "Historical Epigraphy",
    institution: "Virtual Heritage Collection",
    source: "Virtual Heritage Collection",
    sourceUrl: "https://3d.si.edu",
    modelPath: "/models/artifacts/ART004/model.glb",
    license: "CC BY 4.0",
    position: [14, 0, -4],
    rotation: [0, Math.PI / 6, 0],
    scale: 1,
    period: "c. 1800 BCE",
    origin: "Mesopotamia (Babylon)",
    description: "A clay slab inscribed with dense cuneiform characters recording royal administrative decrees and legal precedents, offering invaluable insight into early urban governance and trade laws.",
    galleryId: "gallery-2",
    galleryName: "Gallery 2: Medieval & Epigraphic Treasures",
    pedestalHeight: 1.2,
    aiContext: {
      artifact_id: "ART004",
      historicalSignificance: "Demonstrates early codification of commercial law, property rights, and civic obligations in ancient Mesopotamia.",
      material: "Kiln-baked Clay",
      dimensions: "32cm x 24cm x 6cm"
    }
  },
  {
    id: "ART005",
    name: "Golden Obelisk of Memphis",
    category: "Architectural Monument",
    institution: "Virtual Heritage Collection",
    source: "Virtual Heritage Collection",
    sourceUrl: "https://3d.si.edu",
    modelPath: "/models/artifacts/ART005/model.glb",
    license: "CC BY 4.0",
    position: [0, 0, -16],
    rotation: [0, Math.PI / 8, 0],
    scale: 1.1,
    period: "13th Century BCE",
    origin: "Memphis, Ancient Egypt",
    description: "A miniature monolithic stone obelisk capped with a gold-leaf pyramidion. Engraved with deeply incised hieroglyphic inscriptions honoring solar deity Ra and royal cartouches.",
    galleryId: "gallery-3",
    galleryName: "Gallery 3: Ancient Wonders Hall",
    pedestalHeight: 1.2,
    aiContext: {
      artifact_id: "ART005",
      historicalSignificance: "Obelisks served as monumental sun altars representing rays of light connecting earth with the divine heavens.",
      material: "Red Granite & Electrum Pyramidion",
      dimensions: "240cm total height"
    }
  }
];

export const galleriesData = [
  {
    id: "entrance",
    name: "Museum Entrance Portal",
    description: "Walk through the main double doors to enter the Central Lobby.",
    position: [0, 1.65, 23],
    lookAt: [0, 1.65, 15]
  },
  {
    id: "lobby",
    name: "Central Rotunda Lobby",
    description: "The main lobby hub connecting Gallery 1, Gallery 2, and Gallery 3.",
    position: [0, 1.65, 8],
    lookAt: [0, 1.65, 0]
  },
  {
    id: "gallery-1",
    name: "Gallery 1: Classical Antiquities",
    description: "Discover prehistoric stone tools and classical sculptures from ancient civilizations.",
    position: [-12, 1.65, 0],
    lookAt: [-14, 1.65, 0]
  },
  {
    id: "gallery-2",
    name: "Gallery 2: Medieval & Epigraphic Treasures",
    description: "Examine royal regalia and ancient written codes that shaped human civilization.",
    position: [12, 1.65, 0],
    lookAt: [14, 1.65, 0]
  },
  {
    id: "gallery-3",
    name: "Gallery 3: Ancient Wonders Hall",
    description: "Marvel at monumental architecture and sacred symbols of the ancient world.",
    position: [0, 1.65, -12],
    lookAt: [0, 1.65, -16]
  }
];
