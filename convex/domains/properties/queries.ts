import { query } from "../../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getProperties = query({
  args: {},
  handler: async (ctx) => {
    const properties = await ctx.db.query("properties").collect();

    const userId = await getAuthUserId(ctx);
    const playerOwnershipMap: Map<string, number> = new Map();
    const ownerCountMap: Map<string, number> = new Map();

    const allOwnership = await ctx.db.query("propertyOwnership").collect();
    for (const ownership of allOwnership) {
      const key = ownership.propertyId as string;
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
        for (const ownership of myOwnership) {
          playerOwnershipMap.set(
            ownership.propertyId as string,
            ownership.totalEarned ?? 0,
          );
        }
      }
    }

    return properties.map((property) => ({
      ...property,
      isOwned: playerOwnershipMap.has(property._id as string),
      ownerCount: ownerCountMap.get(property._id as string) ?? 0,
      totalEarned: playerOwnershipMap.get(property._id as string),
    }));
  },
});
