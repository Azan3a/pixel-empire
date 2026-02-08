// components/game/ui/menu/JobsTab.tsx
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
import { getZoneAt, ZONES } from "@/convex/mapZones";

/** Format distance for the larger 4000px map */
function formatDistance(d: number): string {
  if (d >= 1000) {
    return `${(d / 1000).toFixed(1)}k`;
  }
  return `${Math.round(d)}`;
}

export function JobsTab() {
  const { availableJobs, activeJob, acceptJob, cancelJob } = useJobs();

  // ── Active job view ──
  if (activeJob) {
    const isPickup = activeJob.status === "accepted";
    const isDelivery = activeJob.status === "picked_up";

    const pickupZone = ZONES[getZoneAt(activeJob.pickupX, activeJob.pickupY)];
    const dropoffZone =
      ZONES[getZoneAt(activeJob.dropoffX, activeJob.dropoffY)];
    const isCrossZone = pickupZone.id !== dropoffZone.id;

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
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold">{activeJob.title}</span>
            <span className="text-lg font-mono font-bold text-emerald-500">
              +${activeJob.reward}
            </span>
          </div>

          {isCrossZone && (
            <div className="mb-4">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
                CROSS-ZONE DELIVERY — BONUS REWARD
              </span>
            </div>
          )}

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
              <span className="text-[10px] text-muted-foreground">
                📍 {pickupZone.name}
              </span>
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
              <span className="text-[10px] text-muted-foreground">
                📍 {dropoffZone.name}
              </span>
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
            Accept a job to start earning cash. Cross-zone deliveries pay a
            bonus!
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

            const pickupZone = ZONES[getZoneAt(job.pickupX, job.pickupY)];
            const dropoffZone = ZONES[getZoneAt(job.dropoffX, job.dropoffY)];
            const isCrossZone = pickupZone.id !== dropoffZone.id;

            return (
              <div
                key={job._id}
                className={cn(
                  "border rounded-xl p-4 bg-card/60 hover:bg-card/90 transition-colors",
                  isCrossZone && "ring-1 ring-amber-500/20",
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{job.title}</span>
                  <span className="flex items-center gap-0.5 text-emerald-500 font-mono font-bold">
                    <DollarSign className="size-4" />
                    {job.reward}
                  </span>
                </div>

                {isCrossZone && (
                  <div className="mb-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      CROSS-ZONE
                    </span>
                  </div>
                )}

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 text-blue-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{job.pickupName}</span>
                      <span className="text-[10px] opacity-60">
                        {pickupZone.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Navigation className="size-3.5 text-orange-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{job.dropoffName}</span>
                      <span className="text-[10px] opacity-60">
                        {dropoffZone.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ~{formatDistance(distance)} units
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
