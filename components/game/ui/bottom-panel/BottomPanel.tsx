"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Package,
  Store,
  BarChart3,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Hammer,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { InventoryTab } from "./InventoryTab";
import { BuildTab } from "./BuildTab";
import { MarketTab } from "./MarketTab";
import { RankingsTab } from "./RankingsTab";
import { ChatTab } from "./ChatTab";

export function BottomPanel() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isExpanded, setIsExpanded] = useState(true);

  const playerInfo = useQuery(api.players.getPlayerInfo);
  const leaderboard = useQuery(api.players.getLeaderboard) || [];

  const tabs = [
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "build", label: "Build", icon: Hammer },
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
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setIsExpanded(true);
        }}
        className="h-full flex flex-col"
      >
        {/* Tab Header */}
        <div className="flex items-center justify-between px-4 h-12 border-b">
          <TabsList variant="line" className="bg-transparent gap-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider data-[state=active]:text-emerald-600 data-[state=active]:after:bg-emerald-600  rounded-none border-none"
              >
                <tab.icon className="size-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

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
              <InventoryTab inventory={playerInfo.inventory} />

              <BuildTab
                playerGold={playerInfo.gold}
                playerX={playerInfo.x}
                playerY={playerInfo.y}
              />

              <MarketTab inventory={playerInfo.inventory} />

              <RankingsTab
                leaderboard={leaderboard}
                currentPlayerId={playerInfo._id}
              />

              <ChatTab playerName={playerInfo.name} />
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
      </Tabs>
    </div>
  );
}
