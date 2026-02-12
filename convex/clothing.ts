// convex/clothing.ts
import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { CLOTHING_ITEMS, ClothingType } from "./clothingConfig";
import { SHOP_INTERACT_RADIUS } from "./gameConstants";

export const buyClothing = mutation({
  args: {
    itemKey: v.string(),
    shopPropertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    // Validate shop
    const shop = await ctx.db.get(args.shopPropertyId);
    if (!shop) throw new ConvexError("Shop not found");
    if (shop.category !== "shop" || shop.subType !== "clothing_store") {
      throw new ConvexError("This building is not a clothing store");
    }

    // Proximity check
    const centerX = shop.x + shop.width / 2;
    const centerY = shop.y + shop.height / 2;
    const distance = Math.sqrt(
      (centerX - player.x) ** 2 + (centerY - player.y) ** 2,
    );
    if (distance > SHOP_INTERACT_RADIUS) {
      throw new ConvexError("You are too far from the shop");
    }

    const item = CLOTHING_ITEMS[args.itemKey as ClothingType];
    if (!item) throw new ConvexError("Unknown clothing item");

    // Owner discount
    const ownership = await ctx.db
      .query("propertyOwnership")
      .withIndex("by_player_property", (q) =>
        q.eq("playerId", player._id).eq("propertyId", args.shopPropertyId),
      )
      .unique();

    const price = ownership ? Math.floor(item.price * 0.5) : item.price;

    if (player.cash < price) {
      throw new ConvexError(`Not enough cash. Need $${price}`);
    }

    // Deduct cash
    await ctx.db.patch(player._id, { cash: player.cash - price });

    // Upsert inventory
    const existing = await ctx.db
      .query("inventory")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .filter((q) => q.eq(q.field("item"), item.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { quantity: existing.quantity + 1 });
    } else {
      await ctx.db.insert("inventory", {
        playerId: player._id,
        item: item.key,
        quantity: 1,
      });
    }

    return { name: item.name, emoji: item.emoji, newCash: player.cash - price };
  },
});

export const equipClothing = mutation({
  args: { itemKey: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const item = CLOTHING_ITEMS[args.itemKey as ClothingType];
    if (!item) throw new ConvexError("Unknown clothing item");

    // Check inventory
    const invItem = await ctx.db
      .query("inventory")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .filter((q) => q.eq(q.field("item"), item.key))
      .first();

    if (!invItem || invItem.quantity <= 0) {
      throw new ConvexError(`You don't own a ${item.name}`);
    }

    // Update equipped clothing
    const current = player.equippedClothing ?? {};
    await ctx.db.patch(player._id, {
      equippedClothing: { ...current, [item.slot]: item.key },
    });

    return { name: item.name, emoji: item.emoji, slot: item.slot };
  },
});

export const unequipClothing = mutation({
  args: { slot: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new ConvexError("Player not found");

    const newEquipped = { ...(player.equippedClothing ?? {}) };
    delete newEquipped[args.slot as keyof typeof newEquipped];

    await ctx.db.patch(player._id, {
      equippedClothing: newEquipped,
    });

    return { slot: args.slot };
  },
});
