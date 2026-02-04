"use client";

import * as React from "react";
import { Package, Store, BarChart3 } from "lucide-react";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const playerInfo = useQuery(api.players.getPlayerInfo);
  const leaderboard = useQuery(api.players.getLeaderboard) || [];
  const sellResource = useMutation(api.world.sellResource);

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height)-1rem)]!"
      variant="floating"
      {...props}
    >
      <SidebarContent>
        {/* Inventory Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Package className="size-3.5" />
            Inventory
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid gap-1 px-2">
              {playerInfo?.inventory?.map(
                (item: { item: string; quantity: number }) => (
                  <div
                    key={item.item}
                    className="flex items-center justify-between text-sm px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <span className="capitalize text-muted-foreground font-medium">
                      {item.item}
                    </span>
                    <span className="font-bold tabular-nums">
                      {item.quantity}
                    </span>
                  </div>
                ),
              )}
              {(!playerInfo?.inventory ||
                playerInfo.inventory.length === 0) && (
                <div className="text-[10px] text-center text-muted-foreground py-4 italic">
                  No items collected
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Global Market Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Store className="size-3.5" />
            Global Market
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid gap-2 px-2">
              {[
                { name: "wood", price: 5 },
                { name: "stone", price: 10 },
                { name: "ore", price: 25 },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col gap-1 p-2 rounded-lg border bg-card/50 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold capitalize">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-tight">
                      ${item.price} EA
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px] border border-dashed border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => sellResource({ item: item.name, amount: 1 })}
                    disabled={
                      (playerInfo?.inventory?.find(
                        (i: { item: string; quantity: number }) =>
                          i.item === item.name,
                      )?.quantity || 0) <= 0
                    }
                  >
                    Sell Unit
                  </Button>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Wealth Leaderboard */}
        <SidebarGroup className="mt-auto border-t">
          <SidebarGroupLabel className="flex items-center gap-2">
            <BarChart3 className="size-3.5 text-blue-500" />
            Wealthy Rankings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-40 px-1">
              <div className="grid gap-0.5">
                {leaderboard.slice(0, 10).map((p, idx) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between text-[11px] px-2 py-1 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground tabular-nums w-4">
                        #{idx + 1}
                      </span>
                      <span
                        className={`truncate w-20 ${p._id === playerInfo?._id ? "font-bold text-emerald-600" : ""}`}
                      >
                        {p.name}
                      </span>
                    </div>
                    <span className="font-bold tabular-nums text-gray-900">
                      ${p.gold}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
