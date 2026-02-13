import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { SELL_RATE } from "../../config/gameConstants";

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

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new ConvexError("Property not found");

    if (property.maxOwners === 0) {
      throw new ConvexError(
        "This building is a public service and cannot be purchased.",
      );
    }

    const existingOwnership = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_player_property", (q) =>
        q.eq("playerId", player._id).eq("propertyId", args.propertyId),
      )
      .first();

    if (existingOwnership) {
      throw new ConvexError("You already own this property.");
    }

    const currentOwners = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    if (currentOwners.length >= property.maxOwners) {
      throw new ConvexError(
        "This property has reached its maximum number of owners.",
      );
    }

    if (player.cash < property.price) {
      throw new ConvexError("Insufficient cash");
    }

    await ctx.db.patch(player._id, { cash: player.cash - property.price });

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

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new ConvexError("Property not found");

    const ownership = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_player_property", (q) =>
        q.eq("playerId", player._id).eq("propertyId", args.propertyId),
      )
      .first();

    if (!ownership) {
      throw new ConvexError("You don't own this property.");
    }

    const sellPrice = Math.round(property.price * SELL_RATE);

    await ctx.db.patch(player._id, { cash: player.cash + sellPrice });
    await ctx.db.delete(ownership._id);

    return {
      sold: property.name,
      sellPrice,
      newBalance: player.cash + sellPrice,
    };
  },
});
