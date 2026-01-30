import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMatchTasks = query({
    args: { matchId: v.id("matches") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tasks")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
            .collect();
    },
});

export const getMessages = query({
    args: { matchId: v.id("matches") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))  // Or "by_match_time_desc"
            .collect();
    },
});

export const sendMessage = mutation({
    args: { matchId: v.id("matches"), senderId: v.id("users"), text: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            matchId: args.matchId,
            senderId: args.senderId,
            text: args.text,
            type: "text",
            createdAt: Date.now(),
        });
    },
});

export const addTaskItem = mutation({
    args: { matchId: v.id("matches"), text: v.string(), userId: v.id("users") },
    handler: async (ctx, args) => {
        let task = await ctx.db
            .query("tasks")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
            .first();

        if (!task) {
            const taskId = await ctx.db.insert("tasks", {
                matchId: args.matchId,
                type: "shared_list",
                title: "Initial Task",
                description: "Collaborative list building",
                data: { items: [] },
                completedByIds: [],
            });
            task = await ctx.db.get(taskId);
        }

        if (task) {
            const items = task.data?.items || [];
            await ctx.db.patch(task._id, {
                data: {
                    ...task.data,
                    items: [...items, {
                        id: Date.now().toString(),
                        text: args.text,
                        userId: args.userId,
                        timestamp: "Just now"
                    }]
                }
            });
        }
    },
});

export const completePhase = mutation({
    args: { matchId: v.id("matches"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.matchId);
        if (!match) throw new Error("Match not found");

        await ctx.db.patch(args.matchId, {
            matchLevel: (match.matchLevel || 1) + 1
        });

        // Clear tasks for next phase or handle phase transition
        const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
            .collect();

        for (const task of tasks) {
            await ctx.db.patch(task._id, {
                data: { items: [] } // Reset items for next phase in this simple model
            });
        }
    },
});
