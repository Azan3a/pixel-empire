import { internalMutation } from "../../_generated/server";
import {
  MAX_FOREST_TREES,
  TREE_GROWTH_STAGES,
  TreeGrowthStage,
} from "../../config/treeConfig";
import { getNextStage, placeTrees } from "./helpers";

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
