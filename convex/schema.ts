import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  players: defineTable({
    userId: v.id("users"),
    name: v.string(),
    x: v.number(),
    y: v.number(),
    gold: v.number(),
    avatar: v.string(), // e.g., "avatar1", "avatar2"
    lastSeen: v.number(),
  }).index("by_userId", ["userId"]),

  inventory: defineTable({
    playerId: v.id("players"),
    item: v.string(), // "wood", "stone", "ore"
    quantity: v.number(),
  }).index("by_player", ["playerId"]),

  world_nodes: defineTable({
    type: v.string(), // "tree", "rock", "ore_deposit"
    x: v.number(),
    y: v.number(),
    health: v.number(),
    respawnAt: v.optional(v.number()), // Unix timestamp or null if active
  }).index("by_location", ["x", "y"]),

  numbers: defineTable({
    value: v.number(),
  }),
});
