import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getResources = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("world_nodes").collect();
  },
});

export const collectResource = mutation({
  args: { nodeId: v.id("world_nodes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");

    const node = await ctx.db.get(args.nodeId);
    if (!node || (node.respawnAt && node.respawnAt > Date.now())) {
      throw new Error("Resource not available");
    }

    // Proximity check (simplified: must be within 50 units)
    const dist = Math.sqrt(
      Math.pow(player.x - node.x, 2) + Math.pow(player.y - node.y, 2),
    );
    if (dist > 60) {
      throw new Error("Too far from resource");
    }

    // Decrease health or collect immediately
    const newHealth = node.health - 1;
    if (newHealth <= 0) {
      // Node depleted
      await ctx.db.patch(args.nodeId, {
        health: 0,
        respawnAt: Date.now() + 30000, // Respawn in 30 seconds
      });

      // Add to inventory
      const itemMap: Record<string, string> = {
        tree: "wood",
        rock: "stone",
        ore_deposit: "ore",
      };
      const item = itemMap[node.type] || "wood";

      const invItem = await ctx.db
        .query("inventory")
        .withIndex("by_player", (q) => q.eq("playerId", player._id))
        .filter((q) => q.eq(q.field("item"), item))
        .unique();

      if (invItem) {
        await ctx.db.patch(invItem._id, { quantity: invItem.quantity + 1 });
      } else {
        await ctx.db.insert("inventory", {
          playerId: player._id,
          item,
          quantity: 1,
        });
      }

      return { success: true, depleted: true };
    } else {
      await ctx.db.patch(args.nodeId, { health: newHealth });
      return { success: true, depleted: false };
    }
  },
});

export const sellResource = mutation({
  args: { item: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");

    const prices: Record<string, number> = { wood: 5, stone: 10, ore: 25 };
    const price = prices[args.item] || 0;

    const invItem = await ctx.db
      .query("inventory")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .filter((q) => q.eq(q.field("item"), args.item))
      .unique();

    if (!invItem || invItem.quantity < args.amount) {
      throw new Error("Not enough items");
    }

    await ctx.db.patch(invItem._id, {
      quantity: invItem.quantity - args.amount,
    });
    await ctx.db.patch(player._id, { gold: player.gold + price * args.amount });
  },
});

export const seedResources = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("world_nodes").first();
    if (existing) return "Already seeded";

    const types = ["tree", "rock", "ore_deposit"];
    for (let i = 0; i < 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      await ctx.db.insert("world_nodes", {
        type,
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        health: type === "tree" ? 3 : 5,
        respawnAt: undefined,
      });
    }
  },
});
