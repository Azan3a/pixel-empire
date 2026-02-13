// components/game/ui/DeliveryHUD.tsx
"use client";

import { useJobs } from "@game/hooks/use-jobs";
import { useCallback, useMemo } from "react";
import { Package, Navigation, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { getZoneAt, ZONES } from "@game/shared/contracts/game-config";
import { useKeyboard } from "@game/hooks/use-keyboard";

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
      {/* ── Objective banner — fixed top center ── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-2">
        <div
          className={cn(
            "pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 shadow-lg backdrop-blur-md",
            isPickup
              ? "bg-blue-950/80 border-blue-500/50"
              : "bg-orange-950/80 border-orange-500/50",
          )}
        >
          {/* Compass arrow */}
          <div
            className="flex items-center justify-center size-9 rounded-full bg-black/30"
            style={{ transform: `rotate(${angle + Math.PI / 2}rad)` }}
          >
            <Navigation
              className={cn(
                "size-5",
                isPickup ? "text-blue-400" : "text-orange-400",
              )}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              {isPickup ? (
                <MapPin className="size-3.5 text-blue-400" />
              ) : (
                <Package className="size-3.5 text-orange-400" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                {isPickup ? "Pick Up Parcel" : "Deliver Parcel"}
              </span>
            </div>
            <span className="text-sm font-bold text-white">{targetName}</span>
            {/* Zone tag */}
            {targetZone && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-white/40">
                  📍 {targetZone.name}
                </span>
                {isCrossZone && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    CROSS-ZONE
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Distance */}
          <div className="flex flex-col items-end ml-4">
            <span className="text-lg font-mono font-black text-white">
              {formatDistance(distance)}
            </span>
            <span className="text-[10px] text-white/50 uppercase">
              {distance >= 1000 ? "k units" : "units"}
            </span>
          </div>

          {/* Reward */}
          <div className="flex flex-col items-end ml-2 pl-3 border-l border-white/10">
            <span className="text-sm font-mono font-bold text-emerald-400">
              +${activeJob.reward}
            </span>
            <span className="text-[10px] text-white/40">reward</span>
          </div>
        </div>

        {/* Interaction prompt */}
        {isNear && (
          <div
            className={cn(
              "pointer-events-auto px-4 py-2 rounded-lg border animate-pulse shadow-lg",
              isPickup
                ? "bg-blue-600/90 border-blue-400 text-white"
                : "bg-orange-600/90 border-orange-400 text-white",
            )}
          >
            <span className="text-sm font-bold">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">
                F
              </kbd>{" "}
              to {isPickup ? "pick up parcel" : "deliver parcel"}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
