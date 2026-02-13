// app/(protected)/game/shared/contracts/game-config.ts

import {
  MAP_SIZE,
  TILE_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
  ROAD_CORRIDOR,
  HALF_CORRIDOR,
  BUILDING_PAD,
  SELL_RATE,
  INCOME_COOLDOWN_MS,
  SHOP_INTERACT_RADIUS,
  getSpawnPoint,
} from "@/convex/config/gameConstants";

import {
  ZONES,
  ZONE_VISUALS,
  getZoneAt,
  WATER_LINE_Y,
  BOARDWALK_Y,
  BOARDWALK_HEIGHT,
  type ZoneId,
  type PropertyCategory,
  type PropertySubType,
} from "@/convex/config/mapZones";

import {
  TREE_GROWTH_STAGES,
  TREE_GROWTH_ORDER,
  AXE_ITEM,
  WOOD_ITEM,
  TREE_INTERACT_RADIUS,
  type TreeGrowthStage,
} from "@/convex/config/treeConfig";

import {
  FOOD_ITEMS,
  FOOD_LIST,
  FOOD_KEYS,
  MAX_FOOD_INVENTORY,
  MAX_HUNGER,
  HUNGER_WALK_THRESHOLD,
  HUNGER_PER_DELIVERY,
  HUNGER_PER_WORK,
  HUNGER_SLOW_THRESHOLD,
  type FoodType,
} from "@/convex/config/foodConfig";

import {
  CLOTHING_ITEMS,
  CLOTHING_LIST,
  CLOTHING_KEYS,
  CLOTHING_BY_SLOT,
  SLOT_LABELS,
  type ClothingType,
  type ClothingSlot,
} from "@/convex/config/clothingConfig";

// Re-exporting these as the official "Contract" for the game UI
// This allows us to change the backend implementation without breaking the UI imports,
// as long as we keep this contract file updated.

export const GameConfig = {
  // Constants
  MAP_SIZE,
  TILE_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
  ROAD_CORRIDOR,
  HALF_CORRIDOR,
  BUILDING_PAD,
  SELL_RATE,
  INCOME_COOLDOWN_MS,
  SHOP_INTERACT_RADIUS,

  // World/Zones
  ZONES,
  ZONE_VISUALS,
  WATER_LINE_Y,
  BOARDWALK_Y,
  BOARDWALK_HEIGHT,

  // Trees
  TREE_GROWTH_STAGES,
  TREE_GROWTH_ORDER,
  AXE_ITEM,
  WOOD_ITEM,
  TREE_INTERACT_RADIUS,

  // Food
  FOOD_ITEMS,
  FOOD_LIST,
  FOOD_KEYS,
  MAX_FOOD_INVENTORY,
  MAX_HUNGER,
  HUNGER_WALK_THRESHOLD,
  HUNGER_PER_DELIVERY,
  HUNGER_PER_WORK,
  HUNGER_SLOW_THRESHOLD,

  // Clothing
  CLOTHING_ITEMS,
  CLOTHING_LIST,
  CLOTHING_KEYS,
  CLOTHING_BY_SLOT,
  SLOT_LABELS,
};

// Functions
export { getSpawnPoint, getZoneAt };

// Named exports (preferred for new imports)
export {
  MAP_SIZE,
  TILE_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
  ROAD_CORRIDOR,
  HALF_CORRIDOR,
  BUILDING_PAD,
  SELL_RATE,
  INCOME_COOLDOWN_MS,
  SHOP_INTERACT_RADIUS,
  ZONES,
  ZONE_VISUALS,
  WATER_LINE_Y,
  BOARDWALK_Y,
  BOARDWALK_HEIGHT,
  TREE_GROWTH_STAGES,
  TREE_GROWTH_ORDER,
  AXE_ITEM,
  WOOD_ITEM,
  TREE_INTERACT_RADIUS,
  FOOD_ITEMS,
  FOOD_LIST,
  FOOD_KEYS,
  MAX_FOOD_INVENTORY,
  MAX_HUNGER,
  HUNGER_WALK_THRESHOLD,
  HUNGER_PER_DELIVERY,
  HUNGER_PER_WORK,
  HUNGER_SLOW_THRESHOLD,
  CLOTHING_ITEMS,
  CLOTHING_LIST,
  CLOTHING_KEYS,
  CLOTHING_BY_SLOT,
  SLOT_LABELS,
};

// Types
export type {
  ZoneId,
  PropertyCategory,
  PropertySubType,
  TreeGrowthStage,
  FoodType,
  ClothingType,
  ClothingSlot,
};
