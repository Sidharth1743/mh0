import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
                revealedUserIds: [], // Added for new schema
            });

            // Update users
            await ctx.db.patch(args.userId, { isMatching: false });
            await ctx.db.patch(potential._id, { isMatching: false });

            return matchId;
        }
        return null;
    },
});

export const linkSupabaseAccount = mutation({
    args: { userId: v.id("users"), supabaseUid: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { supabaseUid: args.supabaseUid });
    },
});

export const getMatch = query({
    args: { matchId: v.id("matches") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.matchId);
    },
});

export const toggleReveal = mutation({
    args: { matchId: v.id("matches"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.matchId);
        if (!match) throw new Error("Match not found");

        const revealed = match.revealedUserIds || [];
        if (revealed.includes(args.userId)) {
            // Un-reveal
            await ctx.db.patch(args.matchId, {
                revealedUserIds: revealed.filter(id => id !== args.userId)
            });
        } else {
            // Reveal
            await ctx.db.patch(args.matchId, {
                revealedUserIds: [...revealed, args.userId]
            });
        }
    },
});

export const getMyMatch = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const match = await ctx.db
            .query("matches")
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        // Filter in memory for simplicity (or add index later if needed)
        const myMatch = match.find(m => m.userIds.includes(args.userId));
        return myMatch ? myMatch._id : null;
    },
});

export const leaveMatch = mutation({
    args: { matchId: v.id("matches"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.matchId);
        if (!match) return; // Already gone

        // Mark match as ended so it stops showing up
        await ctx.db.patch(args.matchId, { status: "ended" });
    },
});

export const cancelAllActiveMatches = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const matches = await ctx.db
            .query("matches")
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        const myMatches = matches.filter(m => m.userIds.includes(args.userId));

        for (const m of myMatches) {
            await ctx.db.patch(m._id, { status: "ended" });
        }
    },
});

export const getOnlineUsers = query({
    args: {},
    handler: async (ctx) => {
        // Count users who are currently looking for a match
        const matchingUsers = await ctx.db
            .query("users")
            .withIndex("by_matching", (q) => q.eq("isMatching", true))
            .collect();

        return matchingUsers.length;
    },
});
