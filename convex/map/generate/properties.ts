// convex/map/generate/properties.ts
// Reads fixed zone data and inserts every building into the `properties` table.
// Pure data helper — no mutation wrapper. Called by world.ts mutations.

import type { MutationCtx } from "../../_generated/server";
import { ALL_ZONE_DATA } from "../zones/index";

/**
 * Insert all buildings from all 14 zones into the `properties` table.
 * Returns the count of properties inserted.
 */
export async function seedProperties(ctx: MutationCtx): Promise<number> {
  let count = 0;

  for (const zone of Object.values(ALL_ZONE_DATA)) {
    for (const b of zone.buildings) {
      await ctx.db.insert("properties", {
        name: b.name,
        price: b.basePrice,
        income: b.baseIncome,
        category: b.category,
        subType: b.subType,
        zoneId: zone.id,
        maxOwners: b.maxOwners,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
      });
      count++;
    }
  }

  return count;
}
