"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PlayerRank {
  _id: string;
  name: string;
  cash: number;
}

interface RankingsTabProps {
  leaderboard: PlayerRank[];
  currentPlayerId: string;
}

export function RankingsTab({
  leaderboard,
  currentPlayerId,
}: RankingsTabProps) {
  return (
    <div className="h-full">
      <h3 className="text-lg font-bold mb-1">Leaderboard</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Top players ranked by total cash.
      </p>

      <ScrollArea className="h-[calc(100%-5rem)] pr-4">
        <div className="space-y-1.5">
          {leaderboard.map((p, idx) => (
            <div
              key={p._id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg text-sm transition-colors",
                p._id === currentPlayerId
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                  : "hover:bg-muted/50",
                idx === 0 &&
                  p._id !== currentPlayerId &&
                  "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800",
              )}
            >
              <div className="flex items-center gap-4">
                <span className="w-8 text-center font-bold text-muted-foreground">
                  {idx === 0
                    ? "🥇"
                    : idx === 1
                      ? "🥈"
                      : idx === 2
                        ? "🥉"
                        : `#${idx + 1}`}
                </span>
                <span className="font-bold">
                  {p.name}
                  {p._id === currentPlayerId && (
                    <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-normal">
                      (You)
                    </span>
                  )}
                </span>
              </div>
              <span className="font-black text-base">
                ${(p.cash || 0).toLocaleString()}
              </span>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-center py-16 text-muted-foreground italic">
              <span className="text-4xl block mb-3">🏆</span>
              No players yet...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
