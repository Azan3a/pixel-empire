"use client";

import { useJobs } from "@game/hooks/use-jobs";
import { Button } from "@/components/ui/button";
import {
  Package,
  MapPin,
  Navigation,
  DollarSign,
  X,
  Truck,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function JobsTab() {
  const { availableJobs, activeJob, acceptJob, cancelJob } = useJobs();

  // ── Active job view ──
  if (activeJob) {
    const isPickup = activeJob.status === "accepted";
    const isDelivery = activeJob.status === "picked_up";

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="size-6 text-primary" />
            <div>
              <h3 className="text-lg font-bold">Active Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Complete your current delivery to earn the reward.
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => cancelJob(activeJob._id)}
          >
            <X className="size-3.5 mr-1.5" />
            Cancel Job
          </Button>
        </div>

        <div className="border rounded-xl p-6 bg-card/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold">{activeJob.title}</span>
            <span className="text-lg font-mono font-bold text-emerald-500">
              +${activeJob.reward}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div
              className={cn(
                "flex-1 rounded-xl border-2 p-4 transition-all",
                isPickup
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin
                  className={cn(
                    "size-5",
                    isPickup ? "text-blue-500" : "text-emerald-500",
                  )}
                />
                <span className="text-sm font-bold uppercase tracking-wider">
                  {isPickup ? "Go to Pickup" : "Picked Up ✓"}
                </span>
              </div>
              <p className="text-base font-medium">{activeJob.pickupName}</p>
            </div>

            <ArrowRight className="size-5 text-muted-foreground shrink-0" />

            <div
              className={cn(
                "flex-1 rounded-xl border-2 p-4 transition-all",
                isDelivery
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                  : "border-muted bg-muted/20",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Navigation
                  className={cn(
                    "size-5",
                    isDelivery ? "text-orange-500" : "text-muted-foreground",
                  )}
                />
                <span className="text-sm font-bold uppercase tracking-wider">
                  {isDelivery ? "Deliver Now" : "Delivery"}
                </span>
              </div>
              <p className="text-base font-medium">{activeJob.dropoffName}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {isPickup
              ? "Walk to the pickup marker and press F to collect the parcel"
              : "Walk to the delivery marker and press F to drop off the parcel"}
          </p>
        </div>
      </div>
    );
  }

  // ── Available jobs list ──
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Package className="size-5 text-muted-foreground" />
            Available Deliveries
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Accept a job to start earning cash.
          </p>
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">
          {availableJobs.length} jobs
        </span>
      </div>

      {availableJobs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground italic">
          <span className="text-4xl block mb-3">📭</span>
          No deliveries available right now. Check back soon...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableJobs.map((job) => {
            const distance = Math.round(
              Math.sqrt(
                (job.dropoffX - job.pickupX) ** 2 +
                  (job.dropoffY - job.pickupY) ** 2,
              ),
            );

            return (
              <div
                key={job._id}
                className="border rounded-xl p-4 bg-card/60 hover:bg-card/90 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold">{job.title}</span>
                  <span className="flex items-center gap-0.5 text-emerald-500 font-mono font-bold">
                    <DollarSign className="size-4" />
                    {job.reward}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 text-blue-400" />
                    <span>{job.pickupName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Navigation className="size-3.5 text-orange-400" />
                    <span>{job.dropoffName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    ~{distance} units
                  </span>
                  <Button size="sm" onClick={() => acceptJob(job._id)}>
                    Accept
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
