import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    nickname: v.string(),
    interests: v.array(v.string()),
    energyLevel: v.string(), // "low", "medium", "high"
    availability: v.string(), // "10min", "30min", "today", "weekend"
    trustLevel: v.number(), // 1, 2, 3, 4
    deviceId: v.string(), // For anonymous auth
    isMatching: v.boolean(),
    supabaseUid: v.optional(v.string()),
  }).index("by_deviceId", ["deviceId"])
    .index("by_supabaseUid", ["supabaseUid"])
    .index("by_matching", ["isMatching", "energyLevel", "availability"]),

  matches: defineTable({
    userIds: v.array(v.id("users")),
    status: v.string(), // "active", "completed", "cancelled"
    activeTaskId: v.optional(v.id("tasks")),
    matchLevel: v.number(),
    revealedUserIds: v.array(v.id("users")),
    deciderScores: v.optional(v.object({
      momentum: v.number(),
      resonance: v.number(),
      balance: v.number(),
    })),
  }),

  tasks: defineTable({
    matchId: v.id("matches"),
    type: v.string(), // "shared_list", "riddle", "voice"
    title: v.string(),
    description: v.string(),
    data: v.any(), // Flexible storage for task content (e.g., the items in the list)
    completedByIds: v.array(v.id("users")),
  }).index("by_match", ["matchId"]),

  messages: defineTable({
    matchId: v.id("matches"),
    senderId: v.id("users"),
    text: v.string(),
    type: v.string(), // "text", "voice"
    createdAt: v.number(),
  }).index("by_match", ["matchId"])
    .index("by_match_time", ["matchId", "createdAt"]),
});
