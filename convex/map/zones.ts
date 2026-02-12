// convex/map/zones.ts
// ── Zone Registry ──
// Master zone definitions with bounds, speed, visuals, and road styles.
// Per-zone building data lives in convex/map/zones/*.ts

import { isOnLand } from "./islands";

// ── Types ──

export type ZoneId =
  | "forest"
  | "mountains"
  | "oldtown"
  | "harbor"
  | "downtown"
  | "park"
  | "suburbs"
  | "commercial"
  | "farmland"
  | "industrial"
  | "wetlands"
  | "boardwalk"
  | "beach"
  | "smallisland";

/** Natural feature zones (not land zones, but overlay features) */
export type NaturalFeatureId = "river" | "lake";

export type PropertyCategory =
  | "residential"
  | "commercial"
  | "service"
  | "shop";

export type PropertySubType =
  // ── Residential ──
  | "house"
  | "duplex"
  | "apartment"
  | "luxury_apartment"
  | "condo_tower"
  | "farmhouse"
  // ── Commercial (ownable businesses) ──
  | "warehouse"
  | "barn"
  | "investment_firm"
  | "law_office"
  | "insurance"
  | "news_tower"
  | "office_tower"
  | "tech_hub"
  | "wholesale"
  | "sawmill_factory"
  | "smelter"
  | "food_processing"
  | "chemical_plant"
  | "textile_mill"
  | "electronics_factory"
  | "luxury_hotel"
  | "plaza_hotel"
  | "mega_mall"
  | "beach_club"
  // ── Shop (ownable, players interact to buy goods) ──
  | "clothing_store"
  | "grocery_store"
  | "hardware_store"
  | "bakery"
  | "bookstore"
  | "inn"
  | "antique_shop"
  | "tailor"
  | "blacksmith"
  | "herbalist"
  | "general_store"
  | "tavern"
  | "fish_market"
  | "ship_supply"
  | "bait_shop"
  | "seed_store"
  | "farmhouse_kitchen"
  | "park_cafe"
  | "coffee_shop"
  | "farmers_market"
  | "electronics_store"
  | "mega_mart"
  | "furniture_outlet"
  | "auto_parts"
  | "pet_shop"
  | "sports_store"
  | "pharmacy"
  | "surf_shop"
  | "beach_rental"
  | "ice_cream_stand"
  | "yacht_club_shop"
  | "gym"
  | "food_court"
  | "sawmill"
  // ── Service (public fixtures, not ownable) ──
  | "ranger_station"
  | "lumber_camp"
  | "lookout"
  | "mine"
  | "quarry"
  | "mountain_lodge"
  | "museum"
  | "town_hall"
  | "clock_tower"
  | "harbor_master"
  | "customs_house"
  | "lighthouse"
  | "dry_dock"
  | "boat_rental"
  | "city_hall"
  | "bank_tower"
  | "stock_exchange"
  | "casino"
  | "police_hq"
  | "botanical_garden"
  | "bandstand"
  | "community_center"
  | "school"
  | "church"
  | "clinic"
  | "bank_branch"
  | "shipping_hub"
  | "recycling"
  | "power_station"
  | "nature_center"
  | "bird_watch"
  | "arcade"
  | "resort_pool"
  | "volleyball_court"
  | "island_dock";

// ── Zone Bounds ──

export interface ZoneBounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// ── Zone Visual Config ──

export interface ZoneVisualConfig {
  grassColor: number;
  grassAccent: number;
  /** Decorative trees per 200×200 block */
  treeCount: number;
  treeSizeMin: number;
  treeSizeMax: number;
  /** Tree type for this zone */
  treeType: "oak" | "pine" | "palm" | "willow" | "bush" | "fruit" | "none";
  hasStreetLights: boolean;
}

// ── Zone Definition ──

export interface ZoneDefinition {
  id: ZoneId;
  name: string;
  bounds: ZoneBounds;
  /** Movement speed multiplier (1 = normal) */
  speedMultiplier: number;
  /** Whether the zone has structured roads */
  hasRoads: boolean;
  /** Road style key from ROAD_STYLES */
  roadStyle: string;
  /** Terrain colors + tree config */
  visuals: ZoneVisualConfig;
  /** UI description */
  description: string;
  /** Priority for zone resolution (lower = checked first) */
  priority: number;
}

// ── Zone Definitions ──

export const ZONES: Record<ZoneId, ZoneDefinition> = {
  // Priority 0–4: small/specific zones checked first
  smallisland: {
    id: "smallisland",
    name: "Small Island",
    bounds: { x1: 7500, y1: 7100, x2: 7900, y2: 7500 },
    speedMultiplier: 0.8,
    hasRoads: false,
    roadStyle: "stone",
    visuals: {
      grassColor: 0x3a9a3a,
      grassAccent: 0x2d8a2d,
      treeCount: 4,
      treeSizeMin: 8,
      treeSizeMax: 14,
      treeType: "palm",
      hasStreetLights: false,
    },
    description: "Remote secret island with a lighthouse. Boat access only.",
    priority: 0,
  },
  harbor: {
    id: "harbor",
    name: "Harbor",
    bounds: { x1: 6400, y1: 2600, x2: 7600, y2: 4600 },
    speedMultiplier: 1.0,
    hasRoads: true,
    roadStyle: "dock",
    visuals: {
      grassColor: 0x6a7a6a,
      grassAccent: 0x5a6a5a,
      treeCount: 0,
      treeSizeMin: 0,
      treeSizeMax: 0,
      treeType: "none",
      hasStreetLights: true,
    },
    description:
      "Bustling port with docks, a fish market, and shipping warehouses.",
    priority: 1,
  },
  commercial: {
    id: "commercial",
    name: "Commercial Strip",
    bounds: { x1: 3400, y1: 4200, x2: 5400, y2: 5400 },
    speedMultiplier: 1.0,
    hasRoads: true,
    roadStyle: "boulevard",
    visuals: {
      grassColor: 0x4a7a4a,
      grassAccent: 0x3d6b3d,
      treeCount: 1,
      treeSizeMin: 4,
      treeSizeMax: 8,
      treeType: "oak",
      hasStreetLights: true,
    },
    description:
      "Dense retail connector between downtown and industrial zones.",
    priority: 2,
  },
  wetlands: {
    id: "wetlands",
    name: "Wetlands",
    bounds: { x1: 5600, y1: 5800, x2: 7400, y2: 7200 },
    speedMultiplier: 0.6,
    hasRoads: false,
    roadStyle: "boardwalk",
    visuals: {
      grassColor: 0x3a6a3a,
      grassAccent: 0x2a5a2a,
      treeCount: 3,
      treeSizeMin: 6,
      treeSizeMax: 10,
      treeType: "willow",
      hasStreetLights: false,
    },
    description:
      "Marshy nature reserve with rare fishing, herbs, and wildlife.",
    priority: 3,
  },
  boardwalk: {
    id: "boardwalk",
    name: "Boardwalk & Resort",
    bounds: { x1: 2200, y1: 6800, x2: 6000, y2: 7600 },
    speedMultiplier: 1.0,
    hasRoads: true,
    roadStyle: "boardwalk",
    visuals: {
      grassColor: 0xd4b483,
      grassAccent: 0xc4a473,
      treeCount: 2,
      treeSizeMin: 8,
      treeSizeMax: 12,
      treeType: "palm",
      hasStreetLights: true,
    },
    description: "Beach shops, resort hotel, pier fishing, and entertainment.",
    priority: 4,
  },

  // Priority 5–9: medium-priority zones
  downtown: {
    id: "downtown",
    name: "Downtown",
    bounds: { x1: 4000, y1: 2800, x2: 6400, y2: 4800 },
    speedMultiplier: 1.0,
    hasRoads: true,
    roadStyle: "boulevard",
    visuals: {
      grassColor: 0x4a7a4a,
      grassAccent: 0x3d6b3d,
      treeCount: 1,
      treeSizeMin: 4,
      treeSizeMax: 8,
      treeType: "oak",
      hasStreetLights: true,
    },
    description:
      "The bustling city center — skyscrapers, corporate offices, and financial services.",
    priority: 5,
  },
  oldtown: {
    id: "oldtown",
    name: "Old Town",
    bounds: { x1: 5000, y1: 1400, x2: 6800, y2: 3600 },
    speedMultiplier: 1.0,
    hasRoads: true,
    roadStyle: "cobblestone",
    visuals: {
      grassColor: 0x5a7a4a,
      grassAccent: 0x4a6a3d,
      treeCount: 3,
      treeSizeMin: 6,
      treeSizeMax: 10,
      treeType: "oak",
      hasStreetLights: true,
    },
    description:
      "Historic district with narrow cobblestone streets and traditional shops.",
    priority: 6,
  },
  mountains: {
    id: "mountains",
    name: "Mountains",
    bounds: { x1: 2800, y1: 400, x2: 5600, y2: 2200 },
    speedMultiplier: 0.5,
    hasRoads: false,
    roadStyle: "trail",
    visuals: {
      grassColor: 0x6a7a6a,
      grassAccent: 0x5a6a5a,
      treeCount: 2,
      treeSizeMin: 4,
      treeSizeMax: 8,
      treeType: "pine",
      hasStreetLights: false,
    },
    description:
      "Rocky highlands with mining sites, switchback trails, and a quarry.",
    priority: 7,
  },
  industrial: {
    id: "industrial",
    name: "Industrial District",
    bounds: { x1: 4600, y1: 4600, x2: 6800, y2: 6600 },
    speedMultiplier: 1.0,
    hasRoads: true,
    roadStyle: "industrial",
    visuals: {
      grassColor: 0x5a6a4a,
      grassAccent: 0x4a5a3d,
      treeCount: 0,
      treeSizeMin: 0,
      treeSizeMax: 0,
      treeType: "none",
      hasStreetLights: true,
    },
    description:
      "Factories, warehouses, and processing plants. The crafting hub.",
    priority: 8,
  },
  park: {
    id: "park",
    name: "Central Park",
    bounds: { x1: 2000, y1: 2600, x2: 4200, y2: 4400 },
    speedMultiplier: 0.9,
    hasRoads: false,
    roadStyle: "trail",
    visuals: {
      grassColor: 0x3a9a3a,
      grassAccent: 0x2d8a2d,
      treeCount: 6,
      treeSizeMin: 8,
      treeSizeMax: 14,
      treeType: "oak",
      hasStreetLights: false,
    },
    description:
      "Green sanctuary with a central lake, event lawn, and botanical gardens.",
    priority: 9,
  },

  // Priority 10–13: large/fallback zones
  forest: {
    id: "forest",
    name: "Forest",
    bounds: { x1: 600, y1: 600, x2: 3400, y2: 3000 },
    speedMultiplier: 0.65,
    hasRoads: false,
    roadStyle: "trail",
    visuals: {
      grassColor: 0x2d6a2d,
      grassAccent: 0x1a5a1a,
      treeCount: 12,
      treeSizeMin: 8,
      treeSizeMax: 16,
      treeType: "pine",
      hasStreetLights: false,
    },
    description:
      "Dense woodland with trails, lumber camps, and a central sawmill.",
    priority: 10,
  },
  farmland: {
    id: "farmland",
    name: "Farmland",
    bounds: { x1: 600, y1: 5400, x2: 3800, y2: 7000 },
    speedMultiplier: 0.85,
    hasRoads: true,
    roadStyle: "gravel",
    visuals: {
      grassColor: 0x5a8a3a,
      grassAccent: 0x4a7a2a,
      treeCount: 2,
      treeSizeMin: 6,
      treeSizeMax: 10,
      treeType: "fruit",
      hasStreetLights: false,
    },
    description:
      "Rolling fields with crop plots, barns, and a farmer's market.",
    priority: 11,
  },
  suburbs: {
    id: "suburbs",
    name: "Suburbs",
    bounds: { x1: 600, y1: 3200, x2: 3200, y2: 5800 },
    speedMultiplier: 1.0,
    hasRoads: true,
    roadStyle: "residential",
    visuals: {
      grassColor: 0x4a8a4a,
      grassAccent: 0x3d7b3d,
      treeCount: 4,
      treeSizeMin: 6,
      treeSizeMax: 12,
      treeType: "oak",
      hasStreetLights: true,
    },
    description:
      "Quiet residential neighborhoods with houses and local stores.",
    priority: 12,
  },
  beach: {
    id: "beach",
    name: "Beach",
    bounds: { x1: 7400, y1: 4200, x2: 8200, y2: 7200 },
    speedMultiplier: 0.8,
    hasRoads: false,
    roadStyle: "trail",
    visuals: {
      grassColor: 0xd4b483,
      grassAccent: 0xc4a473,
      treeCount: 2,
      treeSizeMin: 8,
      treeSizeMax: 12,
      treeType: "palm",
      hasStreetLights: false,
    },
    description: "Sandy shores with beach clubs and coastal gathering.",
    priority: 13,
  },
};

// ── Zone Resolution ──

/** Zone IDs sorted by priority (lower priority number = checked first) */
const ZONE_PRIORITY: ZoneId[] = (Object.values(ZONES) as ZoneDefinition[])
  .sort((a, b) => a.priority - b.priority)
  .map((z) => z.id);

/** Determine which zone a world coordinate falls in */
export function getZoneAt(x: number, y: number): ZoneId | null {
  for (const zoneId of ZONE_PRIORITY) {
    const b = ZONES[zoneId].bounds;
    if (x >= b.x1 && x < b.x2 && y >= b.y1 && y < b.y2) {
      return zoneId;
    }
  }
  // If on land but no zone matched, return suburbs as fallback
  if (isOnLand(x, y)) return "suburbs";
  return null; // ocean
}

/** Get the full zone definition for a world coordinate */
export function getZoneDefAt(x: number, y: number): ZoneDefinition | null {
  const zoneId = getZoneAt(x, y);
  return zoneId ? ZONES[zoneId] : null;
}

/** Get all zone definitions in priority order */
export function getZoneList(): ZoneDefinition[] {
  return ZONE_PRIORITY.map((id) => ZONES[id]);
}

/** Get zone display name with emoji */
export function getZoneDisplayName(zoneId: ZoneId): string {
  const icons: Record<ZoneId, string> = {
    forest: "🌲",
    mountains: "⛰️",
    oldtown: "🏛️",
    harbor: "⚓",
    downtown: "🏙️",
    park: "🌳",
    suburbs: "🏘️",
    commercial: "🛒",
    farmland: "🌾",
    industrial: "🏭",
    wetlands: "🌿",
    boardwalk: "🎡",
    beach: "🏖️",
    smallisland: "🏝️",
  };
  return `${icons[zoneId]} ${ZONES[zoneId].name}`;
}

// ── Compat: ZONE_VISUALS lookup (derived from ZONES[id].visuals) ──

export const ZONE_VISUALS: Record<ZoneId, ZoneVisualConfig> =
  Object.fromEntries(
    Object.values(ZONES).map((z) => [z.id, z.visuals]),
  ) as Record<ZoneId, ZoneVisualConfig>;
