// hooks/use-jobs.ts
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useEffect, useRef, useMemo } from "react";
import { Job } from "@game/types/job";
import { getZoneAt, ZONES } from "@/convex/map/zones";

export function useJobs() {
  const rawAvailableJobs = useQuery(api.jobs.getAvailableJobs);
  const availableJobs = useMemo(
    () => (rawAvailableJobs ?? []) as Job[],
    [rawAvailableJobs],
  );
  const activeJob = (useQuery(api.jobs.getActiveJob) ?? null) as Job | null;

  const acceptJobMutation = useMutation(api.jobs.acceptJob);
  const pickupParcelMutation = useMutation(api.jobs.pickupParcel);
  const deliverParcelMutation = useMutation(api.jobs.deliverParcel);
  const cancelJobMutation = useMutation(api.jobs.cancelJob);
  const spawnJobsMutation = useMutation(api.jobs.spawnJobs);

  // Auto-spawn jobs when board is low
  const hasSpawned = useRef(false);
  useEffect(() => {
    if (availableJobs.length < 3 && !hasSpawned.current) {
      hasSpawned.current = true;
      spawnJobsMutation()
        .catch(() => {}) // silent — idempotent
        .finally(() => {
          setTimeout(() => {
            hasSpawned.current = false;
          }, 30000);
        });
    }
  }, [availableJobs.length, spawnJobsMutation]);

  const acceptJob = async (jobId: Id<"jobs">) => {
    try {
      await acceptJobMutation({ jobId });
      toast.success("Job accepted! Head to the pickup location.");
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to accept job";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const pickupParcel = async (jobId: Id<"jobs">) => {
    try {
      await pickupParcelMutation({ jobId });
      toast.success("Parcel picked up! Now deliver it.");
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to pick up parcel";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const deliverParcel = async (jobId: Id<"jobs">) => {
    try {
      const res = await deliverParcelMutation({ jobId });
      if (res && typeof res === "object" && "earned" in res) {
        toast.success(`Delivered! Earned $${res.earned}`);
      }
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to deliver parcel";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const cancelJob = async (jobId: Id<"jobs">) => {
    try {
      await cancelJobMutation({ jobId });
      toast.info("Job cancelled.");
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to cancel job";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  /** Get zone info for the active job's current target */
  const activeJobZoneInfo = useMemo(() => {
    if (!activeJob) return null;

    const pickupZoneId = getZoneAt(activeJob.pickupX, activeJob.pickupY);
    const dropoffZoneId = getZoneAt(activeJob.dropoffX, activeJob.dropoffY);

    return {
      pickupZone: pickupZoneId ? ZONES[pickupZoneId] : null,
      dropoffZone: dropoffZoneId ? ZONES[dropoffZoneId] : null,
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
        pickupZone: pickupZoneId ? ZONES[pickupZoneId] : null,
        dropoffZone: dropoffZoneId ? ZONES[dropoffZoneId] : null,
        isCrossZone: pickupZoneId !== dropoffZoneId,
        distance,
      };
    });
  }, [availableJobs]);

  return {
    availableJobs,
    enrichedJobs,
    activeJob,
    activeJobZoneInfo,
    acceptJob,
    pickupParcel,
    deliverParcel,
    cancelJob,
  };
}
