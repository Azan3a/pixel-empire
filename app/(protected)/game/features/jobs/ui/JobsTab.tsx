// app/(protected)/game/features/jobs/ui/JobsTab.tsx
"use client";

import { Package } from "lucide-react";
import { useJobs } from "../hooks/use-jobs";
import { JobCard } from "./JobCard";
import { ActiveJobView } from "./ActiveJobView";

export function JobsTab() {
  const { enrichedJobs, activeJob, acceptJob, cancelJob } = useJobs();

  if (activeJob) {
    return <ActiveJobView activeJob={activeJob} onCancel={cancelJob} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Package className="size-5 text-muted-foreground" />
            Available Deliveries
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Accept a job to start earning cash. Cross-zone deliveries pay a
            bonus!
          </p>
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">
          {enrichedJobs.length} jobs
        </span>
      </div>

      {enrichedJobs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground italic">
          <span className="text-4xl block mb-3">📭</span>
          No deliveries available right now. Check back soon...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedJobs.map((job) => (
            <JobCard key={job._id} job={job} onAccept={acceptJob} />
          ))}
        </div>
      )}
    </div>
  );
}
