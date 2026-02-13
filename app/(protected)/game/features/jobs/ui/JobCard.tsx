// app/(protected)/game/features/jobs/ui/JobCard.tsx
"use client";

import { MapPin, Navigation, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistance } from "@game/shared/utils/format";
import { getZoneAt, ZONES } from "@game/shared/contracts/game-config";
import { Id } from "@/convex/_generated/dataModel";
import { Job } from "@game/types/job";

interface JobCardProps {
  job: Job;
  onAccept: (id: Id<"jobs">) => void;
}

export function JobCard({ job, onAccept }: JobCardProps) {
  const distance = Math.round(
    Math.sqrt(
      (job.dropoffX - job.pickupX) ** 2 + (job.dropoffY - job.pickupY) ** 2,
    ),
  );

  const pickupZone = ZONES[getZoneAt(job.pickupX, job.pickupY)];
  const dropoffZone = ZONES[getZoneAt(job.dropoffX, job.dropoffY)];
  const isCrossZone = pickupZone.id !== dropoffZone.id;

  return (
    <div
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

      {isCrossZone ? (
        <div className="mb-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
            CROSS-ZONE
          </span>
        </div>
      ) : (
        <div className="mb-2 h-5" />
      )}

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-3.5 text-blue-400 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="truncate">{job.pickupName}</span>
            <span className="text-[10px] opacity-60">{pickupZone.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Navigation className="size-3.5 text-orange-400 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="truncate">{job.dropoffName}</span>
            <span className="text-[10px] opacity-60">{dropoffZone.name}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground tabular-nums">
          ~{formatDistance(distance)} units
        </span>
        <Button size="sm" onClick={() => onAccept(job._id)}>
          Accept
        </Button>
      </div>
    </div>
  );
}
