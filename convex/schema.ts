import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const taskSchema = {
  taskID: v.string(),
  taskName: v.string(),
  associated_project_id: (v.union(v.string(), v.null())), // The associated project ID
  calendar_settings: v.object({
      isInCalendar: v.boolean(),
      x: v.union(v.string(), v.null()),
      y: v.union(v.string(), v.null())
  })
  // By default should contain _id feature
}

export const projectSchema = {
  projectID: v.string(),
  projectName: v.string(),
  tasks: v.array(v.union(v.string(), v.null())) // Array of task IDs
}

export const userSchema = {
  userID: v.string(),
  username: v.string(),
  token: v.string(),
  tasks: v.array(v.union(v.object(taskSchema), v.null())), // An array of task OBJECTS
  projects: v.array(v.union(v.object(projectSchema),  v.null())) // An array of project OBJECTS
}

export const gptCallSchema = {
  prompt: v.string(),
  result: v.string(),
  usedUserID: v.string(),
  estimatedCost: v.string()
}

// Define the schema
export default defineSchema({
  // Other tables here
  users: defineTable(userSchema),
  gptCalls: defineTable(gptCallSchema)
});
