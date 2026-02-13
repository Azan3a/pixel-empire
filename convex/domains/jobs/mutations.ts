// convex/domains/jobs/mutations.ts

import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { HUNGER_PER_DELIVERY } from "../../foodConfig";
import { dist } from "../../shared/math";
import { PICKUP_RADIUS } from "./constants";

export const acceptJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");

    const hunger = player.hunger ?? 100;
    if (hunger < 10) {
      throw new Error(
        "You're too hungry to take a delivery! Eat something first.",
      );
    }

    const existingAccepted = await ctx.db
      .query("jobs")
      .withIndex("by_player_status", (q) =>
        q.eq("playerId", player._id).eq("status", "accepted"),
      )
      .first();
    const existingPickedUp = await ctx.db
      .query("jobs")
      .withIndex("by_player_status", (q) =>
        q.eq("playerId", player._id).eq("status", "picked_up"),
      )
      .first();

    if (existingAccepted || existingPickedUp) {
      throw new Error(
        "You already have an active delivery. Complete or cancel it first.",
      );
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    if (job.status !== "available")
      throw new Error("Job is no longer available");

    await ctx.db.patch(args.jobId, {
      status: "accepted",
      playerId: player._id,
      acceptedAt: Date.now(),
    });

    return { success: true };
  },
});

export const pickupParcel = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    if (job.playerId !== player._id) throw new Error("This isn't your job");
    if (job.status !== "accepted") throw new Error("Job not in pickup state");

    const d = dist(player.x, player.y, job.pickupX, job.pickupY);
    if (d > PICKUP_RADIUS) {
      throw new Error("You're too far from the pickup location");
    }

    await ctx.db.patch(args.jobId, {
      status: "picked_up",
      pickedUpAt: Date.now(),
    });

    return { success: true };
  },
});

export const deliverParcel = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    if (job.playerId !== player._id) throw new Error("This isn't your job");
    if (job.status !== "picked_up")
      throw new Error("You haven't picked up the parcel yet");

    const d = dist(player.x, player.y, job.dropoffX, job.dropoffY);
    if (d > PICKUP_RADIUS) {
      throw new Error("You're too far from the delivery location");
    }

    const hunger = player.hunger ?? 100;
    const newHunger = Math.max(0, hunger - HUNGER_PER_DELIVERY);

    await ctx.db.patch(args.jobId, {
      status: "completed",
      completedAt: Date.now(),
    });

    await ctx.db.patch(player._id, {
      cash: player.cash + job.reward,
      hunger: newHunger,
    });

    return {
      earned: job.reward,
      newBalance: player.cash + job.reward,
      hunger: newHunger,
    };
  },
});

export const cancelJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    if (job.playerId !== player._id) throw new Error("This isn't your job");
    if (job.status !== "accepted" && job.status !== "picked_up") {
      throw new Error("Job can't be cancelled");
    }

    await ctx.db.patch(args.jobId, {
      status: "available",
      playerId: undefined,
      acceptedAt: undefined,
      pickedUpAt: undefined,
    });

    return { success: true };
  },
});
