// convex/properties.ts
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { SELL_RATE } from "./gameConstants";

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
