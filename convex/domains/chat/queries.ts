// convex/domains/chat/queries.ts
import { query } from "../../_generated/server";

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Fetch all chat messages from the last hour, ordered oldest → newest.
 * This is a live query — the UI auto-updates when new messages arrive.
 */
export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - ONE_HOUR_MS;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_sentAt", (q) => q.gte("sentAt", cutoff))
      .order("asc")
      .collect();

    return messages;
  },
});
