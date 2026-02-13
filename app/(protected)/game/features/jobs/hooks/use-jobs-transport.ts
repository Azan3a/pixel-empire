// app/(protected)/game/features/jobs/hooks/use-jobs-transport.ts
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Job } from "@game/types/job";

export function useJobsTransport() {
  const rawAvailableJobs = useQuery(api.jobs.getAvailableJobs);
  const availableJobs = (rawAvailableJobs ?? []) as Job[];

  const activeJob = (useQuery(api.jobs.getActiveJob) ?? null) as Job | null;

  const acceptJobMutation = useMutation(api.jobs.acceptJob);
  const pickupParcelMutation = useMutation(api.jobs.pickupParcel);
  const deliverParcelMutation = useMutation(api.jobs.deliverParcel);
  const cancelJobMutation = useMutation(api.jobs.cancelJob);
  const spawnJobsMutation = useMutation(api.jobs.spawnJobs);

  return {
    availableJobs,
    activeJob,
    acceptJobMutation,
    pickupParcelMutation,
    deliverParcelMutation,
    cancelJobMutation,
    spawnJobsMutation,
  };
}
