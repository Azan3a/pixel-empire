// convex/players.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { MAX_HUNGER, HUNGER_WALK_THRESHOLD } from "./foodConfig";
import { getSpawnPoint, MAP_SIZE } from "./gameConstants";
import { WATER_LINE_Y } from "./mapZones";
import { processIncomeCollection } from "./economy";

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

      // Sync name if it changed in users table
      if (user?.name && user.name !== existingPlayer.name) {
        patches.name = user.name;
      }

      // Migrate players stuck outside new map boundaries
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

      // Collect pending income on login
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

    // Give new players a starter apple
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

    // ── Clamp position to valid world bounds ──
    const clampedX = Math.max(0, Math.min(MAP_SIZE, args.x));
    const clampedY = Math.max(0, Math.min(WATER_LINE_Y, args.y));

    // ── Calculate distance moved ──
    const dx = clampedX - player.x;
    const dy = clampedY - player.y;
    const distMoved = Math.sqrt(dx * dx + dy * dy);

    // ── Hunger decay from walking ──
    let walkDist = (player.walkDistance ?? 0) + distMoved;
    let hunger = player.hunger ?? MAX_HUNGER;

    while (walkDist >= HUNGER_WALK_THRESHOLD && hunger > 0) {
      hunger = Math.max(0, hunger - 1);
      walkDist -= HUNGER_WALK_THRESHOLD;
    }

    // ── Auto-income collection ──
    const now = Date.now();
    const INCOME_CHECK_INTERVAL = 30000; // Check every 30 seconds
    let lastIncomeCheck = player.lastIncomeCheckAt ?? 0;

    if (now - lastIncomeCheck > INCOME_CHECK_INTERVAL) {
      await processIncomeCollection(ctx, player);
      lastIncomeCheck = now;
    }

    await ctx.db.patch(player._id, {
      x: clampedX,
      y: clampedY,
      lastSeen: now,
      hunger,
      walkDistance: walkDist,
      lastIncomeCheckAt: lastIncomeCheck,
    });
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    return players.sort((a, b) => b.cash - a.cash).slice(0, 10);
  },
});

export const getAlivePlayers = query({
  args: {},
  handler: async (ctx) => {
    const threshold = Date.now() - 10000;
    return await ctx.db
      .query("players")
      .filter((q) => q.gt(q.field("lastSeen"), threshold))
      .collect();
  },
});

export const getPlayerInfo = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) return null;

    const allPlayers = await ctx.db.query("players").collect();
    const sorted = allPlayers.sort((a, b) => b.cash - a.cash);
    const rank = sorted.findIndex((p) => p._id === player._id) + 1;
    const total = allPlayers.length;

    const inventory = await ctx.db
      .query("inventory")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .collect();

    // Count owned properties
    const ownerships = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .collect();

    return {
      ...player,
      hunger: player.hunger ?? MAX_HUNGER,
      walkDistance: player.walkDistance ?? 0,
      equippedClothing: player.equippedClothing ?? {},
      inventory,
      rank,
      total,
      ownedPropertyCount: ownerships.length,
    };
  },
});
