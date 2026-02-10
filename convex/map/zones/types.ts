// convex/map/zones/types.ts
// ── Shared types for per-zone data files ──

import type { PropertyCategory, PropertySubType, ZoneId } from "../zones";

/** A fixed building placement within a zone */
export interface ZoneBuilding {
  name: string;
  category: PropertyCategory;
  subType: PropertySubType;
  x: number;
  y: number;
  width: number;
  height: number;
  maxOwners: number;
  basePrice: number;
  baseIncome: number;
  notes?: string;
}

/** A named road/street segment within a zone */
export interface ZoneRoad {
  name: string;
  /** Start point */
  x1: number;
  y1: number;
  /** End point */
  x2: number;
  y2: number;
  /** Road style key from ROAD_STYLES */
  style: string;
}

/** A decorative landmark or non-building feature */
export interface ZoneDecoration {
  name: string;
  type:
    | "fountain"
    | "bench"
    | "tree_cluster"
    | "flower_bed"
    | "statue"
    | "well"
    | "windmill"
    | "gate"
    | "square"
    | "lawn"
    | "playground"
    | "volleyball"
    | "lighthouse_deco"
    | "ferris_wheel"
    | "lamp_row"
    | "palm_cluster"
    | "lifeguard_tower"
    | "cave_entrance";
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Complete zone data export */
export interface ZoneData {
  id: ZoneId;
  buildings: ZoneBuilding[];
  roads: ZoneRoad[];
  decorations: ZoneDecoration[];
}
