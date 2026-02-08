// convex/world.ts
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  MAP_SIZE,
  BUILDING_PAD,
  SELL_RATE,
  INCOME_COOLDOWN_MS,
  getCityBlocks,
} from "./gameConstants";
import { HUNGER_PER_WORK } from "./foodConfig";
import {
  getBlockZone,
  getTemplatesForZone,
  SERVICE_BUILDINGS,
  ZONES,
  WATER_LINE_Y,
} from "./mapZones";

// ── Seeded random for deterministic generation ──

function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

// ── City Initialization ──

export const initCity = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("properties").first();
    if (existing) return;

    const blocks = getCityBlocks(MAP_SIZE);
    const rng = seededRandom(42); // deterministic city layout

    let buildingIndex = 0;

    // ── Place procedural buildings per block ──
    for (const block of blocks) {
      const zoneId = getBlockZone(block.x, block.y, block.w, block.h);
      const zone = ZONES[zoneId];

      // Skip based on zone density
      if (rng() < zone.skipChance) continue;

      // Skip blocks that overlap the ocean
      if (block.y + block.h > WATER_LINE_Y) continue;

      const usableW = block.w - BUILDING_PAD * 2;
      const usableH = block.h - BUILDING_PAD * 2;

      if (usableW < 50 || usableH < 50) continue;

      // Get templates valid for this zone
      const templates = getTemplatesForZone(zoneId);
      if (templates.length === 0) continue;

      const template = templates[Math.floor(rng() * templates.length)];

      const jitter = 0.9 + rng() * 0.2;
      const factor = template.sizeFactor * jitter;
      const bw = Math.round(Math.min(usableW, usableW * factor));
      const bh = Math.round(Math.min(usableH, usableH * factor));

      const maxOffX = usableW - bw;
      const maxOffY = usableH - bh;
      const bx =
        block.x + BUILDING_PAD + Math.floor(rng() * Math.max(1, maxOffX));
      const by =
        block.y + BUILDING_PAD + Math.floor(rng() * Math.max(1, maxOffY));

      const areaRatio = (bw * bh) / (100 * 100);
      const adjustedPrice = Math.round(template.basePrice * areaRatio);
      const adjustedIncome = Math.round(template.baseIncome * areaRatio);

      await ctx.db.insert("properties", {
        name: `${template.name} #${buildingIndex + 1}`,
        price: adjustedPrice,
        income: adjustedIncome,
        category: template.category,
        subType: template.subType,
        zoneId,
        maxOwners: template.maxOwners,
        x: bx,
        y: by,
        width: bw,
        height: bh,
      });

      buildingIndex++;
    }

    // ── Place fixed service buildings ──
    for (const svc of SERVICE_BUILDINGS) {
      // Skip service buildings placed in the ocean
      if (svc.y + svc.height > WATER_LINE_Y) continue;

      // Check no overlap with existing properties at this position
      const overlapping = await ctx.db
        .query("properties")
        .filter((q) =>
          q.and(
            q.lt(q.field("x"), svc.x + svc.width),
            q.gt(q.add(q.field("x"), q.field("width")), svc.x),
            q.lt(q.field("y"), svc.y + svc.height),
            q.gt(q.add(q.field("y"), q.field("height")), svc.y),
          ),
        )
        .first();

      // If overlap, skip — service buildings get priority in a clean gen,
      // but we don't delete procedural ones in case of edge overlap
      if (!overlapping) {
        await ctx.db.insert("properties", {
          name: svc.name,
          price: 0,
          income: 0,
          category: svc.category,
          subType: svc.subType,
          zoneId: svc.zone,
          maxOwners: 0,
          x: svc.x,
          y: svc.y,
          width: svc.width,
          height: svc.height,
        });
      }

      buildingIndex++;
    }
  },
});

// ── Queries ──

export const getProperties = query({
  args: {},
  handler: async (ctx) => {
    const properties = await ctx.db.query("properties").collect();

    // Get current user's ownership info
    const userId = await getAuthUserId(ctx);
    let playerOwnedSet: Set<string> = new Set();
    const ownerCountMap: Map<string, number> = new Map();

    // Build owner counts for all properties
    const allOwnership = await ctx.db.query("propertyOwnership").collect();
    for (const o of allOwnership) {
      const key = o.propertyId as string;
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
        playerOwnedSet = new Set(
          myOwnership.map((o) => o.propertyId as string),
        );
      }
    }

    return properties.map((p) => ({
      ...p,
      isOwned: playerOwnedSet.has(p._id as string),
      ownerCount: ownerCountMap.get(p._id as string) ?? 0,
    }));
  },
});

// ── Buy Property (instanced ownership) ──

export const buyProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const prop = await ctx.db.get(args.propertyId);
    if (!prop) throw new ConvexError("Property not found");

    // Service buildings cannot be owned
    if (prop.maxOwners === 0) {
      throw new ConvexError(
        "This building is a public service and cannot be purchased.",
      );
    }

    // Check if player already owns this property
    const existingOwnership = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_player_property", (q) =>
        q.eq("playerId", player._id).eq("propertyId", args.propertyId),
      )
      .first();

    if (existingOwnership) {
      throw new ConvexError("You already own this property.");
    }

    // Check max owners
    const currentOwners = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    if (currentOwners.length >= prop.maxOwners) {
      throw new ConvexError(
        "This property has reached its maximum number of owners.",
      );
    }

    // Check cash
    if (player.cash < prop.price) {
      throw new ConvexError("Insufficient cash");
    }

    // Deduct cash and create ownership
    await ctx.db.patch(player._id, { cash: player.cash - prop.price });

    const now = Date.now();
    await ctx.db.insert("propertyOwnership", {
      propertyId: args.propertyId,
      playerId: player._id,
      level: 1,
      purchasedAt: now,
      lastCollectedAt: now,
    });
  },
});

// ── Sell Property (instanced ownership) ──

export const sellProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const prop = await ctx.db.get(args.propertyId);
    if (!prop) throw new ConvexError("Property not found");

    // Find player's ownership record
    const ownership = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_player_property", (q) =>
        q.eq("playerId", player._id).eq("propertyId", args.propertyId),
      )
      .first();

    if (!ownership) {
      throw new ConvexError("You don't own this property.");
    }

    const sellPrice = Math.round(prop.price * SELL_RATE);

    // Refund cash and remove ownership
    await ctx.db.patch(player._id, { cash: player.cash + sellPrice });
    await ctx.db.delete(ownership._id);

    return { sold: prop.name, sellPrice, newBalance: player.cash + sellPrice };
  },
});

// ── Collect Income ──

export const collectIncome = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const ownerships = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .collect();

    if (ownerships.length === 0) {
      throw new ConvexError("You don't own any properties.");
    }

    const now = Date.now();
    let totalIncome = 0;
    let propertiesCollected = 0;

    for (const ownership of ownerships) {
      // Check cooldown
      const elapsed = now - ownership.lastCollectedAt;
      if (elapsed < INCOME_COOLDOWN_MS) continue;

      // How many full cycles have passed
      const cycles = Math.floor(elapsed / INCOME_COOLDOWN_MS);
      if (cycles === 0) continue;

      const prop = await ctx.db.get(ownership.propertyId);
      if (!prop) continue;

      // Income scales with ownership level
      const incomePerCycle = Math.round(prop.income * ownership.level);
      const earned = incomePerCycle * cycles;

      totalIncome += earned;
      propertiesCollected++;

      // Update last collected time (snap to cycle boundaries to avoid drift)
      await ctx.db.patch(ownership._id, {
        lastCollectedAt:
          ownership.lastCollectedAt + cycles * INCOME_COOLDOWN_MS,
      });
    }

    if (totalIncome === 0) {
      throw new ConvexError(
        "No income ready to collect yet. Check back later!",
      );
    }

    await ctx.db.patch(player._id, { cash: player.cash + totalIncome });

    return {
      totalIncome,
      propertiesCollected,
      newBalance: player.cash + totalIncome,
    };
  },
});

// ── Work Job (unchanged fallback income) ──

export const workJob = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const hunger = player.hunger ?? 100;
    if (hunger <= 0) {
      throw new ConvexError("You're too hungry to work! Buy some food first.");
    }

    const wage = 50;
    const newHunger = Math.max(0, hunger - HUNGER_PER_WORK);

    await ctx.db.patch(player._id, {
      cash: player.cash + wage,
      hunger: newHunger,
    });

    return { earned: wage, newBalance: player.cash + wage, hunger: newHunger };
  },
});
