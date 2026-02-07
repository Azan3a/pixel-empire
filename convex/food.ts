// convex/food.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { FOOD_ITEMS, FoodType, MAX_HUNGER } from "./foodConfig";

export const buyFood = mutation({
  args: { foodType: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");

    const food = FOOD_ITEMS[args.foodType as FoodType];
    if (!food) throw new Error("Unknown food type");

    const currentHunger = player.hunger ?? MAX_HUNGER;

    if (currentHunger >= MAX_HUNGER) {
      throw new Error("You're already full!");
    }

    if (player.cash < food.price) {
      throw new Error(`Not enough cash. Need $${food.price}`);
    }

    const newHunger = Math.min(MAX_HUNGER, currentHunger + food.hunger);
    const restored = newHunger - currentHunger;

    await ctx.db.patch(player._id, {
      cash: player.cash - food.price,
      hunger: newHunger,
    });

    return {
      food: food.name,
      emoji: food.emoji,
      hungerRestored: restored,
      newHunger,
      newCash: player.cash - food.price,
    };
  },
});
