import { query } from "../../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { MAX_HUNGER } from "../../config/foodConfig";

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    return players.sort((a, b) => b.cash - a.cash).slice(0, 10);
  },
});

export const getAlivePlayers = query({
  args: {},
  handler: async (ctx) => {
    const threshold = Date.now() - 10000;
    const players = await ctx.db
      .query("players")
      .filter((q) => q.gt(q.field("lastSeen"), threshold))
      .collect();

    return players.map((p) => ({
      ...p,
      equippedClothing: p.equippedClothing ?? {},
    }));
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

    const allPlayers = await ctx.db.query("players").collect();
    const sorted = allPlayers.sort((a, b) => b.cash - a.cash);
    const rank = sorted.findIndex((p) => p._id === player._id) + 1;
    const total = allPlayers.length;

    const inventory = await ctx.db
      .query("inventory")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .collect();

    const ownerships = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .collect();

    return {
      ...player,
      hunger: player.hunger ?? MAX_HUNGER,
      walkDistance: player.walkDistance ?? 0,
      equippedClothing: player.equippedClothing ?? {},
      inventory,
      rank,
      total,
      ownedPropertyCount: ownerships.length,
    };
  },
});
