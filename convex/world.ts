import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const initCity = mutation({
  args: {},
  handler: async (ctx) => {
    // Only init if empty
    const existing = await ctx.db.query("properties").first();
    if (existing) return;

    // Create a 5x5 grid of properties
    const types = [
      { name: "Empty Lot", price: 1000, income: 10, type: "residential" },
      { name: "Corner Store", price: 5000, income: 100, type: "commercial" },
      { name: "Workshop", price: 10000, income: 250, type: "industrial" },
    ];

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const randType = types[Math.floor(Math.random() * types.length)];
        // Grid spacing: 150 units apart. Size 100. Gap 50.
        // x=0 -> pos 50. range 50-150. next x=1 -> pos 200. range 200-300. Gap 150-200.
        // Center of first gap is 175.
        await ctx.db.insert("properties", {
          name: `${randType.name} ${x}${y}`,
          price: randType.price,
          income: randType.income,
          type: randType.type,
          x: x * 150 + 50,
          y: y * 150 + 50,
          width: 100,
          height: 100,
          ownerId: undefined,
        });
      }
    }
  },
});

export const getProperties = query({
  args: {},
  handler: async (ctx) => {
    const props = await ctx.db.query("properties").collect();
    return props;
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

    const cost = prop.price;
    if (player.cash < cost) {
      throw new Error("Insufficient cash");
    }

    // Process transaction
    await ctx.db.patch(player._id, { cash: player.cash - cost });
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
