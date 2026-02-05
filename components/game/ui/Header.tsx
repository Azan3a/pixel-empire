"use client";

import { Coins } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserAvatar } from "@/components/user-avatar";
import { Separator } from "@/components/ui/separator";

export function SiteHeader() {
  const player = useQuery(api.players.getPlayerInfo);

  if (!player) return null;

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 pr-3 h-12 bg-background/95 backdrop-blur-md border rounded-full shadow-2xl">
      <div className="flex items-center gap-2 pl-2">
        <UserAvatar />
        <div className="flex flex-col pr-2 gap-0.5">
          <span className="text-[10px] font-bold text-muted-foreground leading-none">
            RANK
          </span>
          <span className="text-xs font-bold leading-none">
            # {player.rank} / {player.total}
          </span>
        </div>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
        <Coins className="h-3.5 w-3.5" />
        <span className="font-extrabold text-sm tabular-nums">
          ${player.gold.toLocaleString()}
        </span>
      </div>
    </header>
  );
}
