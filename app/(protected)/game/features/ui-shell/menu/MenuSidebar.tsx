// app/(protected)/game/features/ui-shell/menu/MenuSidebar.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Building2 } from "lucide-react";
import { NAV_ITEMS, NavId } from "./constants";

interface MenuSidebarPlayer {
  name: string;
  cash?: number;
}

interface MenuSidebarProps {
  activeNav: NavId;
  setActiveNav: (id: NavId) => void;
  playerInfo: MenuSidebarPlayer;
  ownedCount: number;
  totalIncomePerCycle: number;
  jobsBadge: boolean;
  hunger: number;
}

export function MenuSidebar({
  activeNav,
  setActiveNav,
  playerInfo,
  ownedCount,
  totalIncomePerCycle,
  jobsBadge,
  hunger,
}: MenuSidebarProps) {
  const gameplayItems = NAV_ITEMS.filter((n) => n.group === "gameplay");
  const socialItems = NAV_ITEMS.filter((n) => n.group === "social");
  const systemItems = NAV_ITEMS.filter((n) => n.group === "system");

  const renderGroup = (label: string, items: (typeof NAV_ITEMS)[number][]) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                isActive={activeNav === item.id}
                onClick={() => setActiveNav(item.id as NavId)}
                className="cursor-pointer"
              >
                <item.icon className="size-4" />
                <span className="flex-1">{item.name}</span>
                {item.id === "jobs" && jobsBadge && (
                  <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
                )}
                {item.id === "properties" && ownedCount > 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground/70 tabular-nums">
                    {ownedCount}
                  </span>
                )}
                <kbd className="ml-auto text-[10px] font-mono text-muted-foreground/50">
                  {item.shortcut}
                </kbd>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="none" className="hidden md:flex border-r">
      <SidebarContent>
        {renderGroup("Gameplay", gameplayItems)}
        {renderGroup("Social", socialItems)}
        {renderGroup("System", systemItems)}

        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">
              {hunger > 60 ? "😊" : hunger > 25 ? "😐" : "😫"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate">
                {playerInfo.name}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">
                  ${(playerInfo.cash || 0).toLocaleString()}
                </span>
                <span>•</span>
                <span className="font-mono">{hunger}% hunger</span>
              </div>
              {ownedCount > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-blue-500/70 mt-0.5">
                  <Building2 className="size-2.5" />
                  <span>
                    {ownedCount} owned · +${totalIncomePerCycle}/cycle
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
