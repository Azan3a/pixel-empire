// convex/mapZones.ts
// Zone definitions, building templates, and helpers for the 4000×4000 map

// ── Types ──

export type ZoneId =
  | "downtown"
  | "suburbs"
  | "industrial"
  | "forest"
  | "park"
  | "beach";

export type PropertyCategory =
  | "residential"
  | "commercial"
  | "service"
  | "shop";

export type PropertySubType =
  // Residential
  | "house"
  | "duplex"
  | "apartment"
  // Commercial
  | "corner_store"
  | "office"
  | "mall"
  | "warehouse"
  | "factory"
  // Shop (ownable, players interact to buy goods)
  | "food_shop"
  | "supply_store"
  | "clothing_store"
  // Service (public fixtures, not ownable)
  | "bank"
  | "casino"
  | "police_station"
  | "ranger_station";

// ── Zone Definitions ──

export interface ZoneBounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ZoneDefinition {
  id: ZoneId;
  name: string;
  bounds: ZoneBounds;
  /** Probability a block is skipped during generation (0 = dense, 1 = empty) */
  skipChance: number;
  /** Base terrain fill color */
  terrainColor: number;
  /** Grid-line / accent color */
  terrainAccent: number;
  /** Movement speed multiplier (1 = normal) */
  speedMultiplier: number;
  /** Whether the standard road grid renders in this zone */
  hasRoads: boolean;
  /** UI description */
  description: string;
}

export const ZONES: Record<ZoneId, ZoneDefinition> = {
  downtown: {
    id: "downtown",
    name: "Downtown",
    bounds: { x1: 1200, y1: 1200, x2: 2800, y2: 2800 },
    skipChance: 0.1,
    terrainColor: 0x4a7a4a,
    terrainAccent: 0x3d6b3d,
    speedMultiplier: 1.0,
    hasRoads: true,
    description: "The bustling city center — shops, offices, and high-rises.",
  },
  suburbs: {
    id: "suburbs",
    name: "Suburbs",
    // Default fill — bounds cover the entire map; priority system means
    // specific zones win when they overlap.
    bounds: { x1: 0, y1: 0, x2: 4000, y2: 4000 },
    skipChance: 0.35,
    terrainColor: 0x4a8a4a,
    terrainAccent: 0x3d7b3d,
    speedMultiplier: 1.0,
    hasRoads: true,
    description:
      "Quiet residential neighborhoods with houses and local stores.",
  },
  industrial: {
    id: "industrial",
    name: "Industrial District",
    bounds: { x1: 0, y1: 0, x2: 1200, y2: 1200 },
    skipChance: 0.25,
    terrainColor: 0x5a6a4a,
    terrainAccent: 0x4a5a3d,
    speedMultiplier: 1.0,
    hasRoads: true,
    description: "Warehouses, factories, and the delivery hub.",
  },
  forest: {
    id: "forest",
    name: "Forest",
    bounds: { x1: 2800, y1: 0, x2: 4000, y2: 1200 },
    skipChance: 0.85,
    terrainColor: 0x2d6a2d,
    terrainAccent: 0x1a5a1a,
    speedMultiplier: 0.7,
    hasRoads: true,
    description: "Dense woodland with winding trails.",
  },
  park: {
    id: "park",
    name: "Central Park",
    bounds: { x1: 0, y1: 1400, x2: 1200, y2: 2800 },
    skipChance: 1.0, // no buildings
    terrainColor: 0x3a9a3a,
    terrainAccent: 0x2d8a2d,
    speedMultiplier: 0.9,
    hasRoads: true,
    description: "Open green space with paths, ponds, and benches.",
  },
  beach: {
    id: "beach",
    name: "Beach & Boardwalk",
    bounds: { x1: 0, y1: 3500, x2: 4000, y2: 4000 },
    skipChance: 0.5,
    terrainColor: 0xd4b483,
    terrainAccent: 0xc4a473,
    speedMultiplier: 0.8,
    hasRoads: true,
    description: "Sandy shores and a lively boardwalk.",
  },
};

// ── Zone Resolution ──

/** Priority order — first match wins; suburbs is the fallback */
const ZONE_PRIORITY: ZoneId[] = [
  "downtown",
  "industrial",
  "forest",
  "park",
  "beach",
  "suburbs",
];

/** Determine which zone a world coordinate falls in */
export function getZoneAt(x: number, y: number): ZoneId {
  for (const zoneId of ZONE_PRIORITY) {
    if (zoneId === "suburbs") continue;
    const b = ZONES[zoneId].bounds;
    if (x >= b.x1 && x < b.x2 && y >= b.y1 && y < b.y2) {
      return zoneId;
    }
  }
  return "suburbs";
}

/** Get the full zone definition for a world coordinate */
export function getZoneDefAt(x: number, y: number): ZoneDefinition {
  return ZONES[getZoneAt(x, y)];
}

/** Get zone for a block by its center point */
export function getBlockZone(
  blockX: number,
  blockY: number,
  blockW: number,
  blockH: number,
): ZoneId {
  return getZoneAt(blockX + blockW / 2, blockY + blockH / 2);
}

/** Get all zone IDs in priority order (for rendering layers) */
export function getZoneList(): ZoneDefinition[] {
  return ZONE_PRIORITY.map((id) => ZONES[id]);
}

// ── Building Templates ──

export interface BuildingTemplate {
  name: string;
  category: PropertyCategory;
  subType: PropertySubType;
  basePrice: number;
  baseIncome: number;
  sizeFactor: number;
  /** Max simultaneous owners (0 = not ownable, e.g. service buildings) */
  maxOwners: number;
  /** Zones where this template can spawn */
  zoneAffinity: ZoneId[];
}

export const BUILDING_TEMPLATES: BuildingTemplate[] = [
  // ── Residential ──
  {
    name: "House",
    category: "residential",
    subType: "house",
    basePrice: 1000,
    baseIncome: 10,
    sizeFactor: 0.5,
    maxOwners: 5,
    zoneAffinity: ["suburbs"],
  },
  {
    name: "Duplex",
    category: "residential",
    subType: "duplex",
    basePrice: 2000,
    baseIncome: 30,
    sizeFactor: 0.55,
    maxOwners: 8,
    zoneAffinity: ["suburbs"],
  },
  {
    name: "Apartment",
    category: "residential",
    subType: "apartment",
    basePrice: 3500,
    baseIncome: 50,
    sizeFactor: 0.65,
    maxOwners: 20,
    zoneAffinity: ["suburbs", "downtown"],
  },

  // ── Commercial ──
  {
    name: "Corner Store",
    category: "commercial",
    subType: "corner_store",
    basePrice: 5000,
    baseIncome: 100,
    sizeFactor: 0.6,
    maxOwners: 10,
    zoneAffinity: ["suburbs", "downtown"],
  },
  {
    name: "Office",
    category: "commercial",
    subType: "office",
    basePrice: 8000,
    baseIncome: 200,
    sizeFactor: 0.7,
    maxOwners: 15,
    zoneAffinity: ["downtown"],
  },
  {
    name: "Mall",
    category: "commercial",
    subType: "mall",
    basePrice: 15000,
    baseIncome: 400,
    sizeFactor: 0.8,
    maxOwners: 50,
    zoneAffinity: ["downtown"],
  },
  {
    name: "Warehouse",
    category: "commercial",
    subType: "warehouse",
    basePrice: 6000,
    baseIncome: 150,
    sizeFactor: 0.75,
    maxOwners: 10,
    zoneAffinity: ["industrial"],
  },
  {
    name: "Factory",
    category: "commercial",
    subType: "factory",
    basePrice: 12000,
    baseIncome: 350,
    sizeFactor: 0.8,
    maxOwners: 25,
    zoneAffinity: ["industrial"],
  },

  // ── Shops (ownable + interactive) ──
  {
    name: "Food Shop",
    category: "shop",
    subType: "food_shop",
    basePrice: 3000,
    baseIncome: 80,
    sizeFactor: 0.5,
    maxOwners: 15,
    zoneAffinity: ["downtown", "beach"],
  },
  {
    name: "Supply Store",
    category: "shop",
    subType: "supply_store",
    basePrice: 4000,
    baseIncome: 100,
    sizeFactor: 0.55,
    maxOwners: 10,
    zoneAffinity: ["suburbs", "industrial"],
  },
  {
    name: "Clothing Store",
    category: "shop",
    subType: "clothing_store",
    basePrice: 5000,
    baseIncome: 120,
    sizeFactor: 0.5,
    maxOwners: 15,
    zoneAffinity: ["downtown", "beach"],
  },
];

/** Get building templates valid for a specific zone */
export function getTemplatesForZone(zoneId: ZoneId): BuildingTemplate[] {
  return BUILDING_TEMPLATES.filter((t) => t.zoneAffinity.includes(zoneId));
}

// ── Service Buildings (fixed world positions, not ownable) ──

export interface ServiceBuildingDef {
  name: string;
  category: "service";
  subType: PropertySubType;
  x: number;
  y: number;
  width: number;
  height: number;
  zone: ZoneId;
}

export const SERVICE_BUILDINGS: ServiceBuildingDef[] = [
  {
    name: "Central Bank",
    category: "service",
    subType: "bank",
    x: 1810,
    y: 1820,
    width: 120,
    height: 100,
    zone: "downtown",
  },
  {
    name: "Lucky Star Casino",
    category: "service",
    subType: "casino",
    x: 2060,
    y: 1560,
    width: 130,
    height: 100,
    zone: "downtown",
  },
  {
    name: "Police HQ",
    category: "service",
    subType: "police_station",
    x: 1310,
    y: 2310,
    width: 100,
    height: 90,
    zone: "downtown",
  },
  {
    name: "Ranger Station",
    category: "service",
    subType: "ranger_station",
    x: 3060,
    y: 560,
    width: 80,
    height: 70,
    zone: "forest",
  },
];

// ── Zone Visual Config (used by terrain renderers) ──

export interface ZoneVisualConfig {
  grassColor: number;
  grassAccent: number;
  /** Decorative trees per block */
  treeCount: number;
  treeSizeMin: number;
  treeSizeMax: number;
  hasStreetLights: boolean;
}

export const ZONE_VISUALS: Record<ZoneId, ZoneVisualConfig> = {
  downtown: {
    grassColor: 0x4a7a4a,
    grassAccent: 0x3d6b3d,
    treeCount: 1,
    treeSizeMin: 4,
    treeSizeMax: 8,
    hasStreetLights: true,
  },
  suburbs: {
    grassColor: 0x4a8a4a,
    grassAccent: 0x3d7b3d,
    treeCount: 4,
    treeSizeMin: 6,
    treeSizeMax: 12,
    hasStreetLights: true,
  },
  industrial: {
    grassColor: 0x5a6a4a,
    grassAccent: 0x4a5a3d,
    treeCount: 1,
    treeSizeMin: 4,
    treeSizeMax: 8,
    hasStreetLights: true,
  },
  forest: {
    grassColor: 0x2d6a2d,
    grassAccent: 0x1a5a1a,
    treeCount: 12,
    treeSizeMin: 8,
    treeSizeMax: 16,
    hasStreetLights: false,
  },
  park: {
    grassColor: 0x3a9a3a,
    grassAccent: 0x2d8a2d,
    treeCount: 6,
    treeSizeMin: 8,
    treeSizeMax: 14,
    hasStreetLights: true,
  },
  beach: {
    grassColor: 0xd4b483,
    grassAccent: 0xc4a473,
    treeCount: 2,
    treeSizeMin: 6,
    treeSizeMax: 10,
    hasStreetLights: true,
  },
};

// ── Beach / Water Constants ──

/** Y coordinate where ocean water begins */
export const WATER_LINE_Y = 3750;
/** Y coordinate of the boardwalk center */
export const BOARDWALK_Y = 3550;
/** Height of the boardwalk deck */
export const BOARDWALK_HEIGHT = 60;
