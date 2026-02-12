// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Cleanup abandoned/stale jobs every 5 minutes
crons.interval(
  "cleanup stale jobs",
  { minutes: 5 },
  internal.jobs.cleanupStaleJobs,
);

// Ensure there are always enough jobs every 2 minutes
crons.interval("spawn jobs", { minutes: 2 }, internal.jobs.spawnJobsInternal);

// Grow trees every 2 minutes
crons.interval("grow trees", { minutes: 2 }, internal.trees.growTrees);

// Respawn new seedlings every 5 minutes (keeps forest populated)
crons.interval("spawn trees", { minutes: 5 }, internal.trees.spawnNewTrees);

export default crons;
