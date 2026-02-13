import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { MAX_HUNGER, HUNGER_WALK_THRESHOLD } from "../../foodConfig";
import { getSpawnPoint, MAP_SIZE } from "../../gameConstants";
import { WATER_LINE_Y } from "../../mapZones";
import { processIncomeCollection } from "../economy/helpers";

const MIN_POSITION_UPDATE_INTERVAL_MS = 40;
const MAX_MOVEMENT_ELAPSED_MS = 500;
const MAX_PLAYER_SPEED_PX_PER_SEC = 420;

function clampPosition(x: number, y: number) {
  return {
    x: Math.max(0, Math.min(MAP_SIZE, x)),
    y: Math.max(0, Math.min(WATER_LINE_Y, y)),
  };
}

export const getOrCreatePlayer = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingPlayer) {
      const now = Date.now();
      const user = await ctx.db.get(userId);

      interface PlayerPatch {
        lastSeen: number;
        hunger?: number;
        walkDistance?: number;
        name?: string;
        x?: number;
        y?: number;
        lastIncomeCheckAt?: number;
      }

      const patches: PlayerPatch = { lastSeen: now };
      if (existingPlayer.hunger === undefined) patches.hunger = MAX_HUNGER;
      if (existingPlayer.walkDistance === undefined) patches.walkDistance = 0;

      if (user?.name && user.name !== existingPlayer.name) {
        patches.name = user.name;
      }

      let needsReposition = false;
      if (
        existingPlayer.x < 0 ||
        existingPlayer.x > MAP_SIZE ||
        existingPlayer.y < 0 ||
        existingPlayer.y > WATER_LINE_Y
      ) {
        needsReposition = true;
      }

      if (needsReposition) {
        const spawn = getSpawnPoint();
        patches.x = spawn.x;
        patches.y = spawn.y;
      }

      await processIncomeCollection(ctx, existingPlayer);
      patches.lastIncomeCheckAt = now;

      await ctx.db.patch(existingPlayer._id, patches);
      return {
        ...existingPlayer,
        hunger: existingPlayer.hunger ?? MAX_HUNGER,
        walkDistance: existingPlayer.walkDistance ?? 0,
        lastSeen: Date.now(),
        ...(needsReposition ? { x: patches.x, y: patches.y } : {}),
      };
    }

    const user = await ctx.db.get(userId);
    const playerName =
      user?.name || "Player " + Math.floor(Math.random() * 10000);
    const avatar = "avatar" + (Math.floor(Math.random() * 4) + 1);
    const spawn = getSpawnPoint();

    const playerId = await ctx.db.insert("players", {
      userId,
      name: playerName,
      x: spawn.x,
      y: spawn.y,
      cash: 1000,
      jobTitle: "Unemployed",
      avatar,
      lastSeen: Date.now(),
      lastIncomeCheckAt: Date.now(),
      hunger: MAX_HUNGER,
      walkDistance: 0,
    });

    await ctx.db.insert("inventory", {
      playerId,
      item: "supplies",
      quantity: 5,
    });

    await ctx.db.insert("inventory", {
      playerId,
      item: "apple",
      quantity: 2,
    });

    return await ctx.db.get(playerId);
  },
});

export const updatePosition = mutation({
  args: { x: v.number(), y: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");

    if (!Number.isFinite(args.x) || !Number.isFinite(args.y)) {
      throw new Error("Invalid position payload");
    }

    const now = Date.now();
    const elapsedSinceLastSeen = Math.max(0, now - player.lastSeen);

    if (elapsedSinceLastSeen < MIN_POSITION_UPDATE_INTERVAL_MS) {
      return { x: player.x, y: player.y, clamped: true };
    }

    const requested = clampPosition(args.x, args.y);

    const requestedDx = requested.x - player.x;
    const requestedDy = requested.y - player.y;
    const requestedDist = Math.sqrt(
      requestedDx * requestedDx + requestedDy * requestedDy,
    );

    const effectiveElapsedMs = Math.min(
      elapsedSinceLastSeen,
      MAX_MOVEMENT_ELAPSED_MS,
    );
    const maxAllowedDist =
      (MAX_PLAYER_SPEED_PX_PER_SEC * effectiveElapsedMs) / 1000;

    const clampedBySpeed = requestedDist > maxAllowedDist;
    const moveScale =
      clampedBySpeed && requestedDist > 0 ? maxAllowedDist / requestedDist : 1;

    const next = clampPosition(
      player.x + requestedDx * moveScale,
      player.y + requestedDy * moveScale,
    );

    const dx = next.x - player.x;
    const dy = next.y - player.y;
    const distMoved = Math.sqrt(dx * dx + dy * dy);

    let walkDist = (player.walkDistance ?? 0) + distMoved;
    let hunger = player.hunger ?? MAX_HUNGER;

    while (walkDist >= HUNGER_WALK_THRESHOLD && hunger > 0) {
      hunger = Math.max(0, hunger - 1);
      walkDist -= HUNGER_WALK_THRESHOLD;
    }

    const INCOME_CHECK_INTERVAL = 30000;
    let lastIncomeCheck = player.lastIncomeCheckAt ?? 0;

    if (now - lastIncomeCheck > INCOME_CHECK_INTERVAL) {
      await processIncomeCollection(ctx, player);
      lastIncomeCheck = now;
    }

    await ctx.db.patch(player._id, {
      x: next.x,
      y: next.y,
      lastSeen: now,
      hunger,
      walkDistance: walkDist,
      lastIncomeCheckAt: lastIncomeCheck,
    });

    return { x: next.x, y: next.y, clamped: clampedBySpeed };
  },
});
