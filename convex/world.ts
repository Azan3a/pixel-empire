// convex/world.ts
import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { SELL_RATE, INCOME_COOLDOWN_MS } from "./map/constants";
import { HUNGER_PER_WORK } from "./foodConfig";
import { seedProperties } from "./map/generate/properties";
import { wipeGameState } from "./map/generate/reset";

// ── City Initialization (fixed map — reads zone data files) ──

export const initCity = mutation({
  args: {},
  handler: async (ctx) => {
    // Only seed if the properties table is empty
    const existing = await ctx.db.query("properties").first();
    if (existing) return;

    const count = await seedProperties(ctx);
    console.log(`[initCity] Seeded ${count} properties from zone data`);
  },
});

// ── Full World Reset (wipe + re-seed) ──

export const resetWorld = mutation({
  args: {},
  handler: async (ctx) => {
    await wipeGameState(ctx);
    const count = await seedProperties(ctx);
    console.log(
      `[resetWorld] Wiped game state and re-seeded ${count} properties`,
    );
    return { propertiesSeeded: count };
  },
});

// ── Queries ──

export const getProperties = query({
  args: {},
  handler: async (ctx) => {
    const properties = await ctx.db.query("properties").collect();

    // Get current user's ownership info
    const userId = await getAuthUserId(ctx);
    const playerOwnershipMap: Map<string, number> = new Map();
    const ownerCountMap: Map<string, number> = new Map();

    // Build owner counts for all properties
    const allOwnership = await ctx.db.query("propertyOwnership").collect();
    for (const o of allOwnership) {
      const key = o.propertyId as string;
      ownerCountMap.set(key, (ownerCountMap.get(key) ?? 0) + 1);
    }

    if (userId) {
      const player = await ctx.db
        .query("players")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      if (player) {
        const myOwnership = await ctx.db
          .query("propertyOwnership")
          .withIndex("by_player", (q) => q.eq("playerId", player._id))
          .collect();
        for (const o of myOwnership) {
          playerOwnershipMap.set(o.propertyId as string, o.totalEarned ?? 0);
        }
      }
    }

    return properties.map((p) => ({
      ...p,
      isOwned: playerOwnershipMap.has(p._id as string),
      ownerCount: ownerCountMap.get(p._id as string) ?? 0,
      totalEarned: playerOwnershipMap.get(p._id as string),
    }));
  },
});

// ── Buy Property (instanced ownership) ──

export const buyProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const prop = await ctx.db.get(args.propertyId);
    if (!prop) throw new ConvexError("Property not found");

    // Service buildings cannot be owned
    if (prop.maxOwners === 0) {
      throw new ConvexError(
        "This building is a public service and cannot be purchased.",
      );
    }

    // Check if player already owns this property
    const existingOwnership = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_player_property", (q) =>
        q.eq("playerId", player._id).eq("propertyId", args.propertyId),
      )
      .first();

    if (existingOwnership) {
      throw new ConvexError("You already own this property.");
    }

    // Check max owners
    const currentOwners = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    if (currentOwners.length >= prop.maxOwners) {
      throw new ConvexError(
        "This property has reached its maximum number of owners.",
      );
    }

    // Check cash
    if (player.cash < prop.price) {
      throw new ConvexError("Insufficient cash");
    }

    // Deduct cash and create ownership
    await ctx.db.patch(player._id, { cash: player.cash - prop.price });

    const now = Date.now();
    await ctx.db.insert("propertyOwnership", {
      propertyId: args.propertyId,
      playerId: player._id,
      level: 1,
      purchasedAt: now,
      lastCollectedAt: now,
      totalEarned: 0,
    });
  },
});

// ── Sell Property (instanced ownership) ──

export const sellProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const prop = await ctx.db.get(args.propertyId);
    if (!prop) throw new ConvexError("Property not found");

    // Find player's ownership record
    const ownership = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_player_property", (q) =>
        q.eq("playerId", player._id).eq("propertyId", args.propertyId),
      )
      .first();

    if (!ownership) {
      throw new ConvexError("You don't own this property.");
    }

    const sellPrice = Math.round(prop.price * SELL_RATE);

    // Refund cash and remove ownership
    await ctx.db.patch(player._id, { cash: player.cash + sellPrice });
    await ctx.db.delete(ownership._id);

    return { sold: prop.name, sellPrice, newBalance: player.cash + sellPrice };
  },
});

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
