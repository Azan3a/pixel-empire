// convex/foodConfig.ts
export const FOOD_ITEMS = {
  apple: { key: "apple", name: "Apple", price: 10, hunger: 15, emoji: "🍎" },
  burger: { key: "burger", name: "Burger", price: 25, hunger: 35, emoji: "🍔" },
  pizza: { key: "pizza", name: "Pizza", price: 40, hunger: 60, emoji: "🍕" },
  meal: { key: "meal", name: "Full Meal", price: 75, hunger: 100, emoji: "🍽️" },
} as const;

export type FoodType = keyof typeof FOOD_ITEMS;

export const FOOD_LIST = Object.values(FOOD_ITEMS);

// Hunger constants
export const MAX_HUNGER = 100;
export const HUNGER_WALK_THRESHOLD = 800; // units of distance per 1 hunger point
export const HUNGER_PER_DELIVERY = 5;
export const HUNGER_PER_WORK = 3;
export const HUNGER_SLOW_THRESHOLD = 25; // below this, speed starts decreasing
