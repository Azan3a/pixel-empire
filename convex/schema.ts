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
    hunger: v.optional(v.number()), // 0–100, defaults to 100
    walkDistance: v.optional(v.number()), // accumulator for distance-based hunger decay
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
    ownerId: v.optional(v.id("players")),
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    type: v.string(),
  }).index("by_owner", ["ownerId"]),

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
});
