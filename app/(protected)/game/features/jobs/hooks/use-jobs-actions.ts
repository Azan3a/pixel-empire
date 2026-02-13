// app/(protected)/game/features/jobs/hooks/use-jobs-actions.ts
"use client";

import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { getUserFacingErrorMessage } from "@game/shared/utils/error-handling";

interface JobsActionMutations {
  acceptJobMutation: (args: { jobId: Id<"jobs"> }) => Promise<unknown>;
  pickupParcelMutation: (args: { jobId: Id<"jobs"> }) => Promise<unknown>;
  deliverParcelMutation: (args: { jobId: Id<"jobs"> }) => Promise<unknown>;
  cancelJobMutation: (args: { jobId: Id<"jobs"> }) => Promise<unknown>;
}

export function useJobsActions(mutations: JobsActionMutations) {
  const {
    acceptJobMutation,
    pickupParcelMutation,
    deliverParcelMutation,
    cancelJobMutation,
  } = mutations;

  const acceptJob = async (jobId: Id<"jobs">) => {
    try {
      await acceptJobMutation({ jobId });
      toast.success("Job accepted! Head to the pickup location.");
      return { success: true };
    } catch (e: unknown) {
      const msg = getUserFacingErrorMessage(e, "Failed to accept job");
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
      const msg = getUserFacingErrorMessage(e, "Failed to pick up parcel");
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
      const msg = getUserFacingErrorMessage(e, "Failed to deliver parcel");
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
      const msg = getUserFacingErrorMessage(e, "Failed to cancel job");
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    acceptJob,
    pickupParcel,
    deliverParcel,
    cancelJob,
  };
}
