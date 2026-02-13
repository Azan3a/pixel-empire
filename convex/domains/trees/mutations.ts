import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import {
  AXE_ITEM,
  MAX_FOREST_TREES,
  TREE_GROWTH_STAGES,
  TREE_INTERACT_RADIUS,
  TreeGrowthStage,
  WOOD_ITEM,
} from "../../config/treeConfig";
import {
  assertNear,
  decrementInventory,
  getPlayerOrThrow,
  getRangerStation,
  hasItem,
  placeTrees,
  SHOP_INTERACT_RADIUS,
  upsertInventory,
} from "./helpers";

export const initForestTrees = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("trees")
      .withIndex("by_zone", (q) => q.eq("zoneId", "forest"))
      .first();
    if (existing) return { ok: true, placed: 0 };

    const { placed } = await placeTrees(
      ctx,
      "forest",
      MAX_FOREST_TREES,
      "mature",
      4242,
    );
    return { ok: true, placed };
  },
});

export const chopTree = mutation({
  args: {
    treeId: v.id("trees"),
  },
  handler: async (ctx, args) => {
    const player = await getPlayerOrThrow(ctx);

    const hasAxe = await hasItem(ctx, player._id, AXE_ITEM.key);
    if (!hasAxe) throw new ConvexError("You need an axe to chop trees");

    const tree = await ctx.db.get(args.treeId);
    if (!tree) throw new ConvexError("Tree not found");
    if (tree.zoneId !== "forest") throw new ConvexError("Invalid tree zone");

    const stage = TREE_GROWTH_STAGES[tree.growthStage as TreeGrowthStage];
    if (!stage) throw new ConvexError("Invalid tree growth stage");
    if (stage.key === "seedling") {
      throw new ConvexError("This tree is too small to chop");
    }

    assertNear(
      { x: player.x, y: player.y },
      { x: tree.x, y: tree.y },
      TREE_INTERACT_RADIUS,
      "You are too far from the tree",
    );

    await ctx.db.delete(tree._id);
    await upsertInventory(ctx, player._id, WOOD_ITEM.key, stage.woodYield);

    return {
      ok: true,
      woodGained: stage.woodYield,
      woodEmoji: WOOD_ITEM.emoji,
    };
  },
});

export const buyAxe = mutation({
  args: {},
  handler: async (ctx) => {
    const player = await getPlayerOrThrow(ctx);
    const ranger = await getRangerStation(ctx);
    const center = {
      x: ranger.x + ranger.width / 2,
      y: ranger.y + ranger.height / 2,
    };

    assertNear(
      { x: player.x, y: player.y },
      center,
      SHOP_INTERACT_RADIUS,
      "You are too far from the Ranger Station",
    );

    const alreadyHasAxe = await hasItem(ctx, player._id, AXE_ITEM.key);
    if (alreadyHasAxe) {
      throw new ConvexError("You already have an axe");
    }

    if (player.cash < AXE_ITEM.price) {
      throw new ConvexError(`Not enough cash. Need $${AXE_ITEM.price}`);
    }

    await ctx.db.patch(player._id, { cash: player.cash - AXE_ITEM.price });
    await upsertInventory(ctx, player._id, AXE_ITEM.key, 1);

    return {
      ok: true,
      newCash: player.cash - AXE_ITEM.price,
      item: AXE_ITEM.key,
      emoji: AXE_ITEM.emoji,
    };
  },
});

export const sellWood = mutation({
  args: { quantity: v.number() },
  handler: async (ctx, args) => {
    const qty = Math.floor(args.quantity);
    if (!Number.isFinite(qty) || qty <= 0)
      throw new ConvexError("Invalid quantity");

    const player = await getPlayerOrThrow(ctx);
    const ranger = await getRangerStation(ctx);
    const center = {
      x: ranger.x + ranger.width / 2,
      y: ranger.y + ranger.height / 2,
    };

    assertNear(
      { x: player.x, y: player.y },
      center,
      SHOP_INTERACT_RADIUS,
      "You are too far from the Ranger Station",
    );

    await decrementInventory(ctx, player._id, WOOD_ITEM.key, qty);
    const earned = qty * WOOD_ITEM.sellPrice;
    await ctx.db.patch(player._id, { cash: player.cash + earned });

    return {
      ok: true,
      sold: qty,
      earned,
      newCash: player.cash + earned,
    };
  },
});
