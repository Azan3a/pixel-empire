"use client";

import { SidebarIcon, Coins } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const player = useQuery(api.players.getPlayerInfo);

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 flex w-full items-center border-b shadow-sm">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4 text-sm font-medium">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mx-2 h-4" />

        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">
          <Coins className="h-4 w-4" />
          <span className="font-bold">${player?.gold ?? 0}</span>
        </div>

        <div className="ml-auto flex items-center gap-3 pr-2">
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}
