// components/game/viewport/world/property/buildingPalettes.ts

import type { PropertyCategory, PropertySubType } from "@/convex/mapZones";

export interface BuildingPalette {
  wall: number;
  wallLight: number;
  roof: number;
  roofAccent: number;
  window: number;
  windowLit: number;
  windowFrame: number;
  awning: number;
  door: number;
  doorFrame: number;
  accent: number;
  trim: number;
}

const BASE_PALETTES: Record<PropertyCategory, BuildingPalette> = {
  residential: {
    wall: 0xc4a882,
    wallLight: 0xd4b892,
    roof: 0x8b4513,
    roofAccent: 0x6b3410,
    window: 0x88bbdd,
    windowLit: 0xffcc44,
    windowFrame: 0x5a4a3a,
    awning: 0x8b6b4a,
    door: 0x5c3a1a,
    doorFrame: 0x4a2a0a,
    accent: 0x8b6b4a,
    trim: 0xd4c4a4,
  },
  commercial: {
    wall: 0x6a8aaa,
    wallLight: 0x7a9aba,
    roof: 0x4a6a8a,
    roofAccent: 0x3a5a7a,
    window: 0x88ccff,
    windowLit: 0xffdd66,
    windowFrame: 0x3a4a5a,
    awning: 0xcc3333,
    door: 0x3a5a7a,
    doorFrame: 0x2a4a6a,
    accent: 0x4a6fa5,
    trim: 0x8aaaca,
  },
  shop: {
    wall: 0xd4c4a4,
    wallLight: 0xe4d4b4,
    roof: 0x7a6a5a,
    roofAccent: 0x6a5a4a,
    window: 0xddeecc,
    windowLit: 0xffaa55,
    windowFrame: 0x4a4a3a,
    awning: 0xaa4444,
    door: 0x5a4a3a,
    doorFrame: 0x4a3a2a,
    accent: 0x9b59b6,
    trim: 0xc4b494,
  },
  service: {
    wall: 0x8a8a8a,
    wallLight: 0x9a9a9a,
    roof: 0x6a6a6a,
    roofAccent: 0x5a5a5a,
    window: 0xaabbcc,
    windowLit: 0xffeebb,
    windowFrame: 0x4a4a4a,
    awning: 0xbba030,
    door: 0x4a4a4a,
    doorFrame: 0x3a3a3a,
    accent: 0xd4a017,
    trim: 0x7a7a7a,
  },
};

export const SUBTYPE_OVERRIDES: Partial<
  Record<PropertySubType, Partial<BuildingPalette>>
> = {
  house: {
    wall: 0xc4a882,
    roof: 0x994433,
    roofAccent: 0x773322,
    trim: 0xeeddcc,
  },
  duplex: {
    wall: 0xb8a080,
    wallLight: 0xc8b090,
    roof: 0x7a6a5a,
    trim: 0xd4c4a4,
  },
  apartment: {
    wall: 0x9a8a7a,
    wallLight: 0xaa9a8a,
    roof: 0x5a5a5a,
    window: 0x99bbdd,
    trim: 0x7a7a7a,
  },
  corner_store: {
    wall: 0xd4c090,
    awning: 0xcc4444,
    accent: 0xcc4444,
  },
  office: {
    wall: 0x5a7a9a,
    wallLight: 0x6a8aaa,
    window: 0x99ddff,
    roof: 0x3a5a7a,
    trim: 0x4a6a8a,
  },
  mall: {
    wall: 0xe4d4c4,
    wallLight: 0xf4e4d4,
    roof: 0x8a7a6a,
    awning: 0xdd5555,
    accent: 0xdd5555,
    trim: 0xaa9a8a,
  },
  warehouse: {
    wall: 0x7a7a6a,
    wallLight: 0x8a8a7a,
    roof: 0x5a5a4a,
    roofAccent: 0x4a4a3a,
    trim: 0x6a6a5a,
  },
  factory: {
    wall: 0x6a6a5a,
    wallLight: 0x7a7a6a,
    roof: 0x4a4a3a,
    roofAccent: 0x3a3a2a,
    accent: 0xaa6622,
    trim: 0x5a5a4a,
  },
  food_shop: {
    wall: 0xf0e0c0,
    awning: 0xe67e22,
    accent: 0xe67e22,
    door: 0x7a5a3a,
  },
  supply_store: {
    wall: 0xd4d0c0,
    awning: 0x27ae60,
    accent: 0x27ae60,
    door: 0x5a6a4a,
  },
  clothing_store: {
    wall: 0xf0e4e8,
    wallLight: 0xfff0f4,
    awning: 0xe91e63,
    accent: 0xe91e63,
    door: 0x6a4a5a,
  },
  bank: {
    wall: 0xd4d0c4,
    wallLight: 0xe4e0d4,
    roof: 0x8a8a7a,
    accent: 0xd4af37,
    trim: 0xc4c0b4,
    door: 0x5a5a4a,
  },
  casino: {
    wall: 0x2a1a3a,
    wallLight: 0x3a2a4a,
    roof: 0x1a0a2a,
    accent: 0xff2266,
    trim: 0xffdd00,
    window: 0xff88aa,
    windowLit: 0xff4488,
  },
  police_station: {
    wall: 0x5a6a7a,
    wallLight: 0x6a7a8a,
    roof: 0x3a4a5a,
    accent: 0x3b82f6,
    trim: 0x4a5a6a,
  },
  ranger_station: {
    wall: 0x6a7a5a,
    wallLight: 0x7a8a6a,
    roof: 0x4a5a3a,
    accent: 0x2d8a2d,
    trim: 0x5a6a4a,
    door: 0x4a3a2a,
  },
};

export function resolvePalette(
  category: PropertyCategory,
  subType: PropertySubType,
): BuildingPalette {
  const base = BASE_PALETTES[category];
  const overrides = SUBTYPE_OVERRIDES[subType] ?? {};
  return { ...base, ...overrides };
}
