// app/(protected)/game/features/jobs/hooks/use-jobs-selectors.ts
"use client";

import { useMemo } from "react";
import { Job } from "@game/types/job";
import { getZoneAt, ZONES } from "@game/shared/contracts/game-config";

export function useJobsSelectors(availableJobs: Job[], activeJob: Job | null) {
  /** Get zone info for the active job's current target */
  const activeJobZoneInfo = useMemo(() => {
    if (!activeJob) return null;

    const pickupZoneId = getZoneAt(activeJob.pickupX, activeJob.pickupY);
    const dropoffZoneId = getZoneAt(activeJob.dropoffX, activeJob.dropoffY);

    return {
      pickupZone: ZONES[pickupZoneId],
      dropoffZone: ZONES[dropoffZoneId],
      isCrossZone: pickupZoneId !== dropoffZoneId,
    };
  }, [activeJob]);

  /** Enrich available jobs with zone data */
  const enrichedJobs = useMemo(() => {
    return availableJobs.map((job) => {
      const pickupZoneId = getZoneAt(job.pickupX, job.pickupY);
      const dropoffZoneId = getZoneAt(job.dropoffX, job.dropoffY);
      const distance = Math.sqrt(
        (job.dropoffX - job.pickupX) ** 2 + (job.dropoffY - job.pickupY) ** 2,
      );

      return {
        ...job,
        pickupZone: ZONES[pickupZoneId],
        dropoffZone: ZONES[dropoffZoneId],
        isCrossZone: pickupZoneId !== dropoffZoneId,
        distance,
      };
    });
  }, [availableJobs]);

  return {
    enrichedJobs,
    activeJobZoneInfo,
  };
}
