import { v } from "convex/values"
import { query, mutation, action, internalMutation, internalQuery } from "./_generated/server"
import { api, internal } from "./_generated/api"
import { GenericActionCtx } from "convex/server";

export const does_username_exist = query({
    args: {
        userName: v.string()
    },
    handler: async (ctx, args) => {
        // Check if the username already exists
        const sameUsernames = await ctx.db.query("users").filter((q) => q.eq(q.field("username"), args.userName)).collect()
        return (sameUsernames.length == 0)
    }
});

export const does_userid_exist = query({
    args: {
        userID: v.string()
    },
    handler: async (ctx, args) => {
        // Check if the username already exists
        const sameUsernames = await ctx.db.query("users").filter((q) => q.eq(q.field("userID"), args.userID)).collect()
        return (sameUsernames.length == 0)
    }
});

export const fetch_task_by_id = query({
    args: {
        taskID: v.string()
    },

    handler: async (ctx, args) => {
        const allUsers = await ctx.db.query("users").collect()
        for (let i = 0; i < allUsers.length; i++) {
            for (let j = 0; j < allUsers[i].tasks.length; j++) {
                if (allUsers[i].tasks[j]?.taskID == args.taskID)
                    return allUsers[i].tasks[j];
            }
        }
        return null;
    },
})

export const fetch_project_by_id = query({
    args: {
        projectID: v.string()
    },

    handler: async (ctx, args) => {
        const allUsers = await ctx.db.query("users").collect()
        for (let i = 0; i < allUsers.length; i++) {
            for (let j = 0; j < allUsers[i].projects.length; j++) {
                if (allUsers[i].projects[j]?.projectID == args.projectID)
                    return allUsers[i].projects[j];
            }
        }
        return null;
    },
})

export function generate_random_string(n: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
  
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
  
    return randomString;
  }
  
export const get_user_from_token = query({
    args: {
        userToken: v.string()
    },
    handler: async (ctx, args) => {
        const userList = (await ctx.db.query("users").filter((q) => q.eq(q.field("token"), args.userToken)).collect())
        if (userList.length > 0) return userList[0]
        else return "ERROR";
    }
})

export const internal_get_user_from_token = internalQuery({
    args: {
        userToken: v.string()
    },
    handler: async (ctx, args) => {
        const userList = (await ctx.db.query("users").filter((q) => q.eq(q.field("token"), args.userToken)).collect())
        if (userList.length > 0) return userList[0]
        else return "ERROR";    
    }
})