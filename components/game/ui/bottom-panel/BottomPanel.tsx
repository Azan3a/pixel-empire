// components/game/ui/bottom-panel/BottomPanel.tsx
"use client";

import { useState } from "react";
import { usePlayer } from "@/hooks/use-player";
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
import { Button } from "@/components/ui/button";
import { ControlsDialog } from "./ControlsDialog";

export function BottomPanel() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isExpanded, setIsExpanded] = useState(true);

  const { playerInfo, leaderboard } = usePlayer();

  const tabs = [
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "rankings", label: "Rankings", icon: BarChart3 },
    { id: "chat", label: "Chat/Log", icon: MessageSquare },
  ];

  if (!playerInfo) return null;

  return (
    <div
      className={cn(
        "pointer-events-auto w-full mx-auto rounded-t-xl bg-background/95 backdrop-blur-md border border-b-0 shadow-2xl transition-all duration-300",
        isExpanded ? "h-80" : "h-12",
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
              variant={"ghost"}
              size={"icon"}
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

            {/* Context/Info Side Panel (e.g. selected item details, minimap, etc) */}
            <div className="hidden lg:block w-72 border-l pl-4">
              <div className="w-full h-full bg-muted/20 rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                Context / Mini-Map Area
              </div>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
