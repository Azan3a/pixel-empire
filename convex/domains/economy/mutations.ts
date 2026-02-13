import { ConvexError } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { HUNGER_PER_WORK } from "../../foodConfig";
import { processIncomeCollection } from "./helpers";

export const collectIncome = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const { totalIncome, propertiesCollected } = await processIncomeCollection(
      ctx,
      player,
    );

    if (totalIncome === 0) {
      throw new ConvexError(
        "No income ready to collect yet. Check back later!",
      );
    }

    return {
      totalIncome,
      propertiesCollected,
      newBalance: player.cash + totalIncome,
    };
  },
});

export const workJob = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const hunger = player.hunger ?? 100;
    if (hunger <= 0) {
      throw new ConvexError("You're too hungry to work! Buy some food first.");
    }

    const wage = 50;
    const newHunger = Math.max(0, hunger - HUNGER_PER_WORK);

    await ctx.db.patch(player._id, {
      cash: player.cash + wage,
      hunger: newHunger,
    });

    return { earned: wage, newBalance: player.cash + wage, hunger: newHunger };
  },
});
