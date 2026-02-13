// components/game/ui/Header.tsx
"use client";

import { DollarSign, AlertTriangle, Building2, TrendingUp } from "lucide-react";
import { usePlayer } from "@game/features/player/hooks/use-player";
import { useWorld } from "@game/features/world/hooks/use-world";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { MAX_HUNGER } from "@game/shared/contracts/game-config";

export function Header() {
  const { playerInfo: player } = usePlayer();
  const { ownedCount, totalIncomePerCycle } = useWorld();

  if (!player) return null;

  const hunger = player.hunger ?? MAX_HUNGER;
  const hungerPct = Math.round((hunger / MAX_HUNGER) * 100);

  const hungerIndicatorClass =
    hunger > 60
      ? "[&_[data-slot='progress-indicator']]:bg-emerald-500"
      : hunger > 25
        ? "[&_[data-slot='progress-indicator']]:bg-yellow-500"
        : "[&_[data-slot='progress-indicator']]:bg-red-500";

  const isLowHunger = hunger <= 25;
  const isStarving = hunger <= 0;

  return (
    <header className="flex items-center gap-1 p-1 pr-3 h-12 bg-background backdrop-blur-md border rounded-full shadow-2xl pointer-events-auto">
      {/* Cash */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
        <DollarSign className="h-3.5 w-3.5" />
        <span className="font-extrabold text-sm tabular-nums">
          {player.cash.toLocaleString()}
        </span>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Properties + Income */}
      {ownedCount > 0 && (
        <>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full",
              "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
            )}
            title="Total income per game day (collected automatically)"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span className="font-bold text-xs tabular-nums">{ownedCount}</span>
            <TrendingUp className="h-3 w-3 opacity-60" />
            <span className="font-mono text-[10px] opacity-70">
              +${totalIncomePerCycle}
            </span>
          </div>

          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Hunger bar */}
      <div className="flex items-center gap-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{"🍖"}</span>

          <div className="flex flex-col gap-0.5">
            <Progress
              value={hungerPct}
              className={cn(
                "w-20 h-2.5 bg-muted border-2 rounded-full overflow-hidden",
                hungerIndicatorClass,
                isLowHunger &&
                  "**:data-[slot='progress-indicator']:animate-pulse",
              )}
            />
            <div className="flex items-center justify-between">
              {isLowHunger && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-500 leading-none">
                  <AlertTriangle className="size-2.5" />
                  {isStarving ? "STARVING" : "HUNGRY"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
