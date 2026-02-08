// convex/food.ts
import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { FOOD_ITEMS, FoodType, MAX_HUNGER } from "./foodConfig";

export const buyFood = mutation({
  args: { foodType: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const food = FOOD_ITEMS[args.foodType as FoodType];
    if (!food) throw new ConvexError("Unknown food type");

    if (player.cash < food.price) {
      throw new ConvexError(`Not enough cash. Need $${food.price}`);
    }

    // Deduct cash
    await ctx.db.patch(player._id, {
      cash: player.cash - food.price,
    });

    // Add to inventory (or increment quantity)
    const existing = await ctx.db
      .query("inventory")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .filter((q) => q.eq(q.field("item"), food.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + 1,
      });
    } else {
      await ctx.db.insert("inventory", {
        playerId: player._id,
        item: food.key,
        quantity: 1,
      });
    }

    return {
      food: food.name,
      emoji: food.emoji,
      newCash: player.cash - food.price,
    };
  },
});

export const consumeFood = mutation({
  args: { foodType: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const food = FOOD_ITEMS[args.foodType as FoodType];
    if (!food) throw new ConvexError("Unknown food type");

    const currentHunger = player.hunger ?? MAX_HUNGER;

    if (currentHunger >= MAX_HUNGER) {
      throw new ConvexError("You're already full!");
    }

    // Check inventory
    const invItem = await ctx.db
      .query("inventory")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .filter((q) => q.eq(q.field("item"), food.key))
      .first();

    if (!invItem || invItem.quantity <= 0) {
      throw new ConvexError(`You don't have any ${food.name} to eat!`);
    }

    // Consume from inventory
    if (invItem.quantity === 1) {
      await ctx.db.delete(invItem._id);
    } else {
      await ctx.db.patch(invItem._id, {
        quantity: invItem.quantity - 1,
      });
    }

    // Restore hunger
    const newHunger = Math.min(MAX_HUNGER, currentHunger + food.hunger);
    const restored = newHunger - currentHunger;

    await ctx.db.patch(player._id, {
      hunger: newHunger,
    });

    return {
      food: food.name,
      emoji: food.emoji,
      hungerRestored: restored,
      newHunger,
    };
  },
});
