// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  players: defineTable({
    userId: v.id("users"),
    name: v.string(),
    x: v.number(),
    y: v.number(),
    cash: v.number(),
    jobTitle: v.string(),
    avatar: v.string(),
    lastSeen: v.number(),
    lastIncomeCheckAt: v.optional(v.number()),
    hunger: v.optional(v.number()),
    walkDistance: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  inventory: defineTable({
    playerId: v.id("players"),
    item: v.string(),
    quantity: v.number(),
  }).index("by_player", ["playerId"]),

  properties: defineTable({
    name: v.string(),
    price: v.number(),
    income: v.number(),
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    category: v.string(), // "residential" | "commercial" | "service" | "shop"
    subType: v.string(), // "house" | "duplex" | "bank" | "food_shop" | etc.
    zoneId: v.string(), // "downtown" | "suburbs" | "industrial" | etc.
    maxOwners: v.number(), // 0 = not ownable (service buildings)
  })
    .index("by_zone", ["zoneId"])
    .index("by_category", ["category"]),

  propertyOwnership: defineTable({
    propertyId: v.id("properties"),
    playerId: v.id("players"),
    level: v.number(), // upgrade level (1 = base)
    purchasedAt: v.number(),
    lastCollectedAt: v.number(), // last income collection timestamp
    totalEarned: v.optional(v.number()), // Total income earned from this property
  })
    .index("by_property", ["propertyId"])
    .index("by_player", ["playerId"])
    .index("by_player_property", ["playerId", "propertyId"]),

  jobs: defineTable({
    type: v.string(),
    status: v.string(),
    playerId: v.optional(v.id("players")),
    reward: v.number(),
    pickupX: v.number(),
    pickupY: v.number(),
    dropoffX: v.number(),
    dropoffY: v.number(),
    pickupName: v.string(),
    dropoffName: v.string(),
    title: v.string(),
    acceptedAt: v.optional(v.number()),
    pickedUpAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_player", ["playerId"])
    .index("by_player_status", ["playerId", "status"]),

  worldConfig: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
