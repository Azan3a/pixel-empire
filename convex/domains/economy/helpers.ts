import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { INCOME_COOLDOWN_MS } from "../../config/gameConstants";

export async function processIncomeCollection(
  ctx: MutationCtx,
  player: Doc<"players">,
): Promise<{ totalIncome: number; propertiesCollected: number }> {
  const ownerships = await ctx.db
    .query("propertyOwnership")
    .withIndex("by_player", (q) => q.eq("playerId", player._id))
    .collect();

  if (ownerships.length === 0) {
    return { totalIncome: 0, propertiesCollected: 0 };
  }

  const now = Date.now();
  let totalIncome = 0;
  let propertiesCollected = 0;

  for (const ownership of ownerships) {
    const elapsed = now - ownership.lastCollectedAt;
    if (elapsed < INCOME_COOLDOWN_MS) continue;

    const cycles = Math.floor(elapsed / INCOME_COOLDOWN_MS);
    if (cycles === 0) continue;

    const prop = await ctx.db.get(ownership.propertyId);
    if (!prop) continue;

    const incomePerCycle = Math.round(prop.income * ownership.level);
    const earned = incomePerCycle * cycles;

    totalIncome += earned;
    propertiesCollected++;

    await ctx.db.patch(ownership._id, {
      lastCollectedAt: ownership.lastCollectedAt + cycles * INCOME_COOLDOWN_MS,
      totalEarned: (ownership.totalEarned ?? 0) + earned,
    });
  }

  if (totalIncome > 0) {
    await ctx.db.patch(player._id, { cash: player.cash + totalIncome });
  }

  return { totalIncome, propertiesCollected };
}
