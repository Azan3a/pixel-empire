// convex/domains/jobs/queries.ts

import { query } from "../../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAvailableJobs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .take(15);
  },
});

export const getActiveJob = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) return null;

    const accepted = await ctx.db
      .query("jobs")
      .withIndex("by_player_status", (q) =>
        q.eq("playerId", player._id).eq("status", "accepted"),
      )
      .first();
    if (accepted) return accepted;

    const pickedUp = await ctx.db
      .query("jobs")
      .withIndex("by_player_status", (q) =>
        q.eq("playerId", player._id).eq("status", "picked_up"),
      )
      .first();
    return pickedUp ?? null;
  },
});
