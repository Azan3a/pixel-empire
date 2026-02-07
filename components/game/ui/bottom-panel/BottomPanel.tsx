// components/game/ui/bottom-panel/BottomPanel.tsx
"use client";

import { useState } from "react";
import { usePlayer } from "@/hooks/use-player";
import { useWorld } from "@/hooks/use-world";
import { useJobs } from "@/hooks/use-jobs";
import {
  Package,
  BarChart3,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Briefcase,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { InventoryTab } from "./InventoryTab";
import { JobsTab } from "./JobsTab";
import { RankingsTab } from "./RankingsTab";
import { ChatTab } from "./ChatTab";
import { Minimap } from "./Minimap";
import { Button } from "@/components/ui/button";
import { ControlsDialog } from "./ControlsDialog";

interface BottomPanelProps {
  playerX: number;
  playerY: number;
}

export function BottomPanel({ playerX, playerY }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isExpanded, setIsExpanded] = useState(true);

  const { playerInfo, leaderboard, alivePlayers } = usePlayer();
  const { properties } = useWorld();
  const { activeJob } = useJobs();

  const tabs = [
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "rankings", label: "Rankings", icon: BarChart3 },
    { id: "chat", label: "Chat/Log", icon: MessageSquare },
  ];

  if (!playerInfo) return null;

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 800;
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 600;

  // Filter out self from minimap players
  const otherPlayers = alivePlayers
    .filter((p) => p._id !== playerInfo._id)
    .map((p) => ({ _id: p._id, x: p.x, y: p.y, name: p.name }));

  return (
    <div
      className={cn(
        "pointer-events-auto w-full mx-auto rounded-t-xl bg-background/95 backdrop-blur-md border border-b-0 shadow-2xl transition-all duration-300",
        isExpanded ? "h-92" : "h-12",
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
          <TabsList className="bg-transparent gap-0 p-0 h-12">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 h-full gap-2 text-xs font-bold uppercase tracking-wider"
              >
                <tab.icon className="size-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-1">
            <ControlsDialog />
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              {isExpanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronUp className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {isExpanded && (
          <div className="flex-1 p-4 overflow-hidden flex gap-4">
            <div className="flex-1 h-full min-w-0 overflow-y-auto pr-1">
              <TabsContent value="inventory" className="mt-0 h-full">
                <InventoryTab inventory={playerInfo.inventory} />
              </TabsContent>

              <TabsContent value="jobs" className="mt-0 h-full">
                <JobsTab />
              </TabsContent>

              <TabsContent value="rankings" className="mt-0 h-full">
                <RankingsTab
                  leaderboard={leaderboard}
                  currentPlayerId={playerInfo._id}
                />
              </TabsContent>

              <TabsContent value="chat" className="mt-0 h-full">
                <ChatTab playerName={playerInfo.name} />
              </TabsContent>
            </div>

            {/* Minimap Side Panel */}
            <div className="hidden lg:block border-l pl-4 w-64">
              <Minimap
                playerX={playerX}
                playerY={playerY}
                properties={properties}
                otherPlayers={otherPlayers}
                activeJob={
                  activeJob as
                    | (typeof activeJob & {
                        status:
                          | "available"
                          | "accepted"
                          | "picked_up"
                          | "completed"
                          | "cancelled";
                      })
                    | null
                }
                viewportWidth={viewportWidth}
                viewportHeight={viewportHeight}
              />
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
