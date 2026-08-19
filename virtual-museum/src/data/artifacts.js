export const artifactsData = [
  {
    id: "ART001",
    name: "Bust of Socrates",
    category: "Classical Sculpture",
    period: "4th Century BCE",
    origin: "Athens, Ancient Greece",
    description: "A finely sculpted marble bust depicting the philosopher Socrates. Characterized by expressive facial detailing, traditional beard rendering, and contemplative aesthetic representative of Classical Greek portraiture.",
    modelPath: null, // Set to "/models/artifacts/artifact1.glb" when placing GLB model file
    position: [-14, 0, 4],
    rotation: [0, Math.PI / 4, 0],
    scale: 1,
    galleryId: "gallery-1",
    galleryName: "Gallery 1: Classical Antiquities",
    pedestalHeight: 1.2,
    source: "Virtual Heritage Collection",
    license: "CC BY 4.0",
    aiContext: {
      historicalSignificance: "Socrates laid the foundational principles of Western epistemology through the Socratic method of dialogue.",
      material: "Pentelic Marble",
      dimensions: "65cm x 42cm x 30cm"
    }
  },
  {
    id: "ART002",
    name: "Attic Black-Figure Amphora",
    category: "Ancient Pottery",
    period: "c. 540 BCE",
    origin: "Attica, Greece",
    description: "An exquisite ceramic storage vessel featuring black-figure narrative painting. Depicts mythological heroic motifs framed by intricate floral palmette borders and double curved handles.",
    modelPath: null, // Set to "/models/artifacts/artifact2.glb" when placing GLB model file
    position: [-14, 0, -4],
    rotation: [0, -Math.PI / 6, 0],
    scale: 1,
    galleryId: "gallery-1",
    galleryName: "Gallery 1: Classical Antiquities",
    pedestalHeight: 1.2,
    source: "Virtual Heritage Collection",
    license: "CC BY 4.0",
    aiContext: {
      historicalSignificance: "Amphorae were key export goods used for storing olive oil and wine across Mediterranean trade networks.",
      material: "Terracotta & Slip Glaze",
      dimensions: "58cm x 34cm diameter"
    }
  },
  {
    id: "ART003",
    name: "Royal Ceremonial Gemmed Crown",
    category: "Regalia & Metalwork",
    period: "12th Century CE",
    origin: "Holy Roman Empire",
    description: "An ornate ceremonial crown crafted from hammered gold sheet, set with cabochon sapphires, rubies, and freshwater pearls. Features filigree scrollwork and fleur-de-lis cresting points.",
    modelPath: null, // Set to "/models/artifacts/artifact3.glb" when placing GLB model file
    position: [14, 0, 4],
    rotation: [0, -Math.PI / 4, 0],
    scale: 1,
    galleryId: "gallery-2",
    galleryName: "Gallery 2: Medieval & Epigraphic Treasures",
    pedestalHeight: 1.2,
    source: "Virtual Heritage Collection",
    license: "CC BY 4.0",
    aiContext: {
      historicalSignificance: "Symbolized divine right and political sovereignty during coronation rituals of medieval monarchs.",
      material: "22K Gold, Sapphires, Rubies, Pearls",
      dimensions: "22cm diameter x 18cm height"
    }
  },
  {
    id: "ART004",
    name: "Cuneiform Decree Tablet",
    category: "Historical Epigraphy",
    period: "c. 1800 BCE",
    origin: "Mesopotamia (Babylon)",
    description: "A clay slab inscribed with dense cuneiform characters recording royal administrative decrees and legal precedents, offering invaluable insight into early urban governance and trade laws.",
    modelPath: null, // Set to "/models/artifacts/artifact4.glb" when placing GLB model file
    position: [14, 0, -4],
    rotation: [0, Math.PI / 6, 0],
    scale: 1,
    galleryId: "gallery-2",
    galleryName: "Gallery 2: Medieval & Epigraphic Treasures",
    pedestalHeight: 1.2,
    source: "Virtual Heritage Collection",
    license: "CC BY 4.0",
    aiContext: {
      historicalSignificance: "Demonstrates early codification of commercial law, property rights, and civic obligations in ancient Mesopotamia.",
      material: "Kiln-baked Clay",
      dimensions: "32cm x 24cm x 6cm"
    }
  },
  {
    id: "ART005",
    name: "Golden Obelisk of Memphis",
    category: "Architectural Monument",
    period: "13th Century BCE",
    origin: "Memphis, Ancient Egypt",
    description: "A miniature monolithic stone obelisk capped with a gold-leaf pyramidion. Engraved with deeply incised hieroglyphic inscriptions honoring solar deity Ra and royal cartouches.",
    modelPath: null, // Set to "/models/artifacts/artifact5.glb" when placing GLB model file
    position: [0, 0, -16],
    rotation: [0, Math.PI / 8, 0],
    scale: 1.1,
    galleryId: "gallery-3",
    galleryName: "Gallery 3: Ancient Wonders Hall",
    pedestalHeight: 1.2,
    source: "Virtual Heritage Collection",
    license: "CC BY 4.0",
    aiContext: {
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
    description: "Discover sculptures and ceramic masterpieces from ancient Greece and Rome.",
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
