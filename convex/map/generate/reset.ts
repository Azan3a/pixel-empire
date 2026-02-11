// convex/map/generate/reset.ts
// Wipes game-state tables so the world can be re-seeded cleanly.

import type { MutationCtx } from "../../_generated/server";

/** Table names that get wiped on a full world reset */
const RESET_TABLES = [
  "propertyOwnership",
  "properties",
  "inventory",
  "jobs",
] as const;

/**
 * Delete every row from the game-state tables.
 * Auth / user tables are deliberately left intact.
 */
export async function wipeGameState(ctx: MutationCtx): Promise<void> {
  for (const table of RESET_TABLES) {
    const rows = await ctx.db.query(table).collect();
    for (const row of rows) {
      await ctx.db.delete(row._id);
    }
  }
}
