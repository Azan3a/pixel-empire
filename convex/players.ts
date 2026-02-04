import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getOrCreatePlayer = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingPlayer) {
      // Update last seen
      await ctx.db.patch(existingPlayer._id, { lastSeen: Date.now() });
      return existingPlayer;
    }

    const user = await ctx.db.get(userId);
    const playerName =
      user?.name || "Player " + Math.floor(Math.random() * 10000);
    const avatar = "avatar" + (Math.floor(Math.random() * 4) + 1);

    const playerId = await ctx.db.insert("players", {
      userId,
      name: playerName,
      x: 400, // Default spawn
      y: 300,
      gold: 500, // Starting money
      avatar,
      lastSeen: Date.now(),
    });

    // Initialize inventory for new player
    await ctx.db.insert("inventory", { playerId, item: "wood", quantity: 0 });
    await ctx.db.insert("inventory", { playerId, item: "stone", quantity: 0 });
    await ctx.db.insert("inventory", { playerId, item: "ore", quantity: 0 });

    return await ctx.db.get(playerId);
  },
});

export const updatePosition = mutation({
  args: { x: v.number(), y: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!player) throw new Error("Player not found");

    // Basic server-side validation (e.g., prevent jumping too far)
    // For now, just trust the client for movement but we could add speed checks here
    await ctx.db.patch(player._id, {
      x: args.x,
      y: args.y,
      lastSeen: Date.now(),
    });
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("players")
      .order("desc")
      // In a real app we'd index by gold, but for MVP scanning is fine if small
      .take(10);
  },
});

export const getAlivePlayers = query({
  args: {},
  handler: async (ctx) => {
    // Only return players active in the last 10 seconds
    const threshold = Date.now() - 10000;
    return await ctx.db
      .query("players")
      .filter((q) => q.gt(q.field("lastSeen"), threshold))
      .collect();
  },
});

export const getPlayerInfo = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!player) return null;

    // Calculate rank
    const allPlayers = await ctx.db.query("players").collect();
    const sorted = allPlayers.sort((a, b) => b.gold - a.gold);
    const rank = sorted.findIndex((p) => p._id === player._id) + 1;
    const total = allPlayers.length;

    const inventory = await ctx.db
      .query("inventory")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .collect();

    return { ...player, inventory, rank, total };
  },
});
