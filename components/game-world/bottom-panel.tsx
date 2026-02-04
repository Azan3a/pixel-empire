"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Package,
  Store,
  BarChart3,
  MessageSquare,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function BottomPanel() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isExpanded, setIsExpanded] = useState(true);

  const playerInfo = useQuery(api.players.getPlayerInfo);
  const leaderboard = useQuery(api.players.getLeaderboard) || [];
  const sellResource = useMutation(api.world.sellResource);

  const tabs = [
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "market", label: "Global Market", icon: Store },
    { id: "rankings", label: "Rankings", icon: BarChart3 },
    { id: "chat", label: "Chat/Log", icon: MessageSquare },
  ];

  if (!playerInfo) return null;

  return (
    <div
      className={cn(
        "pointer-events-auto w-full mx-auto rounded-t-xl bg-background/95 backdrop-blur-md border border-b-0 shadow-2xl transition-all duration-300",
        isExpanded ? "h-64" : "h-12",
      )}
    >
      {/* Tab Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsExpanded(true);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-t-lg border-b-2 border-transparent",
                activeTab === tab.id && isExpanded
                  ? "text-emerald-600 border-emerald-600 bg-emerald-50/50"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="size-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-muted rounded"
        >
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronUp className="size-4" />
          )}
        </button>
      </div>

      {/* Content Area */}
      {isExpanded && (
        <div className="p-4 flex gap-6 h-48 overflow-hidden">
          <div className="flex-1 min-w-0">
            {activeTab === "inventory" && (
              <div className="flex flex-wrap gap-4">
                {playerInfo.inventory?.map(
                  (item: { item: string; quantity: number }) => (
                    <div
                      key={item.item}
                      className="flex flex-col items-center justify-center p-3 w-24 rounded-lg border bg-card/50"
                    >
                      <span className="text-2xl mb-1">
                        {item.item === "wood"
                          ? "🪵"
                          : item.item === "stone"
                            ? "🪨"
                            : "⬟"}
                      </span>
                      <span className="text-[10px] font-bold uppercase opacity-50">
                        {item.item}
                      </span>
                      <span className="text-sm font-black">
                        {item.quantity}
                      </span>
                    </div>
                  ),
                )}
                {(!playerInfo.inventory ||
                  playerInfo.inventory.length === 0) && (
                  <div className="w-full text-center py-8 text-muted-foreground italic text-sm">
                    Your pack is empty...
                  </div>
                )}
              </div>
            )}

            {activeTab === "market" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: "wood", price: 5, emoji: "🪵" },
                  { name: "stone", price: 10, emoji: "🪨" },
                  { name: "ore", price: 25, emoji: "⬟" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-lg border bg-emerald-50/20 border-emerald-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.emoji}</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">
                          {item.name}
                        </span>
                        <span className="text-xs font-black text-emerald-600">
                          ${item.price} EA
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] bg-white"
                      onClick={() =>
                        sellResource({ item: item.name, amount: 1 })
                      }
                      disabled={
                        (playerInfo.inventory?.find(
                          (i: { item: string; quantity: number }) =>
                            i.item === item.name,
                        )?.quantity || 0) <= 0
                      }
                    >
                      Sell Item
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "rankings" && (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-1">
                  {leaderboard.map((p, idx) => (
                    <div
                      key={p._id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded text-xs",
                        p._id === playerInfo._id
                          ? "bg-emerald-50 border border-emerald-100"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-4 font-bold text-muted-foreground">
                          #{idx + 1}
                        </span>
                        <span className="font-bold">
                          {p.name} {p._id === playerInfo._id && "(You)"}
                        </span>
                      </div>
                      <span className="font-black">${p.gold}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {activeTab === "chat" && (
              <div className="flex flex-col h-full bg-muted/30 rounded-lg p-3">
                <div className="flex-1 text-[11px] font-mono text-muted-foreground">
                  <p>[08:42:01] Welcome to Pixel Empire, {playerInfo.name}!</p>
                  <p>[08:42:05] Use WASD or Arrows to explore the world.</p>
                  <p>[08:43:10] Pro tip: Gather Ore for higher profits!</p>
                </div>
                <div className="mt-2 text-[10px] border-t pt-2 italic text-muted-foreground">
                  Chat system coming soon in Alpha v0.2...
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block w-64 border-l pl-6">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Controls
            </h4>
            <div className="grid gap-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Move</span>
                <span className="font-bold">WASD / Arrows</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gather</span>
                <span className="font-bold">Mouse Click</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">North</span>
                <span className="font-bold">N Key</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toggle UI</span>
                <span className="font-bold">I | M | L</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
