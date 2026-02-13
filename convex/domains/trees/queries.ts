import { query } from "../../_generated/server";

export const getForestTrees = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("trees")
      .withIndex("by_zone", (q) => q.eq("zoneId", "forest"))
      .collect();
  },
});
