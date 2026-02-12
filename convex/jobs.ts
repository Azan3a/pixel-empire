// convex/jobs.ts
import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  type MutationCtx,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ROAD_SPACING, MAP_SIZE, HALF_CORRIDOR } from "./gameConstants";
import { HUNGER_PER_DELIVERY } from "./foodConfig";
import { getZoneAt, WATER_LINE_Y, type ZoneId } from "./mapZones";

// ── Helpers ──

const JOB_TIMEOUT = 1000 * 60 * 30; // 30 minutes until a job is considered stale

/** All road intersection centers (safe spawn points on roads) */
function getIntersections(): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let x = ROAD_SPACING; x < MAP_SIZE; x += ROAD_SPACING) {
    for (let y = ROAD_SPACING; y < MAP_SIZE; y += ROAD_SPACING) {
      // Skip points in ocean
      if (y > WATER_LINE_Y) continue;
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
    if (ry > WATER_LINE_Y) continue;
    for (let px = 80; px < MAP_SIZE; px += 120) {
      points.push({ x: px, y: ry + HALF_CORRIDOR + 8 });
      points.push({ x: px, y: ry - HALF_CORRIDOR - 8 });
    }
  }

  // Points along vertical roads
  for (let rx = ROAD_SPACING; rx < MAP_SIZE; rx += ROAD_SPACING) {
    for (let py = 80; py < MAP_SIZE; py += 120) {
      if (py > WATER_LINE_Y) continue;
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

/** Zone-aware landmark name prefixes */
const ZONE_PREFIXES: Record<ZoneId, string[]> = {
  downtown: [
    "Downtown",
    "Central",
    "Midtown",
    "Metro",
    "City",
    "Main St",
    "Tower",
    "Grand",
  ],
  suburbs: [
    "North",
    "South",
    "East",
    "West",
    "Maple",
    "Oak",
    "Pine",
    "Elm",
    "Cedar",
    "Birch",
  ],
  industrial: [
    "Factory",
    "Dock",
    "Freight",
    "Iron",
    "Steel",
    "Harbor",
    "Rail",
    "Yard",
  ],
  forest: [
    "Trail",
    "Ridge",
    "Creek",
    "Hollow",
    "Timber",
    "Pine",
    "Fern",
    "Moss",
  ],
  park: [
    "Garden",
    "Pond",
    "Meadow",
    "Fountain",
    "Bench",
    "Grove",
    "Lawn",
    "Hill",
  ],
  beach: ["Shore", "Pier", "Boardwalk", "Surf", "Tide", "Sand", "Cove", "Wave"],
};

const PLACES = [
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

/** Generate a zone-aware landmark name from coordinates */
function getLandmarkName(x: number, y: number): string {
  const zoneId = getZoneAt(x, y);
  const prefixes = ZONE_PREFIXES[zoneId];

  const h = hashCoord(x, y, 42);
  const prefix = prefixes[h % prefixes.length];
  const place = PLACES[(h >> 4) % PLACES.length];
  return `${prefix} ${place}`;
}

/** Zone-aware job titles */
const ZONE_JOB_TITLES: Record<ZoneId, string[]> = {
  downtown: [
    "Express Courier",
    "Priority Package",
    "VIP Documents",
    "Office Supplies",
    "Catering Order",
    "Legal Papers",
  ],
  suburbs: [
    "Home Delivery",
    "Grocery Run",
    "Furniture Pickup",
    "Mail Package",
    "Garden Supplies",
    "School Supplies",
  ],
  industrial: [
    "Bulk Freight",
    "Parts Delivery",
    "Equipment Haul",
    "Scrap Metal Run",
    "Chemical Transport",
    "Tool Shipment",
  ],
  forest: [
    "Ranger Supplies",
    "Trail Provisions",
    "Wildlife Package",
    "Campsite Delivery",
    "Firewood Bundle",
  ],
  park: [
    "Park Supplies",
    "Event Catering",
    "Maintenance Gear",
    "Festival Setup",
    "Gardening Tools",
  ],
  beach: [
    "Beach Supplies",
    "Surfboard Delivery",
    "Pier Goods",
    "Seafood Express",
    "Boardwalk Restock",
  ],
};

const FALLBACK_TITLES = [
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
  "Confidential Docs",
];

/** Generate a job title based on pickup zone */
function getJobTitle(seed: number, pickupX: number, pickupY: number): string {
  const zoneId = getZoneAt(pickupX, pickupY);
  const titles = ZONE_JOB_TITLES[zoneId] ?? FALLBACK_TITLES;
  return titles[seed % titles.length];
}

/** Euclidean distance */
function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ── Interaction radius ──
const PICKUP_RADIUS = 60;

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

// ── Mutations ──

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

async function spawnJobsInternalLogic(ctx: MutationCtx) {
  const available = await ctx.db
    .query("jobs")
    .withIndex("by_status", (q) => q.eq("status", "available"))
    .take(20);

  if (available.length >= 10) return;

  const roadPoints = getRoadPoints();
  const toSpawn = 12 - available.length;

  for (let i = 0; i < toSpawn; i++) {
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
        ) < 300) &&
      attempts < 30
    ) {
      dropoffIdx = Math.floor(Math.random() * roadPoints.length);
      attempts++;
    }

    const pickup = roadPoints[pickupIdx];
    const dropoff = roadPoints[dropoffIdx];

    // Reward scales with distance — tuned for larger 4000px map
    const distance = dist(pickup.x, pickup.y, dropoff.x, dropoff.y);
    const baseReward = 30 + Math.round(distance * 0.12);

    // Cross-zone bonus: reward bump if pickup and dropoff are in different zones
    const pickupZone = getZoneAt(pickup.x, pickup.y);
    const dropoffZone = getZoneAt(dropoff.x, dropoff.y);
    const crossZoneBonus = pickupZone !== dropoffZone ? 20 : 0;

    const variance = Math.floor(Math.random() * 30) - 10;
    const reward = Math.max(25, baseReward + crossZoneBonus + variance);

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
      title: getJobTitle(seed, pickup.x, pickup.y),
      acceptedAt: undefined,
      pickedUpAt: undefined,
      completedAt: undefined,
    });
  }
}

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
