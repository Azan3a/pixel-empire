// convex/jobs.ts
import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  type MutationCtx,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { HUNGER_PER_DELIVERY } from "./foodConfig";
import { getZoneAt, type ZoneId } from "./map/zones";
import { getJobSpawnPoints } from "./map/generate/jobPoints";

// ── Helpers ──

const JOB_TIMEOUT = 1000 * 60 * 30; // 30 minutes until a job is considered stale

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
  mountains: [
    "Summit",
    "Peak",
    "Ridge",
    "Cliff",
    "Boulder",
    "Alpine",
    "Stone",
    "Crest",
  ],
  oldtown: [
    "Old",
    "Heritage",
    "Clock",
    "Market",
    "Cobble",
    "Brick",
    "Chapel",
    "Square",
  ],
  harbor: ["Port", "Wharf", "Dock", "Anchor", "Pier", "Quay", "Marina", "Bay"],
  commercial: [
    "Trade",
    "Market",
    "Strip",
    "Mall",
    "Plaza",
    "Outlet",
    "Shop",
    "Retail",
  ],
  farmland: [
    "Farm",
    "Barn",
    "Field",
    "Harvest",
    "Meadow",
    "Pasture",
    "Ranch",
    "Mill",
  ],
  wetlands: ["Marsh", "Swamp", "Reed", "Bog", "Mire", "Fern", "Heron", "Lily"],
  boardwalk: [
    "Promenade",
    "Resort",
    "Luxury",
    "Casino",
    "Grand",
    "Seaside",
    "Riviera",
    "Vista",
  ],
  smallisland: ["Island", "Cove", "Lagoon", "Atoll", "Isle", "Shoal"],
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
  const prefixes = zoneId ? ZONE_PREFIXES[zoneId] : ["Unknown"];

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
  mountains: [
    "Mining Gear",
    "Summit Supplies",
    "Expedition Load",
    "Ore Delivery",
    "Lodge Provisions",
  ],
  oldtown: [
    "Antique Delivery",
    "Bakery Flour",
    "Clock Parts",
    "Heritage Goods",
    "Tavern Barrels",
  ],
  harbor: [
    "Ship Cargo",
    "Fresh Catch",
    "Dock Supplies",
    "Import Goods",
    "Marine Equipment",
  ],
  commercial: [
    "Wholesale Order",
    "Retail Stock",
    "Market Goods",
    "Store Inventory",
    "Bulk Purchase",
  ],
  farmland: [
    "Produce Delivery",
    "Feed Run",
    "Harvest Transport",
    "Livestock Supplies",
    "Seed Order",
  ],
  wetlands: [
    "Research Samples",
    "Field Equipment",
    "Nature Specimens",
    "Conservation Gear",
  ],
  boardwalk: [
    "Casino Chips",
    "Hotel Linens",
    "Resort Supplies",
    "Luxury Goods",
    "Event Tickets",
  ],
  smallisland: ["Island Supplies", "Lighthouse Parts", "Boat Cargo"],
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
  const titles = zoneId
    ? (ZONE_JOB_TITLES[zoneId] ?? FALLBACK_TITLES)
    : FALLBACK_TITLES;
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

  const spawnPoints = getJobSpawnPoints();
  if (spawnPoints.length < 2) return;
  const toSpawn = 12 - available.length;

  for (let i = 0; i < toSpawn; i++) {
    const pickupIdx = Math.floor(Math.random() * spawnPoints.length);
    let dropoffIdx = Math.floor(Math.random() * spawnPoints.length);

    // Ensure different point and minimum distance
    let attempts = 0;
    while (
      (dropoffIdx === pickupIdx ||
        dist(
          spawnPoints[pickupIdx].x,
          spawnPoints[pickupIdx].y,
          spawnPoints[dropoffIdx].x,
          spawnPoints[dropoffIdx].y,
        ) < 300) &&
      attempts < 30
    ) {
      dropoffIdx = Math.floor(Math.random() * spawnPoints.length);
      attempts++;
    }

    const pickup = spawnPoints[pickupIdx];
    const dropoff = spawnPoints[dropoffIdx];

    // Reward scales with distance — tuned for 8000px map
    const distance = dist(pickup.x, pickup.y, dropoff.x, dropoff.y);
    const baseReward = 30 + Math.round(distance * 0.08);

    // Cross-zone bonus: reward bump if pickup and dropoff are in different zones
    const pickupZone = pickup.zoneId;
    const dropoffZone = dropoff.zoneId;
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
