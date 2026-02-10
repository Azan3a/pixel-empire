// ============================================================================
// EXTRACTED ZONE DATA — from zone design docs
// Ready for integration into convex/mapZones.ts
// ============================================================================

// ── Extended Types (supplement existing mapZones.ts types) ──

export type ExpandedZoneId =
  | "mountains" // zone 02
  | "old_town" // zone 03
  | "harbor" // zone 04
  | "park" // zone 06 (exists, needs update)
  | "commercial_strip" // zone 08
  | "farmland" // zone 09
  | "industrial" // zone 10 (exists, needs update)
  | "wetlands" // zone 11
  | "boardwalk_resort" // zone 12
  | "beach" // zone 13 (exists, needs update)
  | "small_island"; // zone 14

export type ExpandedPropertyCategory =
  | "residential"
  | "commercial"
  | "service"
  | "shop"
  | "resource"
  | "social"
  | "deco"
  | "housing" // player-rentable housing (boardwalk resort)
  | "trail";

export type ExpandedPropertySubType =
  // Existing
  | "house"
  | "duplex"
  | "apartment"
  | "corner_store"
  | "office"
  | "mall"
  | "warehouse"
  | "factory"
  | "food_shop"
  | "supply_store"
  | "clothing_store"
  | "bank"
  | "casino"
  | "police_station"
  | "ranger_station"
  // New subtypes
  | "lookout"
  | "mine"
  | "quarry"
  | "lodge"
  | "switchback_trail"
  | "museum"
  | "town_hall"
  | "clock_tower"
  | "antique_shop"
  | "bakery"
  | "tailor"
  | "herb_shop"
  | "bookstore"
  | "wine_bar"
  | "artisan_workshop"
  | "restaurant"
  | "inn_tavern"
  | "town_square"
  | "well"
  | "harbor_master"
  | "customs_house"
  | "lighthouse"
  | "fish_market"
  | "ship_supply"
  | "bait_shop"
  | "cold_storage"
  | "dry_dock"
  | "boat_rental"
  | "botanical_garden"
  | "park_cafe"
  | "bandstand"
  | "event_lawn"
  | "playground"
  | "farmers_market"
  | "electronics_store"
  | "mega_mart"
  | "furniture_outlet"
  | "auto_parts"
  | "pet_shop"
  | "wholesale_depot"
  | "sports_store"
  | "pharmacy"
  | "bank_branch"
  | "farmhouse"
  | "barn"
  | "seed_feed_store"
  | "farmhouse_kitchen"
  | "windmill"
  | "sawmill_factory"
  | "smelter_forge"
  | "food_processing"
  | "chemical_plant"
  | "shipping_hub"
  | "textile_mill"
  | "electronics_factory"
  | "recycling_center"
  | "power_station"
  | "nature_center"
  | "bird_watch_tower"
  | "luxury_hotel"
  | "resort_pool"
  | "arcade"
  | "ice_cream_stand"
  | "yacht_club_shop"
  | "beach_club"
  | "volleyball_court"
  | "beach_rental"
  | "surf_shop"
  | "island_dock"
  | "island_lighthouse";

// ── Building Definition (positioned, from design docs) ──

export interface ZoneBuildingDef {
  name: string;
  category: ExpandedPropertyCategory;
  subType: ExpandedPropertySubType;
  width: number;
  height: number;
  x: number;
  y: number;
  maxOwners: number;
  basePrice: number;
  baseIncome: number;
  notes: string;
}

// ── Road / Path Definition ──

export interface RoadDef {
  name: string;
  style:
    | "cobblestone"
    | "asphalt"
    | "gravel"
    | "boardwalk"
    | "dirt"
    | "concrete"
    | "wood_plank"
    | "stone"
    | "switchback";
  widthPx: number;
  speedMultiplier: number;
}

// ── Special Feature ──

export interface SpecialFeature {
  name: string;
  type:
    | "trail"
    | "path"
    | "dock"
    | "pier"
    | "lake"
    | "pond"
    | "fishing_spot"
    | "crop_plot"
    | "livestock_pen"
    | "herb_patch"
    | "resource_area"
    | "promenade";
  position: { x: number; y: number };
  size?: { w: number; h: number };
  notes: string;
}

// ── Full Zone Config ──

export interface ExpandedZoneConfig {
  id: ExpandedZoneId;
  name: string;
  bounds: { x1: number; y1: number; x2: number; y2: number };
  speedMultiplier: number;
  terrainColor: number;
  terrainAccent: number;
  hasRoads: boolean;
  description: string;
  buildings: ZoneBuildingDef[];
  roads: RoadDef[];
  specialFeatures: SpecialFeature[];
}

// ============================================================================
// ZONE 02: MOUNTAINS
// ============================================================================

export const ZONE_MOUNTAINS: ExpandedZoneConfig = {
  id: "mountains",
  name: "Mountains",
  bounds: { x1: 2800, y1: 400, x2: 5600, y2: 2200 },
  speedMultiplier: 0.5, // rocky path base
  terrainColor: 0x6b6b6b, // grey rock
  terrainAccent: 0x5a5a5a,
  hasRoads: false,
  description:
    "Rocky highlands with mining sites, switchback trails, and a quarry.",
  buildings: [
    {
      name: "Lookout North",
      category: "service",
      subType: "lookout",
      width: 30,
      height: 30,
      x: 3800,
      y: 600,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Scenic view, binoculars",
    },
    {
      name: "Lookout East",
      category: "service",
      subType: "lookout",
      width: 30,
      height: 30,
      x: 5200,
      y: 1500,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Scenic view, telescope",
    },
    {
      name: "Mine A",
      category: "resource",
      subType: "mine",
      width: 50,
      height: 50,
      x: 4000,
      y: 1050,
      maxOwners: 5,
      basePrice: 8000,
      baseIncome: 200,
      notes: "Iron ore + copper",
    },
    {
      name: "Mine B",
      category: "resource",
      subType: "mine",
      width: 50,
      height: 50,
      x: 4800,
      y: 2050,
      maxOwners: 5,
      basePrice: 12000,
      baseIncome: 350,
      notes: "Gold ore + gems",
    },
    {
      name: "Quarry",
      category: "service",
      subType: "quarry",
      width: 160,
      height: 100,
      x: 3800,
      y: 1700,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Stone extraction, ore processing",
    },
    {
      name: "Mountain Lodge",
      category: "service",
      subType: "lodge",
      width: 80,
      height: 60,
      x: 3400,
      y: 2050,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Rest stop, supplies, quest board",
    },
    {
      name: "West Switchback",
      category: "trail",
      subType: "switchback_trail",
      width: 0,
      height: 0,
      x: 3000,
      y: 1000,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Connects forest → mountains (y 1000→2100)",
    },
  ],
  roads: [
    {
      name: "Switchback Trail",
      style: "switchback",
      widthPx: 24,
      speedMultiplier: 0.65,
    },
    {
      name: "Ridge Trail",
      style: "switchback",
      widthPx: 24,
      speedMultiplier: 0.65,
    },
  ],
  specialFeatures: [
    {
      name: "Iron-1",
      type: "resource_area",
      position: { x: 4050, y: 1100 },
      notes: "Iron Ore, yield 2-4, respawn 3 game-days",
    },
    {
      name: "Iron-2",
      type: "resource_area",
      position: { x: 4100, y: 1250 },
      notes: "Iron Ore, yield 2-4",
    },
    {
      name: "Copper-1",
      type: "resource_area",
      position: { x: 3900, y: 1150 },
      notes: "Copper Ore, yield 1-3",
    },
    {
      name: "Gold-1",
      type: "resource_area",
      position: { x: 4850, y: 2000 },
      notes: "Gold Ore, yield 1-2",
    },
    {
      name: "Gold-2",
      type: "resource_area",
      position: { x: 4750, y: 2100 },
      notes: "Gold Ore, yield 1-2",
    },
    {
      name: "Gem-1",
      type: "resource_area",
      position: { x: 4900, y: 2080 },
      notes: "Raw Gems, yield 0-1",
    },
    {
      name: "Stone-1",
      type: "resource_area",
      position: { x: 3900, y: 1750 },
      notes: "Stone, yield 3-6",
    },
    {
      name: "Stone-2",
      type: "resource_area",
      position: { x: 4200, y: 1800 },
      notes: "Stone, yield 3-6",
    },
  ],
};

// ============================================================================
// ZONE 03: OLD TOWN
// ============================================================================

export const ZONE_OLD_TOWN: ExpandedZoneConfig = {
  id: "old_town",
  name: "Old Town",
  bounds: { x1: 5000, y1: 1400, x2: 6800, y2: 3600 },
  speedMultiplier: 1.0, // cobblestone
  terrainColor: 0x8b7d6b, // warm stone
  terrainAccent: 0x7a6c5a,
  hasRoads: true,
  description:
    "Historic district with narrow streets, a town square, and traditional shops.",
  buildings: [
    {
      name: "Museum",
      category: "service",
      subType: "museum",
      width: 100,
      height: 80,
      x: 6200,
      y: 1600,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "History exhibits, quest NPCs",
    },
    {
      name: "Town Hall",
      category: "service",
      subType: "town_hall",
      width: 100,
      height: 80,
      x: 5600,
      y: 2150,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Admin, permits, town quests",
    },
    {
      name: "Clock Tower",
      category: "service",
      subType: "clock_tower",
      width: 40,
      height: 60,
      x: 6400,
      y: 2200,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Landmark, visible from afar",
    },
    {
      name: "Antique Shop",
      category: "shop",
      subType: "antique_shop",
      width: 60,
      height: 50,
      x: 5100,
      y: 1600,
      maxOwners: 10,
      basePrice: 6000,
      baseIncome: 150,
      notes: "Rare items, collectibles",
    },
    {
      name: "Bakery",
      category: "shop",
      subType: "bakery",
      width: 50,
      height: 40,
      x: 5400,
      y: 1600,
      maxOwners: 10,
      basePrice: 4000,
      baseIncome: 100,
      notes: "Unique food (bread, pastry)",
    },
    {
      name: "Tailor",
      category: "shop",
      subType: "tailor",
      width: 50,
      height: 50,
      x: 6000,
      y: 1600,
      maxOwners: 10,
      basePrice: 5000,
      baseIncome: 120,
      notes: "Cosmetics, old-style clothing",
    },
    {
      name: "Herb Shop",
      category: "shop",
      subType: "herb_shop",
      width: 40,
      height: 40,
      x: 5100,
      y: 2200,
      maxOwners: 10,
      basePrice: 3500,
      baseIncome: 80,
      notes: "Crafting herbs, potions",
    },
    {
      name: "Bookstore",
      category: "shop",
      subType: "bookstore",
      width: 40,
      height: 50,
      x: 6000,
      y: 2200,
      maxOwners: 10,
      basePrice: 3500,
      baseIncome: 80,
      notes: "Lore books, skill manuals",
    },
    {
      name: "Wine Bar",
      category: "shop",
      subType: "wine_bar",
      width: 50,
      height: 40,
      x: 6200,
      y: 2700,
      maxOwners: 10,
      basePrice: 5000,
      baseIncome: 130,
      notes: "Premium drinks, +mood buff",
    },
    {
      name: "Artisan Workshop",
      category: "shop",
      subType: "artisan_workshop",
      width: 60,
      height: 50,
      x: 6200,
      y: 3100,
      maxOwners: 10,
      basePrice: 6000,
      baseIncome: 150,
      notes: "Handcrafted goods, furniture",
    },
    {
      name: "Traditional Restaurant",
      category: "shop",
      subType: "restaurant",
      width: 60,
      height: 50,
      x: 5100,
      y: 3400,
      maxOwners: 10,
      basePrice: 5500,
      baseIncome: 140,
      notes: "Unique meals, rare recipes",
    },
    {
      name: "Inn & Tavern",
      category: "shop",
      subType: "inn_tavern",
      width: 80,
      height: 60,
      x: 5500,
      y: 3400,
      maxOwners: 15,
      basePrice: 7000,
      baseIncome: 180,
      notes: "Rest, quests, gossip",
    },
    {
      name: "Town Square",
      category: "deco",
      subType: "town_square",
      width: 400,
      height: 300,
      x: 5100,
      y: 2600,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Events, markets, gatherings",
    },
    {
      name: "Well",
      category: "deco",
      subType: "well",
      width: 20,
      height: 20,
      x: 6400,
      y: 3450,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Decorative landmark",
    },
  ],
  roads: [
    {
      name: "Main Street",
      style: "cobblestone",
      widthPx: 30,
      speedMultiplier: 1.0,
    },
    {
      name: "Market Lane",
      style: "cobblestone",
      widthPx: 30,
      speedMultiplier: 1.0,
    },
    {
      name: "Cobblestone Streets (general)",
      style: "cobblestone",
      widthPx: 30,
      speedMultiplier: 1.0,
    },
  ],
  specialFeatures: [
    {
      name: "Fountain Plaza",
      type: "path",
      position: { x: 5400, y: 2800 },
      notes: "Decorative fountain inside Town Square",
    },
  ],
};

// ============================================================================
// ZONE 04: HARBOR
// ============================================================================

export const ZONE_HARBOR: ExpandedZoneConfig = {
  id: "harbor",
  name: "Harbor",
  bounds: { x1: 6400, y1: 2600, x2: 7600, y2: 4600 },
  speedMultiplier: 1.0,
  terrainColor: 0x7a7a6a, // dock wood/stone
  terrainAccent: 0x6a6a5a,
  hasRoads: true,
  description:
    "Bustling port with docks, a fish market, and shipping warehouses.",
  buildings: [
    {
      name: "Harbor Master",
      category: "service",
      subType: "harbor_master",
      width: 60,
      height: 50,
      x: 6500,
      y: 2800,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Shipping quests, port authority",
    },
    {
      name: "Customs House",
      category: "service",
      subType: "customs_house",
      width: 80,
      height: 60,
      x: 6800,
      y: 2800,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Import/export, trade licenses",
    },
    {
      name: "Lighthouse",
      category: "service",
      subType: "lighthouse",
      width: 40,
      height: 80,
      x: 7200,
      y: 2900,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Landmark, visible across map",
    },
    {
      name: "Fish Market",
      category: "shop",
      subType: "fish_market",
      width: 100,
      height: 60,
      x: 6500,
      y: 3350,
      maxOwners: 15,
      basePrice: 6000,
      baseIncome: 160,
      notes: "Sell fish, buy seafood",
    },
    {
      name: "Ship Supply",
      category: "shop",
      subType: "ship_supply",
      width: 60,
      height: 50,
      x: 6900,
      y: 3350,
      maxOwners: 10,
      basePrice: 5000,
      baseIncome: 120,
      notes: "Rope, nets, fishing rods, bait",
    },
    {
      name: "Bait Shop",
      category: "shop",
      subType: "bait_shop",
      width: 30,
      height: 30,
      x: 7200,
      y: 3500,
      maxOwners: 5,
      basePrice: 2000,
      baseIncome: 60,
      notes: "Bait, lures (on the pier)",
    },
    {
      name: "Warehouse A",
      category: "commercial",
      subType: "warehouse",
      width: 80,
      height: 60,
      x: 6500,
      y: 3950,
      maxOwners: 10,
      basePrice: 6000,
      baseIncome: 150,
      notes: "Storage, shipping goods",
    },
    {
      name: "Warehouse B",
      category: "commercial",
      subType: "warehouse",
      width: 80,
      height: 60,
      x: 6900,
      y: 3950,
      maxOwners: 10,
      basePrice: 6000,
      baseIncome: 150,
      notes: "Storage, bulk cargo",
    },
    {
      name: "Cold Storage",
      category: "commercial",
      subType: "cold_storage",
      width: 60,
      height: 50,
      x: 7200,
      y: 3950,
      maxOwners: 10,
      basePrice: 7000,
      baseIncome: 170,
      notes: "Refrigerated fish/food storage",
    },
    {
      name: "Dry Dock",
      category: "service",
      subType: "dry_dock",
      width: 100,
      height: 70,
      x: 6500,
      y: 4400,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Boat repair, future boat purchase",
    },
    {
      name: "Boat Rental",
      category: "service",
      subType: "boat_rental",
      width: 50,
      height: 40,
      x: 7000,
      y: 4400,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Rent boats for island/fishing",
    },
  ],
  roads: [
    {
      name: "Dock Road",
      style: "wood_plank",
      widthPx: 36,
      speedMultiplier: 1.0,
    },
    {
      name: "Warehouse Row",
      style: "wood_plank",
      widthPx: 36,
      speedMultiplier: 1.0,
    },
  ],
  specialFeatures: [
    {
      name: "Pier",
      type: "pier",
      position: { x: 7200, y: 3350 },
      size: { w: 200, h: 300 },
      notes: "Extends over water, bait shop on pier",
    },
    {
      name: "Pier-1",
      type: "fishing_spot",
      position: { x: 7300, y: 3400 },
      notes: "Cod, Mackerel — Common",
    },
    {
      name: "Pier-2",
      type: "fishing_spot",
      position: { x: 7350, y: 3500 },
      notes: "Tuna, Swordfish — Uncommon",
    },
    {
      name: "Pier-3",
      type: "fishing_spot",
      position: { x: 7300, y: 3600 },
      notes: "Lobster, Crab — Rare",
    },
    {
      name: "Dock-N",
      type: "fishing_spot",
      position: { x: 7500, y: 3000 },
      notes: "Cod, Herring — Common",
    },
    {
      name: "Dock-S",
      type: "fishing_spot",
      position: { x: 7500, y: 4000 },
      notes: "Salmon, Trout — Uncommon",
    },
    {
      name: "Deep-1",
      type: "fishing_spot",
      position: { x: 7500, y: 3500 },
      notes: "Shark, Marlin — Legendary",
    },
  ],
};

// ============================================================================
// ZONE 06: PARK
// ============================================================================

export const ZONE_PARK: ExpandedZoneConfig = {
  id: "park",
  name: "Park",
  bounds: { x1: 2000, y1: 2600, x2: 4200, y2: 4400 },
  speedMultiplier: 0.9, // grass/path base
  terrainColor: 0x3a9a3a, // green
  terrainAccent: 0x2d8a2d,
  hasRoads: false,
  description:
    "Green sanctuary with a central lake, event lawn, botanical gardens, and meandering paths.",
  buildings: [
    {
      name: "Botanical Garden",
      category: "service",
      subType: "botanical_garden",
      width: 120,
      height: 80,
      x: 2600,
      y: 2900,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Rare herb gathering, seasonal plants",
    },
    {
      name: "Park Café",
      category: "shop",
      subType: "park_cafe",
      width: 50,
      height: 40,
      x: 2200,
      y: 3800,
      maxOwners: 10,
      basePrice: 3000,
      baseIncome: 80,
      notes: "Snacks, drinks, picnic baskets",
    },
    {
      name: "Boat Rental",
      category: "service",
      subType: "boat_rental",
      width: 30,
      height: 30,
      x: 3200,
      y: 3800,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Rent rowboat for lake fishing",
    },
    {
      name: "Bandstand",
      category: "service",
      subType: "bandstand",
      width: 40,
      height: 40,
      x: 2600,
      y: 4200,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Live music events, gatherings",
    },
    {
      name: "Event Lawn",
      category: "deco",
      subType: "event_lawn",
      width: 200,
      height: 150,
      x: 2600,
      y: 3400,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Festivals, markets, seasonal events",
    },
    {
      name: "Playground",
      category: "deco",
      subType: "playground",
      width: 80,
      height: 60,
      x: 3800,
      y: 4050,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Decorative, family area",
    },
  ],
  roads: [
    { name: "North Path", style: "stone", widthPx: 20, speedMultiplier: 1.0 },
    { name: "South Path", style: "stone", widthPx: 20, speedMultiplier: 1.0 },
    { name: "West Path", style: "stone", widthPx: 20, speedMultiplier: 1.0 },
    { name: "East Path", style: "stone", widthPx: 20, speedMultiplier: 1.0 },
    { name: "Lake Loop", style: "stone", widthPx: 20, speedMultiplier: 1.0 },
  ],
  specialFeatures: [
    {
      name: "Central Lake",
      type: "lake",
      position: { x: 3400, y: 3500 },
      size: { w: 600, h: 400 },
      notes: "Elliptical lake, fishing from shores",
    },
    {
      name: "Lake-N",
      type: "fishing_spot",
      position: { x: 3400, y: 3250 },
      notes: "Trout, Bass — Common",
    },
    {
      name: "Lake-E",
      type: "fishing_spot",
      position: { x: 3650, y: 3500 },
      notes: "Pike, Catfish — Uncommon",
    },
    {
      name: "Lake-S",
      type: "fishing_spot",
      position: { x: 3400, y: 3750 },
      notes: "Golden Carp — Rare",
    },
    {
      name: "Lake-W",
      type: "fishing_spot",
      position: { x: 3100, y: 3500 },
      notes: "Perch, Bluegill — Common",
    },
    {
      name: "Flower Bed",
      type: "path",
      position: { x: 3800, y: 3100 },
      notes: "Decorative flower beds",
    },
  ],
};

// ============================================================================
// ZONE 08: COMMERCIAL STRIP
// ============================================================================

export const ZONE_COMMERCIAL_STRIP: ExpandedZoneConfig = {
  id: "commercial_strip",
  name: "Commercial Strip",
  bounds: { x1: 3400, y1: 4200, x2: 5400, y2: 5400 },
  speedMultiplier: 1.0,
  terrainColor: 0x6a6a6a, // pavement grey
  terrainAccent: 0x5a5a5a,
  hasRoads: true,
  description:
    "A long connector zone between Downtown, Suburbs, Industrial, and Farmland. Dense retail.",
  buildings: [
    {
      name: "Farmer's Market",
      category: "shop",
      subType: "farmers_market",
      width: 80,
      height: 60,
      x: 3500,
      y: 4350,
      maxOwners: 15,
      basePrice: 5000,
      baseIncome: 120,
      notes: "Sell crops, buy produce, seasonal stock",
    },
    {
      name: "Electronics Store",
      category: "shop",
      subType: "electronics_store",
      width: 60,
      height: 50,
      x: 3900,
      y: 4350,
      maxOwners: 10,
      basePrice: 7000,
      baseIncome: 180,
      notes: "Gadgets, phones, future tech items",
    },
    {
      name: "Mega Mart",
      category: "shop",
      subType: "mega_mart",
      width: 100,
      height: 70,
      x: 4200,
      y: 4350,
      maxOwners: 20,
      basePrice: 10000,
      baseIncome: 250,
      notes: "General store, wide selection",
    },
    {
      name: "Furniture Outlet",
      category: "shop",
      subType: "furniture_outlet",
      width: 80,
      height: 60,
      x: 4700,
      y: 4350,
      maxOwners: 10,
      basePrice: 7000,
      baseIncome: 170,
      notes: "Buy furniture (crafted from wood)",
    },
    {
      name: "Auto Parts",
      category: "shop",
      subType: "auto_parts",
      width: 50,
      height: 40,
      x: 5100,
      y: 4350,
      maxOwners: 10,
      basePrice: 4000,
      baseIncome: 100,
      notes: "Vehicle parts, tools",
    },
    {
      name: "Pet Shop",
      category: "shop",
      subType: "pet_shop",
      width: 50,
      height: 40,
      x: 3500,
      y: 4950,
      maxOwners: 10,
      basePrice: 4000,
      baseIncome: 90,
      notes: "Pets, animal supplies (future)",
    },
    {
      name: "Wholesale Depot",
      category: "commercial",
      subType: "wholesale_depot",
      width: 120,
      height: 80,
      x: 3800,
      y: 4950,
      maxOwners: 15,
      basePrice: 10000,
      baseIncome: 250,
      notes: "Bulk goods, supply chain hub",
    },
    {
      name: "Sports Store",
      category: "shop",
      subType: "sports_store",
      width: 60,
      height: 50,
      x: 4400,
      y: 4950,
      maxOwners: 10,
      basePrice: 5000,
      baseIncome: 120,
      notes: "Equipment, camping gear",
    },
    {
      name: "Pharmacy",
      category: "shop",
      subType: "pharmacy",
      width: 50,
      height: 40,
      x: 4800,
      y: 4950,
      maxOwners: 10,
      basePrice: 4000,
      baseIncome: 100,
      notes: "Medicine, health items",
    },
    {
      name: "Bank Branch",
      category: "service",
      subType: "bank_branch",
      width: 50,
      height: 40,
      x: 5100,
      y: 4950,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Satellite bank, basic transactions",
    },
  ],
  roads: [
    {
      name: "Market Boulevard",
      style: "asphalt",
      widthPx: 48,
      speedMultiplier: 1.0,
    },
    { name: "Trade Road", style: "asphalt", widthPx: 48, speedMultiplier: 1.0 },
  ],
  specialFeatures: [],
};

// ============================================================================
// ZONE 09: FARMLAND
// ============================================================================

export const ZONE_FARMLAND: ExpandedZoneConfig = {
  id: "farmland",
  name: "Farmland",
  bounds: { x1: 600, y1: 5400, x2: 3800, y2: 7000 },
  speedMultiplier: 0.85, // dirt path base
  terrainColor: 0x7a9a4a, // green-brown
  terrainAccent: 0x6a8a3d,
  hasRoads: true,
  description:
    "Rolling fields with crop plots, barns, livestock pens, and a farmer's market.",
  buildings: [
    {
      name: "Farmhouse #1",
      category: "residential",
      subType: "farmhouse",
      width: 50,
      height: 50,
      x: 700,
      y: 5600,
      maxOwners: 5,
      basePrice: 2000,
      baseIncome: 20,
      notes: "Farmer's home",
    },
    {
      name: "Farmhouse #2",
      category: "residential",
      subType: "farmhouse",
      width: 50,
      height: 50,
      x: 3400,
      y: 6800,
      maxOwners: 5,
      basePrice: 2000,
      baseIncome: 20,
      notes: "Farmer's home",
    },
    {
      name: "Barn A",
      category: "commercial",
      subType: "barn",
      width: 80,
      height: 60,
      x: 700,
      y: 6150,
      maxOwners: 10,
      basePrice: 5000,
      baseIncome: 120,
      notes: "Animal storage, milk/eggs",
    },
    {
      name: "Barn B",
      category: "commercial",
      subType: "barn",
      width: 80,
      height: 60,
      x: 3200,
      y: 6150,
      maxOwners: 10,
      basePrice: 5000,
      baseIncome: 120,
      notes: "Hay, tool storage, seasonal produce",
    },
    {
      name: "Seed & Feed Store",
      category: "shop",
      subType: "seed_feed_store",
      width: 60,
      height: 50,
      x: 3200,
      y: 5650,
      maxOwners: 10,
      basePrice: 4000,
      baseIncome: 100,
      notes: "Buy seeds, fertilizer, animal feed",
    },
    {
      name: "Farmhouse Kitchen",
      category: "shop",
      subType: "farmhouse_kitchen",
      width: 100,
      height: 70,
      x: 1400,
      y: 6750,
      maxOwners: 10,
      basePrice: 6000,
      baseIncome: 160,
      notes: "Cook raw produce into meals, sell",
    },
    {
      name: "Windmill",
      category: "deco",
      subType: "windmill",
      width: 40,
      height: 40,
      x: 2600,
      y: 6750,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Landmark, grain processing (future)",
    },
  ],
  roads: [
    {
      name: "Farm Road North",
      style: "gravel",
      widthPx: 36,
      speedMultiplier: 0.85,
    },
    {
      name: "Farm Road Mid",
      style: "gravel",
      widthPx: 36,
      speedMultiplier: 0.85,
    },
    {
      name: "Farm Road South",
      style: "gravel",
      widthPx: 36,
      speedMultiplier: 0.85,
    },
  ],
  specialFeatures: [
    {
      name: "Wheat Field",
      type: "crop_plot",
      position: { x: 1200, y: 5700 },
      size: { w: 400, h: 250 },
      notes: "Wheat, Barley, Oats — 3 game-days",
    },
    {
      name: "Corn Field",
      type: "crop_plot",
      position: { x: 2200, y: 5700 },
      size: { w: 400, h: 250 },
      notes: "Corn, Sunflower — 4 game-days",
    },
    {
      name: "Tomato Field",
      type: "crop_plot",
      position: { x: 1200, y: 6250 },
      size: { w: 300, h: 200 },
      notes: "Tomato, Pepper, Squash — 2 game-days",
    },
    {
      name: "Potato Field",
      type: "crop_plot",
      position: { x: 1800, y: 6250 },
      size: { w: 300, h: 200 },
      notes: "Potato, Turnip, Onion — 3 game-days",
    },
    {
      name: "Carrot Field",
      type: "crop_plot",
      position: { x: 2400, y: 6250 },
      size: { w: 300, h: 200 },
      notes: "Carrot, Beet, Radish — 2 game-days",
    },
    {
      name: "Herb Garden",
      type: "crop_plot",
      position: { x: 2200, y: 6800 },
      size: { w: 300, h: 200 },
      notes: "Basil, Thyme, Rosemary — 1 game-day",
    },
    {
      name: "Livestock Pens",
      type: "livestock_pen",
      position: { x: 800, y: 6750 },
      size: { w: 400, h: 200 },
      notes: "Cows (milk), Sheep (wool), Pigs (truffle), Chickens (eggs)",
    },
  ],
};

// ============================================================================
// ZONE 10: INDUSTRIAL
// ============================================================================

export const ZONE_INDUSTRIAL: ExpandedZoneConfig = {
  id: "industrial",
  name: "Industrial District",
  bounds: { x1: 4600, y1: 4600, x2: 6800, y2: 6600 },
  speedMultiplier: 1.0,
  terrainColor: 0x5a6a4a, // concrete grey-green
  terrainAccent: 0x4a5a3d,
  hasRoads: true,
  description:
    "Factories, warehouses, and processing plants. The crafting hub of the island.",
  buildings: [
    {
      name: "Sawmill Factory",
      category: "commercial",
      subType: "sawmill_factory",
      width: 140,
      height: 100,
      x: 4700,
      y: 4800,
      maxOwners: 25,
      basePrice: 15000,
      baseIncome: 400,
      notes: "Wood → Planks → Furniture",
    },
    {
      name: "Smelter & Forge",
      category: "commercial",
      subType: "smelter_forge",
      width: 120,
      height: 100,
      x: 5100,
      y: 4800,
      maxOwners: 25,
      basePrice: 15000,
      baseIncome: 400,
      notes: "Ore → Ingots → Tools/Weapons",
    },
    {
      name: "Food Processing",
      category: "commercial",
      subType: "food_processing",
      width: 140,
      height: 100,
      x: 5500,
      y: 4800,
      maxOwners: 25,
      basePrice: 14000,
      baseIncome: 380,
      notes: "Crops/Fish → Meals/Sushi",
    },
    {
      name: "Chemical Plant",
      category: "commercial",
      subType: "chemical_plant",
      width: 100,
      height: 80,
      x: 6200,
      y: 4800,
      maxOwners: 20,
      basePrice: 12000,
      baseIncome: 350,
      notes: "Herbs → Potions/Medicine",
    },
    {
      name: "Warehouse C",
      category: "commercial",
      subType: "warehouse",
      width: 80,
      height: 60,
      x: 4700,
      y: 5450,
      maxOwners: 10,
      basePrice: 6000,
      baseIncome: 150,
      notes: "General storage",
    },
    {
      name: "Warehouse D",
      category: "commercial",
      subType: "warehouse",
      width: 80,
      height: 60,
      x: 5000,
      y: 5450,
      maxOwners: 10,
      basePrice: 6000,
      baseIncome: 150,
      notes: "Raw materials depot",
    },
    {
      name: "Warehouse E",
      category: "commercial",
      subType: "warehouse",
      width: 80,
      height: 60,
      x: 5300,
      y: 5450,
      maxOwners: 10,
      basePrice: 6000,
      baseIncome: 150,
      notes: "Finished goods",
    },
    {
      name: "Warehouse F",
      category: "commercial",
      subType: "warehouse",
      width: 80,
      height: 60,
      x: 5600,
      y: 5450,
      maxOwners: 10,
      basePrice: 7000,
      baseIncome: 170,
      notes: "Cold storage (fish, produce)",
    },
    {
      name: "Shipping Hub",
      category: "service",
      subType: "shipping_hub",
      width: 120,
      height: 80,
      x: 6000,
      y: 5450,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Central dispatch, delivery bonuses",
    },
    {
      name: "Textile Mill",
      category: "commercial",
      subType: "textile_mill",
      width: 120,
      height: 80,
      x: 4700,
      y: 6050,
      maxOwners: 20,
      basePrice: 12000,
      baseIncome: 320,
      notes: "Wool → Cloth → Clothing",
    },
    {
      name: "Electronics Factory",
      category: "commercial",
      subType: "electronics_factory",
      width: 120,
      height: 100,
      x: 5200,
      y: 6050,
      maxOwners: 25,
      basePrice: 15000,
      baseIncome: 400,
      notes: "Ore → Circuits → Gadgets",
    },
    {
      name: "Recycling Center",
      category: "service",
      subType: "recycling_center",
      width: 80,
      height: 60,
      x: 5700,
      y: 6050,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Salvage items, reclaim materials",
    },
    {
      name: "Power Station",
      category: "service",
      subType: "power_station",
      width: 100,
      height: 80,
      x: 6100,
      y: 6050,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Landmark, zone power source",
    },
  ],
  roads: [
    {
      name: "Factory Row North",
      style: "concrete",
      widthPx: 48,
      speedMultiplier: 1.0,
    },
    {
      name: "Logistics Avenue",
      style: "concrete",
      widthPx: 48,
      speedMultiplier: 1.0,
    },
    {
      name: "Industrial South",
      style: "concrete",
      widthPx: 48,
      speedMultiplier: 1.0,
    },
  ],
  specialFeatures: [],
};

// ============================================================================
// ZONE 11: WETLANDS
// ============================================================================

export const ZONE_WETLANDS: ExpandedZoneConfig = {
  id: "wetlands",
  name: "Wetlands",
  bounds: { x1: 5600, y1: 5800, x2: 7400, y2: 7200 },
  speedMultiplier: 0.6, // marsh vegetation base
  terrainColor: 0x3a6a3a, // dark marshy green
  terrainAccent: 0x2a5a2a,
  hasRoads: false,
  description:
    "Marshy nature reserve with rare fishing, herbs, and wildlife. Treacherous terrain.",
  buildings: [
    {
      name: "Nature Center",
      category: "service",
      subType: "nature_center",
      width: 80,
      height: 60,
      x: 5900,
      y: 6200,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Research station, herb identification, nature quests",
    },
    {
      name: "Bird Watch Tower",
      category: "service",
      subType: "bird_watch_tower",
      width: 30,
      height: 30,
      x: 7000,
      y: 6750,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Binoculars, rare bird sightings, achievement",
    },
  ],
  roads: [
    {
      name: "Boardwalk Trail",
      style: "boardwalk",
      widthPx: 20,
      speedMultiplier: 0.9,
    },
  ],
  specialFeatures: [
    {
      name: "Pond A",
      type: "pond",
      position: { x: 6400, y: 6300 },
      size: { w: 200, h: 150 },
      notes: "Mudfish, Eel, Frog — Common-Rare, respawn 1 day",
    },
    {
      name: "Pond B",
      type: "pond",
      position: { x: 6600, y: 6950 },
      size: { w: 150, h: 100 },
      notes: "Swamp Bass, Snapper — Uncommon-Legendary, respawn 2 days",
    },
    {
      name: "Herb Patch A",
      type: "herb_patch",
      position: { x: 5900, y: 6750 },
      size: { w: 200, h: 100 },
      notes: "Moonpetal, Swamproot — Rare, 2 game-days",
    },
    {
      name: "Herb Patch B",
      type: "herb_patch",
      position: { x: 6000, y: 7000 },
      size: { w: 150, h: 80 },
      notes: "Glowmoss, Marshbloom — Epic, 3 game-days",
    },
    {
      name: "Pond-A-N",
      type: "fishing_spot",
      position: { x: 6400, y: 6230 },
      notes: "Mudfish, Catfish — Common",
    },
    {
      name: "Pond-A-S",
      type: "fishing_spot",
      position: { x: 6400, y: 6430 },
      notes: "Electric Eel — Rare",
    },
    {
      name: "Pond-A-E",
      type: "fishing_spot",
      position: { x: 6520, y: 6300 },
      notes: "Giant Frog (bait) — Uncommon",
    },
    {
      name: "Pond-B-W",
      type: "fishing_spot",
      position: { x: 6530, y: 6950 },
      notes: "Swamp Bass — Uncommon",
    },
    {
      name: "Pond-B-E",
      type: "fishing_spot",
      position: { x: 6720, y: 6950 },
      notes: "Golden Snapper — Legendary",
    },
  ],
};

// ============================================================================
// ZONE 12: BOARDWALK & RESORT
// ============================================================================

export const ZONE_BOARDWALK_RESORT: ExpandedZoneConfig = {
  id: "boardwalk_resort",
  name: "Boardwalk & Resort",
  bounds: { x1: 7400, y1: 2000, x2: 8200, y2: 4200 },
  speedMultiplier: 1.0,
  terrainColor: 0xb89a6a, // warm wood/sand
  terrainAccent: 0xa88a5a,
  hasRoads: false,
  description:
    "High-end vacation destination, arcade, luxury hotels, and tourist trap shops.",
  buildings: [
    {
      name: "Luxury Hotel A",
      category: "housing",
      subType: "luxury_hotel",
      width: 120,
      height: 150,
      x: 7450,
      y: 2350,
      maxOwners: 50,
      basePrice: 20000,
      baseIncome: 500,
      notes: "Player apartment rental, high cost",
    },
    {
      name: "Casino",
      category: "service",
      subType: "casino",
      width: 100,
      height: 120,
      x: 7600,
      y: 2550,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Mini-games, currency exchange",
    },
    {
      name: "Resort Pool",
      category: "social",
      subType: "resort_pool",
      width: 150,
      height: 100,
      x: 7550,
      y: 3250,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Energy recovery area, NPC hub",
    },
    {
      name: "Luxury Hotel B",
      category: "housing",
      subType: "luxury_hotel",
      width: 120,
      height: 150,
      x: 7450,
      y: 3750,
      maxOwners: 50,
      basePrice: 22000,
      baseIncome: 550,
      notes: "Player apartment rental, ocean view",
    },
    {
      name: "Arcade (Pier A)",
      category: "service",
      subType: "arcade",
      width: 80,
      height: 60,
      x: 7600,
      y: 2100,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Games, ticket exchange",
    },
    {
      name: "Ice Cream Stand",
      category: "shop",
      subType: "ice_cream_stand",
      width: 30,
      height: 30,
      x: 7850,
      y: 2500,
      maxOwners: 5,
      basePrice: 2000,
      baseIncome: 60,
      notes: "Energy items",
    },
    {
      name: "Yacht Club Shop",
      category: "shop",
      subType: "yacht_club_shop",
      width: 50,
      height: 50,
      x: 7800,
      y: 4000,
      maxOwners: 10,
      basePrice: 8000,
      baseIncome: 200,
      notes: "Luxury goods, fishing tackle",
    },
  ],
  roads: [
    {
      name: "Boardwalk Promenade",
      style: "wood_plank",
      widthPx: 36,
      speedMultiplier: 1.1,
    },
  ],
  specialFeatures: [
    {
      name: "Pier A",
      type: "pier",
      position: { x: 7600, y: 2100 },
      size: { w: 400, h: 200 },
      notes: "Arcade, food stalls",
    },
    {
      name: "Pier B",
      type: "pier",
      position: { x: 7600, y: 3900 },
      size: { w: 400, h: 200 },
      notes: "Fishing, yachts",
    },
    {
      name: "Spot-A",
      type: "fishing_spot",
      position: { x: 8100, y: 2250 },
      notes: "Sea Bass, Flounder — Common-Uncommon",
    },
    {
      name: "Spot-B",
      type: "fishing_spot",
      position: { x: 8050, y: 3000 },
      notes: "Tuna, Marlin — Uncommon-Rare",
    },
    {
      name: "Spot-C",
      type: "fishing_spot",
      position: { x: 8100, y: 4050 },
      notes: "Shark, Sailfish — Rare-Legendary",
    },
    {
      name: "Promenade",
      type: "promenade",
      position: { x: 7750, y: 2300 },
      size: { w: 36, h: 1800 },
      notes: "Main walkway along coast, 1.1× speed",
    },
  ],
};

// ============================================================================
// ZONE 13: BEACH
// ============================================================================

export const ZONE_BEACH: ExpandedZoneConfig = {
  id: "beach",
  name: "Beach",
  bounds: { x1: 7400, y1: 4200, x2: 8200, y2: 7200 },
  speedMultiplier: 0.8, // sand
  terrainColor: 0xd4b483, // sand
  terrainAccent: 0xc4a473,
  hasRoads: false,
  description:
    "Sandy shore, beach clubs, volleyball courts, and coastal gathering.",
  buildings: [
    {
      name: "Beach Club",
      category: "service",
      subType: "beach_club",
      width: 100,
      height: 80,
      x: 7500,
      y: 4450,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Music, drinks, energy recovery",
    },
    {
      name: "Volleyball Court A",
      category: "social",
      subType: "volleyball_court",
      width: 50,
      height: 30,
      x: 7700,
      y: 5000,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Mini-game spot",
    },
    {
      name: "Beach Rental",
      category: "shop",
      subType: "beach_rental",
      width: 40,
      height: 40,
      x: 7500,
      y: 5450,
      maxOwners: 5,
      basePrice: 2000,
      baseIncome: 60,
      notes: "Rent boards, umbrellas, towels",
    },
    {
      name: "Volleyball Court B",
      category: "social",
      subType: "volleyball_court",
      width: 50,
      height: 30,
      x: 7700,
      y: 5850,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Mini-game spot",
    },
    {
      name: "Surf Shop",
      category: "shop",
      subType: "surf_shop",
      width: 60,
      height: 50,
      x: 7420,
      y: 6250,
      maxOwners: 10,
      basePrice: 4000,
      baseIncome: 100,
      notes: "Cosmetics and surfboards",
    },
  ],
  roads: [],
  specialFeatures: [
    {
      name: "Sandcastle Area",
      type: "resource_area",
      position: { x: 7800, y: 4500 },
      notes: "Common Shells — daily spawn",
    },
    {
      name: "Shell Collection",
      type: "resource_area",
      position: { x: 7600, y: 6300 },
      notes: "Rare Shells, Starfish — daily spawn",
    },
  ],
};

// ============================================================================
// ZONE 14: SMALL ISLAND
// ============================================================================

export const ZONE_SMALL_ISLAND: ExpandedZoneConfig = {
  id: "small_island",
  name: "Small Island",
  bounds: { x1: 8200, y1: 6000, x2: 9000, y2: 7200 },
  speedMultiplier: 0.8,
  terrainColor: 0xc4a473, // beach sand
  terrainAccent: 0xb49463,
  hasRoads: false,
  description:
    "Remote secret island, lighthouse, and hidden treasure location. Accessible only by boat.",
  buildings: [
    {
      name: "Lighthouse",
      category: "service",
      subType: "island_lighthouse",
      width: 60,
      height: 60,
      x: 8600,
      y: 6700,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Map reveal, secret basement, view",
    },
    {
      name: "Island Dock",
      category: "service",
      subType: "island_dock",
      width: 40,
      height: 20,
      x: 8500,
      y: 6100,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Boat landing point",
    },
  ],
  roads: [
    { name: "Stone Paths", style: "stone", widthPx: 16, speedMultiplier: 0.9 },
  ],
  specialFeatures: [
    {
      name: "Secret Cache",
      type: "resource_area",
      position: { x: 8450, y: 6950 },
      notes: "Gold Coins, Relic — Unique, one-time",
    },
    {
      name: "Tropical Palms",
      type: "resource_area",
      position: { x: 8850, y: 7100 },
      notes: "Tropical Wood — Rare",
    },
    {
      name: "Island Dock",
      type: "dock",
      position: { x: 8500, y: 6100 },
      size: { w: 40, h: 20 },
      notes: "Boat access from Harbor/Boardwalk",
    },
  ],
};

// ============================================================================
// MASTER LOOKUP
// ============================================================================

export const ALL_EXPANDED_ZONES: Record<ExpandedZoneId, ExpandedZoneConfig> = {
  mountains: ZONE_MOUNTAINS,
  old_town: ZONE_OLD_TOWN,
  harbor: ZONE_HARBOR,
  park: ZONE_PARK,
  commercial_strip: ZONE_COMMERCIAL_STRIP,
  farmland: ZONE_FARMLAND,
  industrial: ZONE_INDUSTRIAL,
  wetlands: ZONE_WETLANDS,
  boardwalk_resort: ZONE_BOARDWALK_RESORT,
  beach: ZONE_BEACH,
  small_island: ZONE_SMALL_ISLAND,
};

// ============================================================================
// SUMMARY STATS
// ============================================================================
//
// Total buildings across all 11 zones: 81
//
// By zone:
//   Mountains ........... 7  (2 service, 2 resource, 1 trail, 1 quarry service, 1 lodge service)
//   Old Town ........... 14  (3 service, 9 shop, 2 deco)
//   Harbor ............. 11  (4 service, 3 shop, 3 commercial, 1 service)
//   Park ................ 6  (3 service, 1 shop, 2 deco)
//   Commercial Strip ... 10  (1 service, 8 shop, 1 commercial)
//   Farmland ............ 7  (2 residential, 2 commercial, 2 shop, 1 deco)
//   Industrial ......... 13  (3 service, 10 commercial)
//   Wetlands ............ 2  (2 service)
//   Boardwalk Resort .... 7  (2 housing, 3 service, 1 social, 2 shop) — wait, 7
//   Beach ............... 5  (1 service, 2 social, 2 shop)
//   Small Island ........ 2  (2 service)
//
// Road styles used:
//   cobblestone (Old Town) — 30px
//   asphalt (Commercial Strip) — 48px
//   gravel (Farmland) — 36px
//   concrete (Industrial) — 48px
//   wood_plank (Harbor, Boardwalk Resort) — 36px
//   boardwalk (Wetlands) — 20px
//   stone (Park, Small Island) — 16-20px
//   switchback (Mountains) — 24px
//
// Speed multipliers:
//   1.1× — Boardwalk Promenade
//   1.0× — Old Town, Harbor, Commercial Strip, Industrial, Boardwalk Resort
//   0.9× — Park paths, Wetlands boardwalk, Island stone paths
//   0.85× — Farmland dirt
//   0.8× — Beach sand, Wetlands raised path, Small Island
//   0.7× — Farmland crop fields (when planted)
//   0.65× — Mountain switchback trails
//   0.6× — Wetlands marsh vegetation
//   0.5× — Mountain rocky path
//
