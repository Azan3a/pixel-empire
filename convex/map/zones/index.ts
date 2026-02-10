// convex/map/zones/index.ts
// Barrel export for all 14 zone data modules.

export { default as forest } from "./forest";
export { default as mountains } from "./mountains";
export { default as oldtown } from "./oldtown";
export { default as harbor } from "./harbor";
export { default as downtown } from "./downtown";
export { default as park } from "./park";
export { default as suburbs } from "./suburbs";
export { default as commercial } from "./commercial";
export { default as farmland } from "./farmland";
export { default as industrial } from "./industrial";
export { default as wetlands } from "./wetlands";
export { default as boardwalk } from "./boardwalk";
export { default as beach } from "./beach";
export { default as smallisland } from "./smallisland";

export type { ZoneBuilding, ZoneRoad, ZoneDecoration, ZoneData } from "./types";

import type { ZoneData } from "./types";
import type { ZoneId } from "../zones";

import forest from "./forest";
import mountains from "./mountains";
import oldtown from "./oldtown";
import harbor from "./harbor";
import downtown from "./downtown";
import park from "./park";
import suburbs from "./suburbs";
import commercial from "./commercial";
import farmland from "./farmland";
import industrial from "./industrial";
import wetlands from "./wetlands";
import boardwalk from "./boardwalk";
import beach from "./beach";
import smallisland from "./smallisland";

/** All zone data modules keyed by ZoneId */
export const ALL_ZONE_DATA: Record<ZoneId, ZoneData> = {
  forest,
  mountains,
  oldtown,
  harbor,
  downtown,
  park,
  suburbs,
  commercial,
  farmland,
  industrial,
  wetlands,
  boardwalk,
  beach,
  smallisland,
};

/** Get the zone data for a specific zone */
export function getZoneData(zoneId: ZoneId): ZoneData {
  return ALL_ZONE_DATA[zoneId];
}

/** Get a flat array of every building across all zones */
export function getAllBuildings() {
  return Object.values(ALL_ZONE_DATA).flatMap((z) => z.buildings);
}

/** Get a flat array of every road segment across all zones */
export function getAllRoads() {
  return Object.values(ALL_ZONE_DATA).flatMap((z) => z.roads);
}

/** Get a flat array of every decoration across all zones */
export function getAllDecorations() {
  return Object.values(ALL_ZONE_DATA).flatMap((z) => z.decorations);
}
