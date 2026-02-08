// components/game/viewport/world/property/buildingPalettes.ts

import type { PropertyCategory, PropertySubType } from "@/convex/mapZones";

export interface BuildingPalette {
  wall: number;
  roof: number;
  window: number;
  windowLit: number;
  awning: number;
  door: number;
  accent: number;
}

export const PALETTES: Record<PropertyCategory, BuildingPalette> = {
  residential: {
    wall: 0x8b6b4a,
    roof: 0xa0784a,
    window: 0xffee88,
    windowLit: 0xffcc44,
    awning: 0x8b6b4a,
    door: 0x5c3a1a,
    accent: 0x8b6b4a,
  },
  commercial: {
    wall: 0x4a6fa5,
    roof: 0x5a82b5,
    window: 0x88ccff,
    windowLit: 0xffdd66,
    awning: 0xcc3333,
    door: 0x3a3a3a,
    accent: 0x4a6fa5,
  },
  shop: {
    wall: 0x6a5a8a,
    roof: 0x7a6a9a,
    window: 0xddccff,
    windowLit: 0xffaa55,
    awning: 0xaa44aa,
    door: 0x4a3a5a,
    accent: 0x9b59b6,
  },
  service: {
    wall: 0x8a8a6a,
    roof: 0x9a9a7a,
    window: 0xccddaa,
    windowLit: 0xffeebb,
    awning: 0xbba030,
    door: 0x4a4a3a,
    accent: 0xd4a017,
  },
};

export const SUBTYPE_ACCENTS: Partial<
  Record<PropertySubType, { wall?: number; accent?: number; awning?: number }>
> = {
  bank: { wall: 0x7a7a6a, accent: 0xd4af37, awning: 0xd4af37 },
  casino: { wall: 0x3a1a4a, accent: 0xff2266, awning: 0xff2266 },
  police_station: { wall: 0x3a4a6a, accent: 0x3b82f6, awning: 0x3b82f6 },
  ranger_station: { wall: 0x4a5a3a, accent: 0x2d8a2d, awning: 0x2d8a2d },
  warehouse: { wall: 0x6a6a5a, accent: 0x8a8a7a },
  factory: { wall: 0x5a5a4a, accent: 0x7a7a6a },
  food_shop: { awning: 0xe67e22 },
  clothing_store: { awning: 0xe91e63 },
  supply_store: { awning: 0x27ae60 },
};

/**
 * Resolve the final palette for a given category and sub-type.
 */
export function resolvePalette(
  category: PropertyCategory,
  subType: PropertySubType,
): BuildingPalette {
  const basePalette = PALETTES[category];
  const overrides = SUBTYPE_ACCENTS[subType] ?? {};
  return { ...basePalette, ...overrides };
}
