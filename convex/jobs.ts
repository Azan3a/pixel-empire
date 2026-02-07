// convex/jobs.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ROAD_SPACING, MAP_SIZE, HALF_CORRIDOR } from "./gameConstants";

// ── Helpers ──

/** All road intersection centers (safe spawn points on roads) */
function getIntersections(): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let x = ROAD_SPACING; x < MAP_SIZE; x += ROAD_SPACING) {
    for (let y = ROAD_SPACING; y < MAP_SIZE; y += ROAD_SPACING) {
      points.push({ x, y });
    }
  }
  return points;
}

/** Points along road edges (sidewalk locations) for variety */
function getRoadPoints(): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  // Points along horizontal roads
  for (let ry = ROAD_SPACING; ry < MAP_SIZE; ry += ROAD_SPACING) {
    for (let px = 80; px < MAP_SIZE; px += 120) {
      points.push({ x: px, y: ry + HALF_CORRIDOR + 8 });
      points.push({ x: px, y: ry - HALF_CORRIDOR - 8 });
    }
  }

  // Points along vertical roads
  for (let rx = ROAD_SPACING; rx < MAP_SIZE; rx += ROAD_SPACING) {
    for (let py = 80; py < MAP_SIZE; py += 120) {
      points.push({ x: rx + HALF_CORRIDOR + 8, y: py });
      points.push({ x: rx - HALF_CORRIDOR - 8, y: py });
    }
  }

  // Include intersections
  points.push(...getIntersections());

  return points;
}

/** Simple hash for deterministic naming */
function hashCoord(x: number, y: number, seed: number): number {
  return Math.abs((x * 7919 + y * 104729 + seed * 31) % 10000);
}

/** Generate a landmark name from coordinates */
function getLandmarkName(x: number, y: number): string {
  const prefixes = [
    "North",
    "South",
    "East",
    "West",
    "Central",
    "Old",
    "New",
    "Upper",
    "Lower",
    "Downtown",
  ];
  const places = [
    "Market",
    "Plaza",
    "Square",
    "Corner",
    "Station",
    "Depot",
    "Warehouse",
    "Terminal",
    "Hub",
    "Dock",
    "Port",
    "Block",
    "Junction",
    "Exchange",
    "Point",
    "Gate",
    "Yard",
    "Landing",
  ];

  const h = hashCoord(x, y, 42);
  const prefix = prefixes[h % prefixes.length];
  const place = places[(h >> 4) % places.length];
  return `${prefix} ${place}`;
}

/** Generate a job title */
function getJobTitle(seed: number): string {
  const titles = [
    "Rush Delivery",
    "Priority Package",
    "Express Parcel",
    "Fragile Goods",
    "Urgent Documents",
    "Medical Supplies",
    "Food Delivery",
    "Electronics Shipment",
    "Antique Transport",
    "Special Cargo",
    "Overnight Express",
    "Bulk Freight",
    "VIP Package",
    "Confidential Docs",
    "Parts Delivery",
  ];
  return titles[seed % titles.length];
}

/** Euclidean distance */
function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ── Interaction radius ──
const PICKUP_RADIUS = 60; // server-side generous radius

// ── Queries ──

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

    // Check "accepted" first
    const accepted = await ctx.db
      .query("jobs")
      .withIndex("by_player_status", (q) =>
        q.eq("playerId", player._id).eq("status", "accepted"),
      )
      .first();
    if (accepted) return accepted;

    // Check "picked_up"
    const pickedUp = await ctx.db
      .query("jobs")
      .withIndex("by_player_status", (q) =>
        q.eq("playerId", player._id).eq("status", "picked_up"),
      )
      .first();
    return pickedUp ?? null;
  },
});

// ── Mutations ──

export const spawnJobs = mutation({
  args: {},
  handler: async (ctx) => {
    const available = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .take(20);

    if (available.length >= 5) return; // enough jobs exist

    const roadPoints = getRoadPoints();
    const toSpawn = 8 - available.length;

    for (let i = 0; i < toSpawn; i++) {
      // Pick two distinct random points
      const pickupIdx = Math.floor(Math.random() * roadPoints.length);
      let dropoffIdx = Math.floor(Math.random() * roadPoints.length);

      // Ensure different point and minimum distance
      let attempts = 0;
      while (
        (dropoffIdx === pickupIdx ||
          dist(
            roadPoints[pickupIdx].x,
            roadPoints[pickupIdx].y,
            roadPoints[dropoffIdx].x,
            roadPoints[dropoffIdx].y,
          ) < 200) &&
        attempts < 20
      ) {
        dropoffIdx = Math.floor(Math.random() * roadPoints.length);
        attempts++;
      }

      const pickup = roadPoints[pickupIdx];
      const dropoff = roadPoints[dropoffIdx];

      // Reward scales with distance
      const distance = dist(pickup.x, pickup.y, dropoff.x, dropoff.y);
      const baseReward = 30 + Math.round(distance * 0.15);
      const variance = Math.floor(Math.random() * 30) - 10; // -10 to +20
      const reward = Math.max(25, baseReward + variance);

      const seed = hashCoord(pickup.x, pickup.y, i + Date.now());

      await ctx.db.insert("jobs", {
        type: "delivery",
        status: "available",
        playerId: undefined,
        reward,
        pickupX: pickup.x,
        pickupY: pickup.y,
        dropoffX: dropoff.x,
        dropoffY: dropoff.y,
        pickupName: getLandmarkName(pickup.x, pickup.y),
        dropoffName: getLandmarkName(dropoff.x, dropoff.y),
        title: getJobTitle(seed),
        acceptedAt: undefined,
        pickedUpAt: undefined,
        completedAt: undefined,
      });
    }
  },
});

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

    // Check no active job
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

    // Server-side proximity check
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

    // Server-side proximity check
    const d = dist(player.x, player.y, job.dropoffX, job.dropoffY);
    if (d > PICKUP_RADIUS) {
      throw new Error("You're too far from the delivery location");
    }

    // Complete job and pay player
    await ctx.db.patch(args.jobId, {
      status: "completed",
      completedAt: Date.now(),
    });

    await ctx.db.patch(player._id, {
      cash: player.cash + job.reward,
    });

    return { earned: job.reward, newBalance: player.cash + job.reward };
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

    // Reset the job back to available so someone else can take it
    await ctx.db.patch(args.jobId, {
      status: "available",
      playerId: undefined,
      acceptedAt: undefined,
      pickedUpAt: undefined,
    });

    return { success: true };
  },
});
