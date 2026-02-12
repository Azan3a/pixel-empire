// convex/trees.ts
import { ConvexError, v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  type MutationCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { seededRandom } from "./utils";
import { SHOP_INTERACT_RADIUS } from "./gameConstants";
import { getZoneAt, ZONES, type ZoneId, WATER_LINE_Y } from "./mapZones";
import {
  AXE_ITEM,
  MAX_FOREST_TREES,
  TREE_GROWTH_ORDER,
  TREE_GROWTH_STAGES,
  TREE_INTERACT_RADIUS,
  TREE_SPAWN_BUILDING_MARGIN,
  TREE_SPAWN_SPACING,
  TreeGrowthStage,
  WOOD_ITEM,
} from "./treeConfig";

type Point = { x: number; y: number };

function dist(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getNextStage(stage: TreeGrowthStage): TreeGrowthStage {
  const i = TREE_GROWTH_ORDER.indexOf(stage);
  if (i < 0 || i === TREE_GROWTH_ORDER.length - 1) return stage;
  return TREE_GROWTH_ORDER[i + 1];
}

function getForestBounds() {
  return ZONES.forest.bounds;
}

async function getPlayerOrThrow(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Unauthorized");

  const player = await ctx.db
    .query("players")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (!player) throw new ConvexError("Player not found");
  return player;
}

async function upsertInventory(
  ctx: MutationCtx,
  playerId: Id<"players">,
  item: string,
  delta: number,
) {
  if (delta <= 0) return;
  const existing = await ctx.db
    .query("inventory")
    .withIndex("by_player", (q) => q.eq("playerId", playerId))
    .filter((q) => q.eq(q.field("item"), item))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, { quantity: existing.quantity + delta });
  } else {
    await ctx.db.insert("inventory", {
      playerId,
      item,
      quantity: delta,
    });
  }
}

async function decrementInventory(
  ctx: MutationCtx,
  playerId: Id<"players">,
  item: string,
  delta: number,
) {
  if (delta <= 0) throw new ConvexError("Invalid quantity");
  const invItem = await ctx.db
    .query("inventory")
    .withIndex("by_player", (q) => q.eq("playerId", playerId))
    .filter((q) => q.eq(q.field("item"), item))
    .first();

  if (!invItem || invItem.quantity < delta) {
    throw new ConvexError("Not enough items");
  }

  const newQty = invItem.quantity - delta;
  if (newQty === 0) {
    await ctx.db.delete(invItem._id);
  } else {
    await ctx.db.patch(invItem._id, { quantity: newQty });
  }
}

async function hasItem(
  ctx: MutationCtx,
  playerId: Id<"players">,
  item: string,
) {
  const invItem = await ctx.db
    .query("inventory")
    .withIndex("by_player", (q) => q.eq("playerId", playerId))
    .filter((q) => q.eq(q.field("item"), item))
    .first();
  return (invItem?.quantity ?? 0) > 0;
}

function isTooCloseToProperties(
  point: Point,
  radius: number,
  properties: Array<{ x: number; y: number; width: number; height: number }>,
) {
  const pad = TREE_SPAWN_BUILDING_MARGIN + radius;
  return properties.some((p) => {
    const left = p.x - pad;
    const top = p.y - pad;
    const right = p.x + p.width + pad;
    const bottom = p.y + p.height + pad;
    return (
      point.x >= left && point.x <= right && point.y >= top && point.y <= bottom
    );
  });
}

function isTooCloseToTrees(point: Point, others: Point[], minSpacing: number) {
  return others.some((o) => dist(point, o) < minSpacing);
}

async function getRangerStation(ctx: MutationCtx) {
  const ranger = await ctx.db
    .query("properties")
    .filter((q) => q.eq(q.field("subType"), "ranger_station"))
    .first();

  if (!ranger) throw new ConvexError("Ranger Station not found");
  return ranger;
}

function assertNear(
  actor: Point,
  target: Point,
  maxDistance: number,
  message: string,
) {
  if (dist(actor, target) > maxDistance) throw new ConvexError(message);
}

async function placeTrees(
  ctx: MutationCtx,
  zoneId: ZoneId,
  desiredCount: number,
  stage: TreeGrowthStage,
  seed: number,
) {
  const rng = seededRandom(seed);
  const bounds = getForestBounds();
  const properties = await ctx.db.query("properties").collect();
  const existingTrees = await ctx.db
    .query("trees")
    .withIndex("by_zone", (q) => q.eq("zoneId", zoneId))
    .collect();

  const matureRadius = TREE_GROWTH_STAGES.mature.size / 2;
  const minSpacing = Math.max(TREE_SPAWN_SPACING, matureRadius * 2);

  const accepted: Point[] = existingTrees.map((t) => ({ x: t.x, y: t.y }));
  const now = Date.now();

  const pad = matureRadius + 10;
  const minX = bounds.x1 + pad;
  const maxX = bounds.x2 - pad;
  const minY = bounds.y1 + pad;
  const maxY = Math.min(bounds.y2 - pad, WATER_LINE_Y - pad);

  let attempts = 0;
  const maxAttempts = Math.max(2000, desiredCount * 80);

  while (accepted.length < desiredCount && attempts < maxAttempts) {
    attempts++;

    const candidate: Point = {
      x: Math.floor(minX + rng() * Math.max(1, maxX - minX)),
      y: Math.floor(minY + rng() * Math.max(1, maxY - minY)),
    };

    if (getZoneAt(candidate.x, candidate.y) !== zoneId) continue;
    if (isTooCloseToProperties(candidate, matureRadius, properties)) continue;
    if (isTooCloseToTrees(candidate, accepted, minSpacing)) continue;

    accepted.push(candidate);
    await ctx.db.insert("trees", {
      x: candidate.x,
      y: candidate.y,
      growthStage: stage,
      plantedAt: now,
      zoneId,
    });
  }

  return { placed: accepted.length - existingTrees.length };
}

// ── Public queries/mutations ──

export const getForestTrees = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("trees")
      .withIndex("by_zone", (q) => q.eq("zoneId", "forest"))
      .collect();
  },
});

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

// ── Internal jobs ──

export const growTrees = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const trees = await ctx.db
      .query("trees")
      .withIndex("by_zone", (q) => q.eq("zoneId", "forest"))
      .collect();

    let promoted = 0;

    for (const tree of trees) {
      const stageKey = tree.growthStage as TreeGrowthStage;
      const stage = TREE_GROWTH_STAGES[stageKey];
      if (!stage) continue;
      if (stage.growthTimeMs === Infinity) continue;

      if (now - tree.plantedAt >= stage.growthTimeMs) {
        const next = getNextStage(stageKey);
        if (next !== stageKey) {
          await ctx.db.patch(tree._id, {
            growthStage: next,
            plantedAt: now,
          });
          promoted++;
        }
      }
    }

    return { ok: true, promoted };
  },
});

export const spawnNewTrees = internalMutation({
  args: {},
  handler: async (ctx) => {
    const trees = await ctx.db
      .query("trees")
      .withIndex("by_zone", (q) => q.eq("zoneId", "forest"))
      .collect();

    const missing = Math.max(0, MAX_FOREST_TREES - trees.length);
    if (missing === 0) return { ok: true, placed: 0 };

    // Use time-based seed so respawns vary but remain deterministic within a short window.
    const seed = Math.floor(Date.now() / (5 * 60 * 1000));
    const desired = Math.min(missing, 8);
    const { placed } = await placeTrees(
      ctx,
      "forest",
      trees.length + desired,
      "seedling",
      seed,
    );
    return { ok: true, placed };
  },
});

// ── World init helpers (imported by convex/world.ts) ──

export async function initForestTreesInternal(ctx: MutationCtx) {
  const count = await ctx.db
    .query("trees")
    .withIndex("by_zone", (q) => q.eq("zoneId", "forest"))
    .collect();

  if (count.length >= MAX_FOREST_TREES) return { placed: 0 };
  const { placed } = await placeTrees(
    ctx,
    "forest",
    MAX_FOREST_TREES,
    "mature",
    4242,
  );
  return { placed };
}

export async function clearTreesInternal(ctx: MutationCtx) {
  const trees = await ctx.db.query("trees").collect();
  for (const t of trees) {
    await ctx.db.delete(t._id);
  }
}
