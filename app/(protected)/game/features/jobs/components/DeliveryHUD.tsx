// components/game/ui/DeliveryHUD.tsx
"use client";

import { useJobs } from "@game/features/jobs/hooks/use-jobs";
import { useCallback, useMemo } from "react";
import { Navigation2, DollarSign, LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";
import { getZoneAt, ZONES } from "@game/shared/contracts/game-config";
import { useKeyboard } from "@game/features/player/hooks/use-keyboard";

interface DeliveryHUDProps {
  playerX: number;
  playerY: number;
}

const CLIENT_INTERACT_RADIUS = 40;

/** Format distance for the larger 4000px map */
function formatDistance(d: number): string {
  if (d >= 1000) {
    return `${(d / 1000).toFixed(1)}k`;
  }
  return `${Math.round(d)}`;
}

export function DeliveryHUD({ playerX, playerY }: DeliveryHUDProps) {
  const { activeJob, pickupParcel, deliverParcel } = useJobs();

  const isPickup = activeJob?.status === "accepted";
  const isDelivery = activeJob?.status === "picked_up";

  const targetX = isPickup ? activeJob?.pickupX : activeJob?.dropoffX;
  const targetY = isPickup ? activeJob?.pickupY : activeJob?.dropoffY;
  const targetName = isPickup ? activeJob?.pickupName : activeJob?.dropoffName;

  const distance =
    targetX !== undefined && targetY !== undefined
      ? Math.sqrt((targetX - playerX) ** 2 + (targetY - playerY) ** 2)
      : Infinity;

  const isNear = distance < CLIENT_INTERACT_RADIUS;

  const angle =
    targetX !== undefined && targetY !== undefined
      ? Math.atan2(targetY - playerY, targetX - playerX)
      : 0;

  // Zone info for the target location
  const targetZone = useMemo(() => {
    if (targetX === undefined || targetY === undefined) return null;
    const zoneId = getZoneAt(targetX, targetY);
    return ZONES[zoneId];
  }, [targetX, targetY]);

  // Cross-zone indicator
  const playerZone = useMemo(
    () => getZoneAt(playerX, playerY),
    [playerX, playerY],
  );
  const isCrossZone = useMemo(() => {
    if (targetX === undefined || targetY === undefined) return false;
    return getZoneAt(targetX, targetY) !== playerZone;
  }, [targetX, targetY, playerZone]);

  const handleInteract = useCallback(() => {
    if (!activeJob || !isNear) return;
    if (isPickup) pickupParcel(activeJob._id);
    else if (isDelivery) deliverParcel(activeJob._id);
  }, [activeJob, isNear, isPickup, isDelivery, pickupParcel, deliverParcel]);

  useKeyboard({
    bindings: [
      {
        controlId: "interact",
        onKeyDown: handleInteract,
      },
    ],
    enabled: !!activeJob,
  });

  if (!activeJob) return null;

  return (
    <>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-4 w-full max-w-md">
        {/* Main HUD Card */}
        <div
          className={cn(
            "pointer-events-auto flex items-center w-full gap-4 px-5 py-3 rounded-2xl border-b-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300",
            isPickup
              ? "bg-slate-900/90 border-blue-500/60 ring-1 ring-blue-500/20"
              : "bg-slate-900/90 border-orange-500/60 ring-1 ring-orange-500/20",
          )}
        >
          {/* Status Icon & Navigation */}
          <div className="relative group">
            <div
              className={cn(
                "flex items-center justify-center size-12 rounded-xl transition-transform duration-500 group-hover:scale-110 shadow-inner",
                isPickup ? "bg-blue-500/20" : "bg-orange-500/20",
              )}
            >
              <div
                className="transition-transform duration-200 ease-out"
                style={{ transform: `rotate(${angle + Math.PI / 2}rad)` }}
              >
                <Navigation2
                  className={cn(
                    "size-6 drop-shadow-[0_0_8px_currentColor]",
                    isPickup ? "text-blue-400" : "text-orange-400",
                  )}
                  fill="currentColor"
                />
              </div>
            </div>
            {/* Distance Badge */}
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-black/80 border border-white/10 text-[10px] font-mono font-bold text-white shadow-lg">
              {formatDistance(distance)}m
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full",
                  isPickup
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-orange-500/10 text-orange-400 border border-orange-500/20",
                )}
              >
                {isPickup ? "Collect" : "Deliver"}
              </span>
              {isNear && (
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              )}
            </div>

            <h3 className="text-base font-bold text-white leading-tight truncate">
              {targetName}
            </h3>

            <div className="flex items-center gap-3">
              {targetZone && (
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                  <LocateFixed className="size-3 text-white/40 shrink-0" />
                  <span className="text-xs font-medium text-white/50 truncate">
                    {targetZone.name}
                  </span>
                </div>
              )}
              {isCrossZone && (
                <div className="flex items-center gap-1 shrink-0">
                  <div className="size-1 rounded-full bg-white/20" />
                  <span className="text-[10px] font-bold text-amber-400/80">
                    LONG HAUL
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reward Section */}
          <div className="flex flex-col items-end gap-1 pl-4 border-l border-white/10 shrink-0">
            <div className="flex items-center gap-1.5">
              <DollarSign className="size-4 text-emerald-400" />
              <span className="text-xl font-black font-mono text-emerald-400 tabular-nums">
                {activeJob.reward}
              </span>
            </div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Payout
            </span>
          </div>
        </div>

        {/* Interaction Prompt */}
        {isNear && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div
              className={cn(
                "flex items-center gap-2.5 px-6 py-2 rounded-full border-2 shadow-2xl backdrop-blur-md",
                isPickup
                  ? "bg-blue-600/90 border-blue-400 shadow-blue-500/20"
                  : "bg-orange-600/90 border-orange-400 shadow-orange-500/20",
              )}
            >
              <div className="flex items-center justify-center size-6 rounded bg-black/20 text-xs font-black text-white px-2">
                F
              </div>
              <span className="text-sm font-black text-white uppercase tracking-wide">
                {isPickup ? "Pickup Parcel" : "Dropoff Parcel"}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
