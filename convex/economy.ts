// convex/economy.ts
import { ConvexError } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { INCOME_COOLDOWN_MS } from "./gameConstants";
import { HUNGER_PER_WORK } from "./foodConfig";

// ── Collect Income Helper ──

export async function processIncomeCollection(
  ctx: MutationCtx,
  player: Doc<"players">,
): Promise<{ totalIncome: number; propertiesCollected: number }> {
  const ownerships = await ctx.db
    .query("propertyOwnership")
    .withIndex("by_player", (q) => q.eq("playerId", player._id))
    .collect();

  if (ownerships.length === 0) {
    return { totalIncome: 0, propertiesCollected: 0 };
  }

  const now = Date.now();
  let totalIncome = 0;
  let propertiesCollected = 0;

  for (const ownership of ownerships) {
    // Check cooldown
    const elapsed = now - ownership.lastCollectedAt;
    if (elapsed < INCOME_COOLDOWN_MS) continue;

    // How many full cycles have passed
    const cycles = Math.floor(elapsed / INCOME_COOLDOWN_MS);
    if (cycles === 0) continue;

    const prop = await ctx.db.get(ownership.propertyId);
    if (!prop) continue;

    // Income scales with ownership level
    const incomePerCycle = Math.round(prop.income * ownership.level);
    const earned = incomePerCycle * cycles;

    totalIncome += earned;
    propertiesCollected++;

    // Update last collected time (snap to cycle boundaries to avoid drift)
    await ctx.db.patch(ownership._id, {
      lastCollectedAt: ownership.lastCollectedAt + cycles * INCOME_COOLDOWN_MS,
      totalEarned: (ownership.totalEarned ?? 0) + earned,
    });
  }

  if (totalIncome > 0) {
    await ctx.db.patch(player._id, { cash: player.cash + totalIncome });
  }

  return { totalIncome, propertiesCollected };
}

// ── Collect Income ──

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

// ── Work Job (unchanged fallback income) ──

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
