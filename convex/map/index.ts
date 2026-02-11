// convex/map/index.ts
// Top-level barrel export for the entire map module.

// ─── Constants ───────────────────────────────────────────────────
export {
  MAP_SIZE,
  SELL_RATE,
  INCOME_COOLDOWN_MS,
  SHOP_INTERACT_RADIUS,
  PLAYER_HITBOX,
  ROAD_STYLES,
  getSpawnPoint,
} from "./constants";

// ─── Island Boundary ─────────────────────────────────────────────
export {
  COASTLINE_POLYGON,
  SMALL_ISLAND_POLYGON,
  isOnLand,
  isOnMainIsland,
  isOnSmallIsland,
  nearestLandPoint,
} from "./islands";

// ─── Zone Registry ───────────────────────────────────────────────
export {
  ZONES,
  ZONE_VISUALS,
  getZoneAt,
  getZoneDefAt,
  getZoneList,
  getZoneDisplayName,
} from "./zones";
export type {
  ZoneId,
  PropertyCategory,
  PropertySubType,
  ZoneVisualConfig,
  ZoneDefinition,
} from "./zones";

// ─── Water Features ──────────────────────────────────────────────
export {
  RIVER,
  LAKE,
  LAKE_CENTER,
  BRIDGES,
  isInWater,
  isInRiver,
  isInLake,
  isOnBridge,
} from "./water";

// ─── Zone Data (buildings, roads, decorations) ───────────────────
export {
  ALL_ZONE_DATA,
  getZoneData,
  getAllBuildings,
  getAllRoads,
  getAllDecorations,
} from "./zones/index";
export type {
  ZoneBuilding,
  ZoneRoad,
  ZoneDecoration,
  ZoneData,
} from "./zones/types";

// ─── Building Templates (rendering metadata) ────────────────────
export { BUILDING_TEMPLATES, getBuildingTemplate } from "./templates/buildings";
export type { BuildingTemplate } from "./templates/buildings";
