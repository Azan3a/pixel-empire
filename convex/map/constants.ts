// convex/map/constants.ts
// ── Core Map Constants ──

/** Total map size in pixels (island fits within this bounding box) */
export const MAP_SIZE = 8000;

/** Tile size for grid snapping */
export const TILE_SIZE = 50;

/** Sell-back rate when players sell properties */
export const SELL_RATE = 0.7;

/** Income collection cooldown — once per game day (20 real minutes) */
export const INCOME_COOLDOWN_MS = 20 * 60 * 1000;

/** Max distance (center-to-center) a player can be from a shop to interact */
export const SHOP_INTERACT_RADIUS = 120;

/** Player collision hitbox size */
export const PLAYER_HITBOX = 40;

// ── Road Params Per Zone Type ──

export interface RoadStyle {
  /** Display name */
  name: string;
  /** Road surface width in pixels */
  width: number;
  /** Sidewalk width on each side */
  sidewalk: number;
  /** Total corridor = width + 2 * sidewalk */
  corridor: number;
  /** Surface color (hex) */
  color: number;
  /** Sidewalk color (hex) */
  sidewalkColor: number;
  /** Whether to draw lane markings */
  laneMarkings: boolean;
  /** Whether to draw crosswalks at intersections */
  crosswalks: boolean;
}

export const ROAD_STYLES: Record<string, RoadStyle> = {
  boulevard: {
    name: "Boulevard",
    width: 48,
    sidewalk: 10,
    corridor: 68,
    color: 0x444444,
    sidewalkColor: 0x888888,
    laneMarkings: true,
    crosswalks: true,
  },
  residential: {
    name: "Residential Street",
    width: 40,
    sidewalk: 8,
    corridor: 56,
    color: 0x505050,
    sidewalkColor: 0x909090,
    laneMarkings: true,
    crosswalks: true,
  },
  cobblestone: {
    name: "Cobblestone",
    width: 30,
    sidewalk: 6,
    corridor: 42,
    color: 0x8b7355,
    sidewalkColor: 0xa08060,
    laneMarkings: false,
    crosswalks: false,
  },
  gravel: {
    name: "Farm/Gravel Road",
    width: 36,
    sidewalk: 4,
    corridor: 44,
    color: 0x9b8b6b,
    sidewalkColor: 0x7a8a5a,
    laneMarkings: false,
    crosswalks: false,
  },
  trail: {
    name: "Trail/Path",
    width: 20,
    sidewalk: 0,
    corridor: 20,
    color: 0x6b5b3b,
    sidewalkColor: 0x6b5b3b,
    laneMarkings: false,
    crosswalks: false,
  },
  industrial: {
    name: "Industrial Road",
    width: 48,
    sidewalk: 10,
    corridor: 68,
    color: 0x3a3a3a,
    sidewalkColor: 0x707070,
    laneMarkings: true,
    crosswalks: true,
  },
  boardwalk: {
    name: "Boardwalk Plank",
    width: 36,
    sidewalk: 4,
    corridor: 44,
    color: 0x8b6b3b,
    sidewalkColor: 0x7b5b2b,
    laneMarkings: false,
    crosswalks: false,
  },
  dock: {
    name: "Dock Plank",
    width: 36,
    sidewalk: 4,
    corridor: 44,
    color: 0x7b5b3b,
    sidewalkColor: 0x6b4b2b,
    laneMarkings: false,
    crosswalks: false,
  },
  stone: {
    name: "Stone Path",
    width: 16,
    sidewalk: 0,
    corridor: 16,
    color: 0x808080,
    sidewalkColor: 0x808080,
    laneMarkings: false,
    crosswalks: false,
  },
};

// ── Spawn Point ──

/** Spawn point — center of downtown */
export function getSpawnPoint() {
  return { x: 5200, y: 3800 };
}
