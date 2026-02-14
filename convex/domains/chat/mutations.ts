// convex/domains/chat/mutations.ts
import { mutation, internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const MAX_MESSAGE_LENGTH = 280;
const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Send a chat message as the authenticated player.
 */
export const sendMessage = mutation({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");

    // Sanitize & validate
    const trimmed = args.message.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`,
      );
    }

    const messageId = await ctx.db.insert("chatMessages", {
      playerId: player._id,
      playerName: player.name,
      message: trimmed,
      type: "chat",
      sentAt: Date.now(),
    });

    return messageId;
  },
});

/**
 * Post a system or activity message (called from other server-side functions).
 * This is an internal mutation — not callable from the client.
 */
export const postSystemMessage = internalMutation({
  args: {
    playerId: v.id("players"),
    playerName: v.string(),
    message: v.string(),
    type: v.union(v.literal("system"), v.literal("activity")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chatMessages", {
      playerId: args.playerId,
      playerName: args.playerName,
      message: args.message,
      type: args.type,
      sentAt: Date.now(),
    });
  },
});

/**
 * Delete all messages older than 1 hour. Called by cron.
 */
export const cleanupOldMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - ONE_HOUR_MS;

    const oldMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_sentAt", (q) => q.lt("sentAt", cutoff))
      .collect();

    for (const msg of oldMessages) {
      await ctx.db.delete(msg._id);
    }

    return { deleted: oldMessages.length };
  },
});
