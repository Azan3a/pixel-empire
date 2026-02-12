// convex/treeConfig.ts

export const TREE_GROWTH_STAGES = {
  seedling: {
    key: "seedling",
    name: "Seedling",
    size: 6,
    woodYield: 0,
    emoji: "🌱",
    chopTimeMs: 0,
    growthTimeMs: 5 * 60 * 1000,
  },
  sapling: {
    key: "sapling",
    name: "Sapling",
    size: 10,
    woodYield: 2,
    emoji: "🪴",
    chopTimeMs: 3500,
    growthTimeMs: 10 * 60 * 1000,
  },
  young: {
    key: "young",
    name: "Young Tree",
    size: 14,
    woodYield: 4,
    emoji: "🌲",
    chopTimeMs: 5500,
    growthTimeMs: 15 * 60 * 1000,
  },
  mature: {
    key: "mature",
    name: "Mature Tree",
    size: 18,
    woodYield: 8,
    emoji: "🌳",
    chopTimeMs: 8000,
    growthTimeMs: Infinity,
  },
} as const;

export type TreeGrowthStage = keyof typeof TREE_GROWTH_STAGES;

export const TREE_GROWTH_ORDER: TreeGrowthStage[] = [
  "seedling",
  "sapling",
  "young",
  "mature",
];

export const AXE_ITEM = {
  key: "axe",
  name: "Axe",
  price: 50,
  emoji: "🪓",
  category: "tool",
  chopTimeMs: 3000,
} as const;

export const WOOD_ITEM = {
  key: "wood",
  name: "Wood",
  emoji: "🪵",
  category: "resource",
  sellPrice: 15,
} as const;

export const TREE_INTERACT_RADIUS = 80;

// Spawn rules
export const TREE_SPAWN_BUILDING_MARGIN = 40;
export const TREE_SPAWN_SPACING = 60;
export const MAX_FOREST_TREES = 80;
export const TREE_REGROW_DELAY_MS = 10 * 60 * 1000;
