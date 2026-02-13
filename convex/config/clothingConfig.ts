// convex/clothingConfig.ts

export type ClothingSlot = "hat" | "shirt" | "pants" | "shoes";

export const CLOTHING_ITEMS = {
  // ── Hats ──
  red_cap: {
    key: "red_cap",
    name: "Red Cap",
    price: 50,
    emoji: "🧢",
    slot: "hat" as ClothingSlot,
    color: 0xcc3333,
  },
  blue_beanie: {
    key: "blue_beanie",
    name: "Blue Beanie",
    price: 60,
    emoji: "🎩",
    slot: "hat" as ClothingSlot,
    color: 0x3366cc,
  },

  // ── Shirts ──
  red_tshirt: {
    key: "red_tshirt",
    name: "Red T-Shirt",
    price: 40,
    emoji: "👕",
    slot: "shirt" as ClothingSlot,
    color: 0xdd4444,
  },
  blue_tshirt: {
    key: "blue_tshirt",
    name: "Blue T-Shirt",
    price: 40,
    emoji: "👕",
    slot: "shirt" as ClothingSlot,
    color: 0x4488dd,
  },
  gold_jacket: {
    key: "gold_jacket",
    name: "Gold Jacket",
    price: 120,
    emoji: "🧥",
    slot: "shirt" as ClothingSlot,
    color: 0xdaa520,
  },

  // ── Pants ──
  dark_jeans: {
    key: "dark_jeans",
    name: "Dark Jeans",
    price: 45,
    emoji: "👖",
    slot: "pants" as ClothingSlot,
    color: 0x2a2a55,
  },
  khaki_pants: {
    key: "khaki_pants",
    name: "Khaki Pants",
    price: 50,
    emoji: "👖",
    slot: "pants" as ClothingSlot,
    color: 0xc3a86b,
  },
  red_shorts: {
    key: "red_shorts",
    name: "Red Shorts",
    price: 35,
    emoji: "🩳",
    slot: "pants" as ClothingSlot,
    color: 0xcc4444,
  },

  // ── Shoes ──
  white_sneakers: {
    key: "white_sneakers",
    name: "White Sneakers",
    price: 55,
    emoji: "👟",
    slot: "shoes" as ClothingSlot,
    color: 0xeeeeee,
  },
  brown_boots: {
    key: "brown_boots",
    name: "Brown Boots",
    price: 70,
    emoji: "🥾",
    slot: "shoes" as ClothingSlot,
    color: 0x8b5e3c,
  },
} as const;

export type ClothingType = keyof typeof CLOTHING_ITEMS;

export const CLOTHING_LIST = Object.values(CLOTHING_ITEMS);

export const CLOTHING_KEYS = new Set(Object.keys(CLOTHING_ITEMS));

/** Items grouped by slot for UI rendering */
export const CLOTHING_BY_SLOT = CLOTHING_LIST.reduce(
  (acc, item) => {
    acc[item.slot].push(item);
    return acc;
  },
  {
    hat: [],
    shirt: [],
    pants: [],
    shoes: [],
  } as Record<ClothingSlot, (typeof CLOTHING_LIST)[number][]>,
);

export const SLOT_LABELS: Record<
  ClothingSlot,
  { label: string; emoji: string }
> = {
  hat: { label: "Hats", emoji: "🎩" },
  shirt: { label: "Shirts", emoji: "👕" },
  pants: { label: "Pants", emoji: "👖" },
  shoes: { label: "Shoes", emoji: "👟" },
};
