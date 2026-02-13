import { mutation, type MutationCtx } from "../../_generated/server";
import { MAP_SIZE, BUILDING_PAD, getCityBlocks } from "../../gameConstants";
import {
  getBlockZone,
  getTemplatesForZone,
  SERVICE_BUILDINGS,
  ZONES,
  WATER_LINE_Y,
} from "../../mapZones";
import { seededRandom } from "../../utils";
import { clearTreesInternal, initForestTreesInternal } from "../trees/helpers";

async function initCityInternal(ctx: MutationCtx) {
  const blocks = getCityBlocks(MAP_SIZE);
  const rng = seededRandom(42);

  let buildingIndex = 0;

  for (const block of blocks) {
    const zoneId = getBlockZone(block.x, block.y, block.w, block.h);
    const zone = ZONES[zoneId];

    if (rng() < zone.skipChance) continue;
    if (block.y + block.h > WATER_LINE_Y) continue;

    const usableW = block.w - BUILDING_PAD * 2;
    const usableH = block.h - BUILDING_PAD * 2;

    if (usableW < 50 || usableH < 50) continue;

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

  for (const service of SERVICE_BUILDINGS) {
    if (service.y + service.height > WATER_LINE_Y) continue;

    const overlapping = await ctx.db
      .query("properties")
      .filter((q) =>
        q.and(
          q.lt(q.field("x"), service.x + service.width),
          q.gt(q.add(q.field("x"), q.field("width")), service.x),
          q.lt(q.field("y"), service.y + service.height),
          q.gt(q.add(q.field("y"), q.field("height")), service.y),
        ),
      )
      .first();

    if (!overlapping) {
      await ctx.db.insert("properties", {
        name: service.name,
        price: 0,
        income: 0,
        category: service.category,
        subType: service.subType,
        zoneId: service.zone,
        maxOwners: 0,
        x: service.x,
        y: service.y,
        width: service.width,
        height: service.height,
      });
    }

    buildingIndex++;
  }

  await initForestTreesInternal(ctx);
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
    const properties = await ctx.db.query("properties").collect();
    for (const property of properties) {
      await ctx.db.delete(property._id);
    }

    const ownership = await ctx.db.query("propertyOwnership").collect();
    for (const record of ownership) {
      await ctx.db.delete(record._id);
    }

    const jobs = await ctx.db.query("jobs").collect();
    for (const job of jobs) {
      await ctx.db.delete(job._id);
    }

    const inventories = await ctx.db.query("inventory").collect();
    for (const item of inventories) {
      await ctx.db.delete(item._id);
    }

    await clearTreesInternal(ctx);
    await initCityInternal(ctx);

    return { success: true, message: "World reset successfully" };
  },
});
