// /comvex/schema.ts
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
});
