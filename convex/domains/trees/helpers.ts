import { ConvexError } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { SHOP_INTERACT_RADIUS } from "../../gameConstants";
import { getZoneAt, ZONES, type ZoneId, WATER_LINE_Y } from "../../mapZones";
import { seededRandom } from "../../utils";
import {
  MAX_FOREST_TREES,
  TREE_GROWTH_ORDER,
  TREE_GROWTH_STAGES,
  TREE_SPAWN_BUILDING_MARGIN,
  TREE_SPAWN_SPACING,
  TreeGrowthStage,
} from "../../treeConfig";

type Point = { x: number; y: number };

function dist(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getNextStage(stage: TreeGrowthStage): TreeGrowthStage {
  const index = TREE_GROWTH_ORDER.indexOf(stage);
  if (index < 0 || index === TREE_GROWTH_ORDER.length - 1) return stage;
  return TREE_GROWTH_ORDER[index + 1];
}

function getForestBounds() {
  return ZONES.forest.bounds;
}

export async function getPlayerOrThrow(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Unauthorized");

  const player = await ctx.db
    .query("players")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (!player) throw new ConvexError("Player not found");
  return player;
}

export async function upsertInventory(
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

export async function decrementInventory(
  ctx: MutationCtx,
  playerId: Id<"players">,
  item: string,
  delta: number,
) {
  if (delta <= 0) throw new ConvexError("Invalid quantity");

  const inventoryItem = await ctx.db
    .query("inventory")
    .withIndex("by_player", (q) => q.eq("playerId", playerId))
    .filter((q) => q.eq(q.field("item"), item))
    .first();

  if (!inventoryItem || inventoryItem.quantity < delta) {
    throw new ConvexError("Not enough items");
  }

  const newQty = inventoryItem.quantity - delta;
  if (newQty === 0) {
    await ctx.db.delete(inventoryItem._id);
  } else {
    await ctx.db.patch(inventoryItem._id, { quantity: newQty });
  }
}

export async function hasItem(
  ctx: MutationCtx,
  playerId: Id<"players">,
  item: string,
) {
  const inventoryItem = await ctx.db
    .query("inventory")
    .withIndex("by_player", (q) => q.eq("playerId", playerId))
    .filter((q) => q.eq(q.field("item"), item))
    .first();
  return (inventoryItem?.quantity ?? 0) > 0;
}

function isTooCloseToProperties(
  point: Point,
  radius: number,
  properties: Array<{ x: number; y: number; width: number; height: number }>,
) {
  const pad = TREE_SPAWN_BUILDING_MARGIN + radius;
  return properties.some((property) => {
    const left = property.x - pad;
    const top = property.y - pad;
    const right = property.x + property.width + pad;
    const bottom = property.y + property.height + pad;
    return (
      point.x >= left && point.x <= right && point.y >= top && point.y <= bottom
    );
  });
}

function isTooCloseToTrees(point: Point, others: Point[], minSpacing: number) {
  return others.some((other) => dist(point, other) < minSpacing);
}

export async function getRangerStation(ctx: MutationCtx) {
  const ranger = await ctx.db
    .query("properties")
    .filter((q) => q.eq(q.field("subType"), "ranger_station"))
    .first();

  if (!ranger) throw new ConvexError("Ranger Station not found");
  return ranger;
}

export function assertNear(
  actor: Point,
  target: Point,
  maxDistance: number,
  message: string,
) {
  if (dist(actor, target) > maxDistance) throw new ConvexError(message);
}

export async function placeTrees(
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

  const accepted: Point[] = existingTrees.map((tree) => ({
    x: tree.x,
    y: tree.y,
  }));
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

export async function initForestTreesInternal(ctx: MutationCtx) {
  const trees = await ctx.db
    .query("trees")
    .withIndex("by_zone", (q) => q.eq("zoneId", "forest"))
    .collect();

  if (trees.length >= MAX_FOREST_TREES) return { placed: 0 };

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
  for (const tree of trees) {
    await ctx.db.delete(tree._id);
  }
}

export { SHOP_INTERACT_RADIUS };
