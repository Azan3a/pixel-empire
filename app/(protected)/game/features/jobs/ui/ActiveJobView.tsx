// app/(protected)/game/features/jobs/ui/ActiveJobView.tsx
"use client";

import { Truck, MapPin, Navigation, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getZoneAt, ZONES } from "@game/shared/contracts/game-config";
import { Id } from "@/convex/_generated/dataModel";
import { Job } from "@game/types/job";

interface ActiveJobViewProps {
  activeJob: Job;
  onCancel: (id: Id<"jobs">) => void | Promise<unknown>;
}

export function ActiveJobView({ activeJob, onCancel }: ActiveJobViewProps) {
  const isPickup = activeJob.status === "accepted";
  const isDelivery = activeJob.status === "picked_up";

  const pickupZone = ZONES[getZoneAt(activeJob.pickupX, activeJob.pickupY)];
  const dropoffZone = ZONES[getZoneAt(activeJob.dropoffX, activeJob.dropoffY)];
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
          onClick={() => onCancel(activeJob._id)}
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

        {isCrossZone ? (
          <div className="mb-4">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
              CROSS-ZONE DELIVERY — BONUS REWARD
            </span>
          </div>
        ) : (
          <div className="mb-4 h-5" />
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
