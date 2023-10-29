import { v } from "convex/values"
import { query, mutation, action, internalMutation } from "./_generated/server"
import { api, internal } from "./_generated/api"
import { GenericActionCtx } from "convex/server";
import {does_userid_exist, internal_get_user_from_token, does_username_exist, generate_random_string, fetch_task_by_id, get_user_from_token} from './helpers'
import {taskSchema, userSchema, projectSchema} from './schema'

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.


const openAIConfig = {
  api_endpoint: `https://api.openai.com/v1/chat/completions`, // Use this endpoint for GPT 3.5 and GPT 4.0
  api_model: `gpt-3.5-turbo`,
  system_message: `You comply to all requests directly, efficiently, with a consistent formatting.`,
  api_key: '' // Insert API key here
}

async function callGPT(prompt: string, systemMsg=openAIConfig.system_message) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: openAIConfig.api_model,
        messages: [
          {
            role: 'system',
            content: systemMsg,
          },
          {
            role: 'system',
            content: prompt,
          },
        ],
      }),
    };
    let data = await fetch(openAIConfig.api_endpoint, requestOptions)    
    .catch((error) => {
      console.log((`[OPENAI] Error! Read below: `));
      if (error.response) {
          console.log((`Response Error`));
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log((`No Response Recieved Error`));
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          console.log((`Other Error`));
          // Something happened in setting up the request that triggered an Error
          console.log(`Error`, error.message);
        }
        console.log(error.config);
      return "ERROR!";
    });
    if (typeof data !== "string") (<Response> data) = await data.json()
    // console.log((typeof data == "string") ? data : JSON.stringify(data))
    return data
}

export const patchGPTUseInfo = internalMutation({
  args: {
    prompt: v.string(),
    result: v.string(),
    userID: v.string(),
    cost: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("gptCalls", { prompt: args.prompt, result: args.result, usedUserID: args.userID, estimatedCost: args.cost}); 
  }
});

export const callGPTonPrompt = action({
  args: {
    prompt: v.string(),
    token: v.string()
  },
  handler: async (ctx, args) => {

    const aiResp = await callGPT(args.prompt);
    let result = null;
    if (typeof aiResp == "string") {
      result = "ERROR!"
    } else {
      // console.log(JSON.stringify(aiResp))
      result = (<any> aiResp).choices[0].message.content
    }

    const user = (await ctx.runQuery(internal.helpers.internal_get_user_from_token, {
      userToken: args.token
    }));
    if (typeof user == "string") return "ERROR: Invalid Token";
    const userID = user.userID

    // We will update this as things get crowded
    await ctx.runMutation(internal.myFunctions.patchGPTUseInfo, {
        prompt: args.prompt,
        userID: userID,
        result: result,
        cost: (result == "ERROR!") ? "0" : `${((0.0015/1000) * (<any> aiResp).usage.prompt_tokens) + ((0.002 / 1000) * (<any> aiResp).usage.completion_tokens)}`
      });
    return result
  }
});

export const login = mutation({
  args: {
    username: v.string()
  },
  handler: async (ctx, args) => {
      // Check if the username already exists
      if (await does_username_exist(ctx, {userName: args.username})) {
        // TEMP: return the user
        return (await ctx.db.query("users").filter((q) => q.eq(q.field("username"), args.username)).collect())
      }
      // Returns the user ID
      const user = {
        tasks: [],
        token: generate_random_string(15),
        projects: [],
        username: args.username,
        userID: generate_random_string(10)
      };
      await ctx.db.insert("users", user);
      return user;
  }
});

export const create_default_user = mutation({
  args: {},
  handler: async(ctx) => {
    if (!await does_username_exist(ctx, {userName: "system"})) await ctx.db.insert("users", {
      userID: "1",
      username: "system",
      token: "systemtoken1234",
      tasks: [], // An array of task OBJECTS
      projects: [] // An array of project OBJECTS
    });
  }
});

export const create_new_project = mutation({
  args: {
    token: v.string(),
    projectName: v.string(),
    taskIDArr: v.array(v.union(v.string(), v.null())) // Leave empty if no tasks in project yet
  },
  handler: async (ctx, args) => {
    const projectID = generate_random_string(10)
    // Get the user and add the project into the user
    const user = await get_user_from_token(ctx, {userToken: args.token});
    if (typeof user == "string") return "ERROR: Invalid Token";

    user.projects.push({
      "projectID": projectID,
      "projectName": args.projectName,
      "tasks": args.taskIDArr
    });

    // Patch the user
    await ctx.db.patch(user._id, user);

    // Return the new user
    return user
  }
});

export const create_new_task = mutation({
  args: {
    taskName: v.string(),
    token: v.string(),
    associated_project_id: (v.union(v.string(), v.null()))
  },
  handler: async(ctx, args) => {
    const user = await get_user_from_token(ctx, {userToken: args.token});
    if (typeof user == "string") return "ERROR: Invalid Token";
    if (args.associated_project_id !== null && user.projects.filter(t => t?.projectID == args.associated_project_id).length == 0) {
      return "ERROR: Your account does not own the project ID you want to link";
    }
    const taskID = generate_random_string(10);
    user.tasks.push({
      taskID: taskID,
      taskName: args.taskName,
      associated_project_id: args.associated_project_id,
      calendar_settings: {
        isInCalendar: false,
        x: null,
        y: null
      }
    });

    for (let i = 0; i < user.projects.length; i++) {
      if (user.projects[i]?.projectID == args.associated_project_id) {
        user.projects[i]?.tasks.push(taskID)
      }
    }
    // Patch the new task into the user
    await ctx.db.patch(user._id, user);

    // Return the new user
    return user;
  }
});

// This will also remove the task from another project if the task is reassigned
// It will update the task as well
export const link_task_to_project = mutation({
  args: {
    token: v.string(),
    taskIDToLink: v.string(),
    projectIDToLink: v.string()
  },

  handler: async(ctx, args) => {
    const user = await get_user_from_token(ctx, {userToken: args.token});
    if (typeof user == "string") return "ERROR: Invalid Token";
    if (user.projects.filter(p => p?.projectID == args.projectIDToLink).length == 0 || user.tasks.filter(t => t?.taskID == args.taskIDToLink).length == 0) {
      return "ERROR: Your account does not own either the project ID or task ID listed, or the task id / project id does not exist.";
    }

    for (let i = 0; i < user.projects.length; i++) {
      if (user.projects[i]?.projectID == args.projectIDToLink &&! user.projects[i]?.tasks.includes(args.taskIDToLink)) {
        user.projects[i]?.tasks.push(args.taskIDToLink);
      }
      else if (user.projects[i]?.projectID !== args.projectIDToLink && user.projects[i]?.tasks.includes(args.taskIDToLink)) {
        user.projects[i]?.tasks.splice((<string[]> user.projects[i]?.tasks).indexOf(args.taskIDToLink), 1);
      }
    }

    for (let i = 0; i < user.tasks.length; i++) {
      if (user.tasks[i]?.taskID == args.taskIDToLink) {
        (<any> user.tasks[i]).associated_project_id = args.projectIDToLink;
      }
    }

    await ctx.db.patch(user._id, user);
    return user;
  }
})

export const patch_task = mutation({
  args: {
    token: v.string(),
    taskID: v.string(),
    newTaskObj: v.object(taskSchema) // An entire new task OBJ to replace the old one
  },
  handler: async(ctx, args) => {
    let taskUpdated = false;
    const user = await get_user_from_token(ctx, {userToken: args.token});
    if (typeof user == "string") return "ERROR: Invalid Token";
    for (let i = 0; i < user.tasks.length; i++) {
      if (user.tasks[i]?.taskID == args.taskID) {
        user.tasks[i] = args.newTaskObj
        taskUpdated = true;
      }
    }
    await ctx.db.patch(user._id, user);
    return user
  }
});

export const patch_project = mutation({
  args: {
    token: v.string(),
    projectID: v.string(),
    newProjectObj: v.object(projectSchema) // An entire new project OBJ to replace the old one
  },
  handler: async(ctx, args) => {
    let taskUpdated = false;
    const user = await get_user_from_token(ctx, {userToken: args.token});
    if (typeof user == "string") return "ERROR: Invalid Token";

    for (let i = 0; i < user.tasks.length; i++) {
      if (user.projects[i]?.projectID == args.projectID) {
        user.projects[i] = args.newProjectObj
        taskUpdated = true;
      }
    }
    await ctx.db.patch(user._id, user);
    return user
  }
});

export const delete_project = mutation({
  args: {
    token: v.string(),
    projectID: v.string()
  },
  handler: async(ctx, args) => {
    const user = await get_user_from_token(ctx, {userToken: args.token});
    if (typeof user == "string") return "ERROR: Invalid Token";
    if (user.projects.filter(p => p?.projectID == args.projectID).length == 0) {
      return "ERROR: Your account does not own the project ID listed, or the project id was not fonud.";
    }

    const newProjects = []
    for (let i = 0; i < user.projects.length; i++) {
      if(user.projects[i]?.projectID !== args.projectID) {
        newProjects.push(user.projects[i])
      }
    }
    user.projects = newProjects;

    // Remove all the links from the task
    for (let i = 0; i < user.tasks.length; i++) {
      if (user.tasks[i]?.associated_project_id == args.projectID) {
        (<any> user.tasks[i]).associated_project_id = null;
      }
    }
    await ctx.db.patch(user._id, user);
    return user;
  }
});

export const delete_task = mutation({
  args: {
    token: v.string(),
    taskID: v.string()
  },
  handler: async(ctx, args) => {
    const user = await get_user_from_token(ctx, {userToken: args.token});
    if (typeof user == "string") return "ERROR: Invalid Token";
    if (user.tasks.filter(t => t?.taskID == args.taskID).length == 0) {
      return "ERROR: Your account does not own the task ID listed, or the task id was not fonud.";
    }

    const newTasks = [];
    for (let i = 0; i < user.tasks.length; i++) {
      if(user.tasks[i]?.taskID !== args.taskID) {
        newTasks.push(user.tasks[i]);
      }
    }
    user.tasks = newTasks;

    for (let i = 0; i < user.projects.length; i++) {
      if (user.projects[i]?.tasks.includes(args.taskID)) {
        (<any> user.projects[i]).tasks =  (<any> user.projects[i]).tasks.filter((t: { taskID: string; }) => t.taskID !== args.taskID);
        break;
      }
    }

    await ctx.db.patch(user._id, user);
    return user;
  }
});

export const fetch_user_from_token = query({
  args: {
    token: v.string()
  },
  handler: async(ctx, args) => {
    return (await get_user_from_token(ctx,{userToken: args.token}));
  }
})