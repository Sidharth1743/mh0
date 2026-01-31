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
    args: {
        matchId: v.id("matches"),
        senderId: v.id("users"),
        text: v.string(),
        type: v.optional(v.string()) // "text" or "voice"
    },
    handler: async (ctx, args) => {
        console.log(`[SERVER] Sending message in match ${args.matchId} from ${args.senderId}`);
        await ctx.db.insert("messages", {
            matchId: args.matchId,
            senderId: args.senderId,
            text: args.text,
            type: args.type || "text",
            createdAt: Date.now(),
        });
    },
});

export const addTaskItem = mutation({
    args: { matchId: v.id("matches"), text: v.string(), userId: v.id("users") },
    handler: async (ctx, args) => {
        console.log(`[SERVER] Adding task item '${args.text}' to match ${args.matchId}`);
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
                        timestamp: Date.now()
                    }]
                }
            });
        }
    },
});

export const completePhase = mutation({
    args: { matchId: v.id("matches"), userId: v.id("users") },
    handler: async (ctx, args) => {
        console.log(`[SERVER] Completing phase for match ${args.matchId}`);
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

export const initializeTask = mutation({
    args: {
        matchId: v.id("matches"),
        taskId: v.string(),
        type: v.string(),
        title: v.string(),
        items: v.array(v.object({
            id: v.string(),
            text: v.string(),
            userId: v.optional(v.string()),
            timestamp: v.optional(v.union(v.string(), v.number())),
            selected: v.optional(v.boolean())
        }))
    },
    handler: async (ctx, args) => {
        const oldTasks = await ctx.db
            .query("tasks")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
            .collect();

        for (const t of oldTasks) {
            await ctx.db.delete(t._id);
        }

        await ctx.db.insert("tasks", {
            matchId: args.matchId,
            type: args.type,
            title: args.title,
            description: "",
            data: { items: args.items },
            completedByIds: [],
        });
    }
});

export const toggleTaskItem = mutation({
    args: { matchId: v.id("matches"), itemId: v.string(), userId: v.id("users") },
    handler: async (ctx, args) => {
        const task = await ctx.db
            .query("tasks")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
            .first();

        if (task) {
            const items = task.data?.items || [];
            const updatedItems = items.map((item: any) =>
                item.id === args.itemId ? { ...item, selected: !item.selected, lastSelectedBy: args.userId } : item
            );
            await ctx.db.patch(task._id, {
                data: { ...task.data, items: updatedItems }
            });
        }
    }
});

export const updateDeciderScores = mutation({
    args: {
        matchId: v.id("matches"),
        scores: v.object({
            momentum: v.number(),
            resonance: v.number(),
            balance: v.number(),
        })
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.matchId, {
            deciderScores: args.scores
        });
    }
});

export const updateShowdownSelection = mutation({
    args: {
        matchId: v.id("matches"),
        userId: v.id("users"),
        cardIndex: v.number(),
        choice: v.string(),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db
            .query("tasks")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
            .first();

        if (task) {
            const showdownData = task.data?.showdown || {};
            const cardData = showdownData[args.cardIndex] || {};
            cardData[args.userId] = args.choice;

            await ctx.db.patch(task._id, {
                data: {
                    ...task.data,
                    showdown: {
                        ...showdownData,
                        [args.cardIndex]: cardData
                    }
                }
            });
        }
    }
});

export const updateSortingSelection = mutation({
    args: {
        matchId: v.id("matches"),
        userId: v.id("users"),
        itemId: v.string(),
        category: v.string(),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db
            .query("tasks")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
            .first();

        if (task) {
            const sortingData = task.data?.sorting || {};
            const itemData = sortingData[args.itemId] || {};
            itemData[args.userId] = args.category;

            await ctx.db.patch(task._id, {
                data: {
                    ...task.data,
                    sorting: {
                        ...sortingData,
                        [args.itemId]: itemData
                    }
                }
            });
        }
    }
});

export const updateRankingOrder = mutation({
    args: {
        matchId: v.id("matches"),
        userId: v.id("users"),
        itemIds: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db
            .query("tasks")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
            .first();

        if (task) {
            const rankingData = task.data?.ranking || {};
            await ctx.db.patch(task._id, {
                data: {
                    ...task.data,
                    ranking: {
                        ...rankingData,
                        [args.userId]: args.itemIds
                    }
                }
            });
        }
    }
});

export const updateBinaryChoice = mutation({
    args: {
        matchId: v.id("matches"),
        userId: v.id("users"),
        itemId: v.string(),
        choice: v.string(),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db
            .query("tasks")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
            .first();

        if (task) {
            const binaryData = task.data?.binary || {};
            const itemData = binaryData[args.itemId] || {};
            itemData[args.userId] = args.choice;

            await ctx.db.patch(task._id, {
                data: {
                    ...task.data,
                    binary: {
                        ...binaryData,
                        [args.itemId]: itemData
                    }
                }
            });
        }
    }
});
