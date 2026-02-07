// components/game/ui/Header.tsx
"use client";

import { DollarSign, UtensilsCrossed, AlertTriangle } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { useFood } from "@/hooks/use-food";
import { UserAvatar } from "@/components/user-avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { FOOD_LIST, MAX_HUNGER } from "@/convex/foodConfig";

export function Header() {
  const { playerInfo: player } = usePlayer();
  const { buyFood } = useFood();

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

      {/* Hunger bar + food button */}
      <div className="flex items-center gap-4 px-2">
        {/* Hunger bar */}
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

        {/* Food popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "size-8 rounded-full",
                isLowHunger &&
                  "bg-red-100 dark:bg-red-950/40 text-red-600 hover:bg-red-200 animate-bounce",
              )}
            >
              <UtensilsCrossed className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-2" sideOffset={8}>
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                Buy Food
              </p>
              <Separator />
              {FOOD_LIST.map((food) => (
                <button
                  key={food.key}
                  onClick={() => buyFood(food.key)}
                  disabled={player.cash < food.price || hunger >= MAX_HUNGER}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                    "hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{food.emoji}</span>
                    <div className="text-left">
                      <span className="font-semibold block">{food.name}</span>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        +{food.hunger} hunger
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-muted-foreground">
                    ${food.price}
                  </span>
                </button>
              ))}
              {hunger >= MAX_HUNGER && (
                <p className="text-center text-xs text-muted-foreground py-1 italic">
                  You&apos;re already full!
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
