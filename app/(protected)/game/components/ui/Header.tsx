// components/game/ui/Header.tsx
"use client";

import {
  DollarSign,
  AlertTriangle,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Cloud,
  Building2,
  TrendingUp,
} from "lucide-react";
import { usePlayer } from "@game/hooks/use-player";
import { useWorld } from "@game/hooks/use-world";
import { useGameTime } from "@game/hooks/use-game-time";
import { UserAvatar } from "@/components/user-avatar";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { MAX_HUNGER } from "@/convex/foodConfig";
import type { TimePhase } from "@/convex/timeConstants";

const phaseIcons: Record<TimePhase, React.ReactNode> = {
  DAWN: <Sunrise className="h-3.5 w-3.5 text-orange-400" />,
  MORNING: <Sun className="h-3.5 w-3.5 text-yellow-400" />,
  AFTERNOON: <Sun className="h-3.5 w-3.5 text-yellow-300" />,
  EVENING: <Sunset className="h-3.5 w-3.5 text-orange-500" />,
  DUSK: <Cloud className="h-3.5 w-3.5 text-purple-400" />,
  NIGHT: <Moon className="h-3.5 w-3.5 text-blue-300" />,
};

export function Header() {
  const { playerInfo: player } = usePlayer();
  const { ownedCount, totalIncomePerCycle } = useWorld();
  const { formatted, phase } = useGameTime();

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
    <header className="fixed top-4 left-4 z-50 flex items-center gap-1 p-1 pr-3 h-12 bg-background backdrop-blur-md border rounded-full shadow-2xl">
      {/* Avatar + Rank */}
      <div className="flex items-center gap-2 pl-2">
        <UserAvatar />
        <div className="flex flex-col pr-2 gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground leading-none">
            RANK
          </span>
          <span className="text-xs font-bold leading-none">
            #{player.rank}/{player.total}
          </span>
        </div>
      </div>

      <Separator orientation="vertical" className="h-6" />

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

      <Separator orientation="vertical" className="h-6" />

      {/* Game Time */}
      <div className="flex items-center gap-1.5 px-2">
        {phaseIcons[phase]}
        <span className="font-mono text-xs font-bold tabular-nums text-foreground">
          {formatted}
        </span>
      </div>
    </header>
  );
}
