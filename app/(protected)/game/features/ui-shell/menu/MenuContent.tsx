// app/(protected)/game/features/ui-shell/menu/MenuContent.tsx
"use client";

import { InventoryTab } from "@game/features/ui-shell/menu/tabs/InventoryTab";
import { JobsTab } from "@game/features/jobs/ui/JobsTab";
import { PropertiesTab } from "@game/features/ui-shell/menu/tabs/PropertiesTab";
import { MapTab } from "@game/features/ui-shell/menu/tabs/MapTab";
import { RankingsTab } from "@game/features/ui-shell/menu/tabs/RankingsTab";
import { ChatTab } from "@game/features/ui-shell/menu/tabs/ChatTab";
import { WardrobeTab } from "@game/features/ui-shell/menu/tabs/WardrobeTab";
import { ProfileTab } from "@game/features/ui-shell/menu/tabs/ProfileTab";
import { ControlsTab } from "@game/features/ui-shell/menu/tabs/ControlsTab";
import { NavId } from "./constants";
import { Property } from "@game/types/property";
import { Job } from "@game/types/job";
import { Id } from "@/convex/_generated/dataModel";

interface InventoryItem {
  item: string;
  quantity: number;
}

interface MenuPlayerInfo {
  _id: Id<"players">;
  name: string;
  x: number;
  y: number;
  inventory: InventoryItem[];
}

interface LeaderboardEntry {
  _id: string;
  name: string;
  cash: number;
}

interface MapPlayer {
  _id: string;
  x: number;
  y: number;
  name: string;
}

interface MenuContentProps {
  activeNav: NavId;
  playerInfo: MenuPlayerInfo;
  leaderboard: LeaderboardEntry[];
  alivePlayers: MapPlayer[];
  activeJob: Job | null;
  properties: Property[];
}

export function MenuContent({
  activeNav,
  playerInfo,
  leaderboard,
  alivePlayers,
  activeJob,
  properties,
}: MenuContentProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {activeNav === "inventory" && (
        <InventoryTab inventory={playerInfo.inventory} />
      )}
      {activeNav === "wardrobe" && <WardrobeTab />}
      {activeNav === "map" && (
        <MapTab
          playerX={playerInfo.x}
          playerY={playerInfo.y}
          properties={properties}
          otherPlayers={alivePlayers}
          activeJob={activeJob}
        />
      )}
      {activeNav === "jobs" && <JobsTab />}
      {activeNav === "properties" && <PropertiesTab />}
      {activeNav === "rankings" && (
        <RankingsTab
          leaderboard={leaderboard}
          currentPlayerId={playerInfo._id}
        />
      )}
      {activeNav === "chat" && <ChatTab playerName={playerInfo.name} />}
      {activeNav === "profile" && <ProfileTab />}
      {activeNav === "controls" && <ControlsTab />}
    </div>
  );
}
