import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { MAP_SIZE, BUILDING_PAD, getCityBlocks } from "./gameConstants";

export const initCity = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("properties").first();
    if (existing) return;

    const blocks = getCityBlocks(MAP_SIZE);

    const templates = [
      // Residential
      {
        name: "House",
        price: 1000,
        income: 10,
        type: "residential",
        sizeFactor: 0.5,
      },
      {
        name: "Duplex",
        price: 2000,
        income: 30,
        type: "residential",
        sizeFactor: 0.55,
      },
      {
        name: "Apartment",
        price: 3500,
        income: 50,
        type: "residential",
        sizeFactor: 0.65,
      },
      // Commercial
      {
        name: "Corner Store",
        price: 5000,
        income: 100,
        type: "commercial",
        sizeFactor: 0.6,
      },
      {
        name: "Office",
        price: 8000,
        income: 200,
        type: "commercial",
        sizeFactor: 0.7,
      },
      {
        name: "Mall",
        price: 15000,
        income: 400,
        type: "commercial",
        sizeFactor: 0.8,
      },
    ];

    let buildingIndex = 0;

    for (const block of blocks) {
      // ── Skip some blocks to leave parks / open space ──
      // Skip ~30% of blocks randomly
      if (Math.random() < 0.3) continue;

      const usableW = block.w - BUILDING_PAD * 2;
      const usableH = block.h - BUILDING_PAD * 2;

      // Block too small for any building
      if (usableW < 50 || usableH < 50) continue;

      // ── Pick template ──
      const template = templates[Math.floor(Math.random() * templates.length)];

      // ── Size: proportional to block, with some randomness ──
      const jitter = 0.9 + Math.random() * 0.2; // 0.9 – 1.1
      const factor = template.sizeFactor * jitter;
      const bw = Math.round(Math.min(usableW, usableW * factor));
      const bh = Math.round(Math.min(usableH, usableH * factor));

      // ── Position: random offset within remaining space ──
      const maxOffX = usableW - bw;
      const maxOffY = usableH - bh;
      const bx =
        block.x +
        BUILDING_PAD +
        Math.floor(Math.random() * Math.max(1, maxOffX));
      const by =
        block.y +
        BUILDING_PAD +
        Math.floor(Math.random() * Math.max(1, maxOffY));

      // ── Scale price by building area ──
      const areaRatio = (bw * bh) / (100 * 100); // baseline 100x100
      const adjustedPrice = Math.round(template.price * areaRatio);
      const adjustedIncome = Math.round(template.income * areaRatio);

      await ctx.db.insert("properties", {
        name: `${template.name} #${buildingIndex + 1}`,
        price: adjustedPrice,
        income: adjustedIncome,
        type: template.type,
        x: bx,
        y: by,
        width: bw,
        height: bh,
        ownerId: undefined,
      });

      buildingIndex++;
    }
  },
});

export const getProperties = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("properties").collect();
  },
});

export const buyProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");

    const prop = await ctx.db.get(args.propertyId);
    if (!prop) throw new Error("Property not found");
    if (prop.ownerId) throw new Error("Property already owned");

    if (player.cash < prop.price) {
      throw new Error("Insufficient cash");
    }

    await ctx.db.patch(player._id, { cash: player.cash - prop.price });
    await ctx.db.patch(prop._id, { ownerId: player._id });
  },
});

export const workJob = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");

    const wage = 50;
    await ctx.db.patch(player._id, { cash: player.cash + wage });
    return { earned: wage, newBalance: player.cash + wage };
  },
});
