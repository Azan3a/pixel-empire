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

export default crons;
