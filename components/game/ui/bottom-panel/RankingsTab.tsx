// components/game/ui/bottom-panel/RankingsTab.tsx
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
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
    <TabsContent value="rankings" className="mt-0 h-full">
      <ScrollArea className="h-full pr-4">
        <div className="space-y-1">
          {leaderboard.map((p, idx) => (
            <div
              key={p._id}
              className={cn(
                "flex items-center justify-between p-2 rounded text-xs",
                p._id === currentPlayerId
                  ? "bg-emerald-50 border border-emerald-100"
                  : "hover:bg-muted/50",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="w-4 font-bold text-muted-foreground">
                  #{idx + 1}
                </span>
                <span className="font-bold">
                  {p.name} {p._id === currentPlayerId && "(You)"}
                </span>
              </div>
              <span className="font-black">
                ${(p.cash || 0).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </TabsContent>
  );
}
