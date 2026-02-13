// convex/domains/jobs/maintenance.ts

import { mutation, internalMutation } from "../../_generated/server";
import { JOB_TIMEOUT } from "./constants";
import { spawnJobsInternalLogic } from "./generation";

export const spawnJobs = mutation({
  args: {},
  handler: async (ctx) => {
    await spawnJobsInternalLogic(ctx);
  },
});

export const spawnJobsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    await spawnJobsInternalLogic(ctx);
  },
});

export const cleanupStaleJobs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const staleThreshold = now - JOB_TIMEOUT;

    // Find accepted jobs that are stale
    const staleAccepted = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "accepted"))
      .filter((q) => q.lt(q.field("acceptedAt"), staleThreshold))
      .collect();

    // Find picked_up jobs that are stale
    const stalePickedUp = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "picked_up"))
      .filter((q) => q.lt(q.field("pickedUpAt"), staleThreshold))
      .collect();

    const allStale = [...staleAccepted, ...stalePickedUp];

    for (const job of allStale) {
      await ctx.db.patch(job._id, {
        status: "available",
        playerId: undefined,
        acceptedAt: undefined,
        pickedUpAt: undefined,
      });
      console.log(`Auto-cancelled stale job: ${job._id} (${job.title})`);
    }

    return { cancelledCount: allStale.length };
  },
});
