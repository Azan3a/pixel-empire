// components/game/ui/bottom-panel/JobsTab.tsx
"use client";

import { useJobs } from "@/hooks/use-jobs";
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="size-5 text-primary" />
            <h3 className="font-bold text-sm">Active Delivery</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => cancelJob(activeJob._id)}
          >
            <X className="size-3.5 mr-1" />
            Cancel
          </Button>
        </div>

        {/* Job info card */}
        <div className="border rounded-lg p-4 bg-card/80">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold">{activeJob.title}</span>
            <span className="text-sm font-mono font-bold text-emerald-500">
              +${activeJob.reward}
            </span>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-4">
            {/* Step 1: Pickup */}
            <div
              className={cn(
                "flex-1 rounded-lg border-2 p-3 transition-all",
                isPickup
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin
                  className={cn(
                    "size-4",
                    isPickup ? "text-blue-500" : "text-emerald-500",
                  )}
                />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isPickup ? "Go to Pickup" : "Picked Up ✓"}
                </span>
              </div>
              <p className="text-sm font-medium">{activeJob.pickupName}</p>
            </div>

            <ArrowRight className="size-4 text-muted-foreground shrink-0" />

            {/* Step 2: Dropoff */}
            <div
              className={cn(
                "flex-1 rounded-lg border-2 p-3 transition-all",
                isDelivery
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                  : "border-muted bg-muted/20",
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Navigation
                  className={cn(
                    "size-4",
                    isDelivery ? "text-orange-500" : "text-muted-foreground",
                  )}
                />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isDelivery ? "Deliver Now" : "Delivery"}
                </span>
              </div>
              <p className="text-sm font-medium">{activeJob.dropoffName}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <h3 className="font-bold text-sm">Available Deliveries</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {availableJobs.length} jobs
        </span>
      </div>

      {availableJobs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground italic text-sm">
          No deliveries available right now. Check back soon...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-52 overflow-y-auto pr-1">
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
                className="border rounded-lg p-3 bg-card/60 hover:bg-card/90 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{job.title}</span>
                  <span className="flex items-center gap-0.5 text-emerald-500 font-mono font-bold text-sm">
                    <DollarSign className="size-3.5" />
                    {job.reward}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3 text-blue-400" />
                    <span>{job.pickupName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Navigation className="size-3 text-orange-400" />
                    <span>{job.dropoffName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    ~{distance} units
                  </span>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => acceptJob(job._id)}
                  >
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
