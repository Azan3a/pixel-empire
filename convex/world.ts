// convex/world.ts
import { mutation, type MutationCtx } from "./_generated/server";
import { MAP_SIZE, BUILDING_PAD, getCityBlocks } from "./gameConstants";
import {
  getBlockZone,
  getTemplatesForZone,
  SERVICE_BUILDINGS,
  ZONES,
  WATER_LINE_Y,
} from "./mapZones";
import { seededRandom } from "./utils";

// ── City Initialization ──

async function initCityInternal(ctx: MutationCtx) {
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
}

export const initCity = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("properties").first();
    if (existing) return;
    await initCityInternal(ctx);
  },
});

export const resetWorld = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Clear all properties
    const properties = await ctx.db.query("properties").collect();
    for (const prop of properties) {
      await ctx.db.delete(prop._id);
    }

    // 2. Clear all property ownership records
    const ownership = await ctx.db.query("propertyOwnership").collect();
    for (const own of ownership) {
      await ctx.db.delete(own._id);
    }

    // 3. Clear active jobs
    const jobs = await ctx.db.query("jobs").collect();
    for (const job of jobs) {
      await ctx.db.delete(job._id);
    }

    // 4. (Optional) Clear player inventories if resetting economy
    const inventories = await ctx.db.query("inventory").collect();
    for (const item of inventories) {
      await ctx.db.delete(item._id);
    }

    // 5. Re-initialize the map
    await initCityInternal(ctx);

    return { success: true, message: "World reset successfully" };
  },
});
