import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const getOrCreateUser = mutation({
    args: { deviceId: v.string(), nickname: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
            .unique();
        if (existing) return existing._id;
        return await ctx.db.insert("users", {
            deviceId: args.deviceId,
            nickname: args.nickname,
            interests: [],
            energyLevel: "medium",
            availability: "30min",
            trustLevel: 1,
            isMatching: false,
        });
    },
});

export const updateUserPrefs = mutation({
    args: {
        userId: v.id("users"),
        interests: v.array(v.string()),
        energyLevel: v.string(),
        availability: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            interests: args.interests,
            energyLevel: args.energyLevel,
            availability: args.availability,
            isMatching: true,
        });
    },
});

export const findMatch = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        // Simple matching: find another user with same energy and availability who is matching
        const potential = await ctx.db
            .query("users")
            .withIndex("by_matching", (q) =>
                q.eq("isMatching", true)
                    .eq("energyLevel", user.energyLevel)
                    .eq("availability", user.availability)
            )
            .filter((q) => q.neq(q.field("_id"), args.userId))
            .first();

        if (potential) {
            // Create match
            const matchId = await ctx.db.insert("matches", {
                userIds: [args.userId, potential._id],
                status: "active",
                matchLevel: 1,
            });

            // Update users
            await ctx.db.patch(args.userId, { isMatching: false });
            await ctx.db.patch(potential._id, { isMatching: false });

            return matchId;
        }
        return null;
    },
});
