// app/(protected)/game/features/jobs/hooks/use-jobs.ts
"use client";

import { useEffect, useRef } from "react";
import { useJobsTransport } from "./use-jobs-transport";
import { useJobsSelectors } from "./use-jobs-selectors";
import { useJobsActions } from "./use-jobs-actions";

export function useJobs() {
  const transport = useJobsTransport();
  const selectors = useJobsSelectors(
    transport.availableJobs,
    transport.activeJob,
  );
  const actions = useJobsActions(transport);

  // Auto-spawn jobs when board is low
  const hasSpawned = useRef(false);
  useEffect(() => {
    if (transport.availableJobs.length < 3 && !hasSpawned.current) {
      hasSpawned.current = true;
      transport
        .spawnJobsMutation()
        .catch(() => {}) // silent — idempotent
        .finally(() => {
          setTimeout(() => {
            hasSpawned.current = false;
          }, 30000);
        });
    }
  }, [transport]);

  return {
    ...transport,
    ...selectors,
    ...actions,
  };
}
