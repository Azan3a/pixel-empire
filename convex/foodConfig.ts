// convex/foodConfig.ts
export const FOOD_ITEMS = {
  apple: {
    key: "apple",
    name: "Apple",
    price: 10,
    hunger: 15,
    emoji: "🍎",
    category: "food",
  },
  burger: {
    key: "burger",
    name: "Burger",
    price: 25,
    hunger: 35,
    emoji: "🍔",
    category: "food",
  },
  pizza: {
    key: "pizza",
    name: "Pizza",
    price: 40,
    hunger: 60,
    emoji: "🍕",
    category: "food",
  },
  meal: {
    key: "meal",
    name: "Full Meal",
    price: 75,
    hunger: 100,
    emoji: "🍽️",
    category: "food",
  },
} as const;

export type FoodType = keyof typeof FOOD_ITEMS;

export const FOOD_LIST = Object.values(FOOD_ITEMS);

// All consumable item keys (for checking if an inventory item is food)
export const FOOD_KEYS = new Set(Object.keys(FOOD_ITEMS));
export const MAX_FOOD_INVENTORY = 10;

export const MAX_HUNGER = 100;
export const HUNGER_WALK_THRESHOLD = 800;
export const HUNGER_PER_DELIVERY = 5;
export const HUNGER_PER_WORK = 3;
export const HUNGER_SLOW_THRESHOLD = 25;
