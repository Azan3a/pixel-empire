// components/game/ui/ZoneTransition.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getZoneAt, ZONES, type ZoneId } from "@/convex/map/zones";
import { cn } from "@/lib/utils";

const ZONE_ICONS: Record<ZoneId, string> = {
  forest: "🌲",
  mountains: "⛰️",
  oldtown: "🏛️",
  harbor: "⚓",
  downtown: "🏙️",
  park: "🌳",
  suburbs: "🏘️",
  commercial: "🛒",
  farmland: "🌾",
  industrial: "🏭",
  wetlands: "🌿",
  boardwalk: "🎡",
  beach: "🏖️",
  smallisland: "🏝️",
};

interface ZoneTransitionProps {
  playerX: number;
  playerY: number;
}

export function ZoneTransition({ playerX, playerY }: ZoneTransitionProps) {
  const currentZone = useMemo(
    () => getZoneAt(playerX, playerY),
    [playerX, playerY],
  );

  // Track previous zone using React's "store previous value" pattern
  const [prevZone, setPrevZone] = useState<ZoneId | null | undefined>(
    undefined,
  );
  const [transition, setTransition] = useState<{
    name: string;
    icon: string;
  } | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // React's recommended "adjusting state during render" pattern
  // (setState during render is allowed when comparing prev/next props)
  if (currentZone !== prevZone) {
    setPrevZone(currentZone);
    // Only show transition after the initial zone is established
    if (prevZone !== undefined && currentZone && currentZone !== prevZone) {
      const def = ZONES[currentZone];
      setTransition({ name: def.name, icon: ZONE_ICONS[currentZone] });
    }
  }

  // Auto-hide timer — runs when transition is set
  useEffect(() => {
    if (!transition) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setTransition(null), 2500);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [transition]);

  if (!transition) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={cn(
          "flex items-center gap-2.5 px-5 py-2.5 rounded-full",
          "bg-black/70 backdrop-blur-md border border-white/15 shadow-2xl",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
        )}
      >
        <span className="text-xl leading-none">{transition.icon}</span>
        <span className="text-sm font-bold text-white tracking-wide">
          {transition.name}
        </span>
      </div>
    </div>
  );
}
