"use client";

import * as React from "react";
import {
  Package,
  Briefcase,
  BarChart3,
  MessageSquare,
  Keyboard,
  Map,
  X,
  Menu,
  Building2,
  User,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePlayer } from "@game/hooks/use-player";
import { useWorld } from "@game/hooks/use-world";
import { useJobs } from "@game/hooks/use-jobs";
import { MAX_HUNGER } from "@/convex/foodConfig";
import { InventoryTab } from "./InventoryTab";
import { JobsTab } from "./JobsTab";
import { PropertiesTab } from "./PropertiesTab";
import { MapTab } from "./MapTab";
import { RankingsTab } from "./RankingsTab";
import { ChatTab } from "./ChatTab";
import { ProfileTab } from "./ProfileTab";
import { ControlsTab } from "./ControlsTabs";
import { useKeyboard } from "@game/hooks/use-keyboard";

const NAV_ITEMS = [
  {
    id: "map",
    name: "World Map",
    icon: Map,
    shortcut: "M",
    group: "gameplay",
  },
  {
    id: "inventory",
    name: "Inventory",
    icon: Package,
    shortcut: "I",
    group: "gameplay",
  },
  {
    id: "jobs",
    name: "Jobs",
    icon: Briefcase,
    shortcut: "J",
    group: "gameplay",
  },
  {
    id: "properties",
    name: "Properties",
    icon: Building2,
    shortcut: "P",
    group: "gameplay",
  },
  {
    id: "rankings",
    name: "Rankings",
    icon: BarChart3,
    shortcut: "R",
    group: "gameplay",
  },
  {
    id: "profile",
    name: "Profile",
    icon: User,
    shortcut: "K",
    group: "social",
  },
  {
    id: "chat",
    name: "Chat / Log",
    icon: MessageSquare,
    shortcut: "L",
    group: "social",
  },
  {
    id: "controls",
    name: "Controls",
    icon: Keyboard,
    shortcut: "H",
    group: "system",
  },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

export function GameMenu() {
  const [open, setOpen] = React.useState(false);
  const [activeNav, setActiveNav] = React.useState<NavId>("inventory");

  const { playerInfo, leaderboard, alivePlayers } = usePlayer();
  const { ownedCount, totalIncomePerCycle, properties } = useWorld();
  const { activeJob } = useJobs();

  useKeyboard({
    bindings: [
      {
        controlId: "toggle_menu",
        preventDefault: true,
        onKeyDown: () => setOpen((v) => !v),
      },
      {
        controlId: "close_menu",
        onKeyDown: () => setOpen(false),
      },
      {
        controlId: "open_inventory",
        onKeyDown: () => {
          setOpen(true);
          setActiveNav("inventory");
        },
      },
      {
        controlId: "open_map",
        onKeyDown: () => {
          setOpen(true);
          setActiveNav("map");
        },
      },
      {
        controlId: "open_jobs",
        onKeyDown: () => {
          setOpen(true);
          setActiveNav("jobs");
        },
      },
      {
        controlId: "open_properties",
        onKeyDown: () => {
          setOpen(true);
          setActiveNav("properties");
        },
      },
      {
        controlId: "open_rankings",
        onKeyDown: () => {
          setOpen(true);
          setActiveNav("rankings");
        },
      },
      {
        controlId: "open_chat",
        onKeyDown: () => {
          setOpen(true);
          setActiveNav("chat");
        },
      },
      {
        controlId: "open_profile",
        onKeyDown: () => {
          setOpen(true);
          setActiveNav("profile");
        },
      },
      {
        controlId: "open_controls",
        onKeyDown: () => {
          setOpen(true);
          setActiveNav("controls");
        },
      },
    ],
  });

  // Keep the minimap event listener in its own small useEffect:
  React.useEffect(() => {
    const handler = () => {
      setOpen(true);
      setActiveNav("map");
    };
    window.addEventListener("open-game-menu-map-tab", handler);
    return () => window.removeEventListener("open-game-menu-map-tab", handler);
  }, []);
  if (!playerInfo) return null;

  const currentItem = NAV_ITEMS.find((n) => n.id === activeNav)!;
  const jobsBadge = !!activeJob;
  const hunger = playerInfo.hunger ?? MAX_HUNGER;
  const isLowHunger = hunger <= 25;

  const gameplayItems = NAV_ITEMS.filter((n) => n.group === "gameplay");
  const socialItems = NAV_ITEMS.filter((n) => n.group === "social");
  const systemItems = NAV_ITEMS.filter((n) => n.group === "system");

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={true}
          className="overflow-hidden p-0 md:max-h-[80vh] md:max-w-5xl lg:max-w-275"
        >
          <DialogTitle className="sr-only">Game Menu</DialogTitle>
          <DialogDescription className="sr-only">
            Manage your inventory, jobs, properties, rankings, and more.
          </DialogDescription>

          <SidebarProvider className="items-start">
            {/* Sidebar */}
            <Sidebar collapsible="none" className="hidden md:flex border-r">
              <SidebarContent>
                {/* Gameplay */}
                <SidebarGroup>
                  <SidebarGroupLabel>Gameplay</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {gameplayItems.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={activeNav === item.id}
                            onClick={() => setActiveNav(item.id)}
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

                {/* Social */}
                <SidebarGroup>
                  <SidebarGroupLabel>Social</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {socialItems.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={activeNav === item.id}
                            onClick={() => setActiveNav(item.id)}
                            className="cursor-pointer"
                          >
                            <item.icon className="size-4" />
                            <span className="flex-1">{item.name}</span>
                            <kbd className="ml-auto text-[10px] font-mono text-muted-foreground/50">
                              {item.shortcut}
                            </kbd>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                {/* System */}
                <SidebarGroup>
                  <SidebarGroupLabel>System</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {systemItems.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={activeNav === item.id}
                            onClick={() => setActiveNav(item.id)}
                            className="cursor-pointer"
                          >
                            <item.icon className="size-4" />
                            <span className="flex-1">{item.name}</span>
                            <kbd className="ml-auto text-[10px] font-mono text-muted-foreground/50">
                              {item.shortcut}
                            </kbd>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                {/* Player info footer */}
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

            {/* Main Content */}
            <main className="flex h-[min(80vh,78vh)] flex-1 flex-col overflow-hidden">
              {/* Header */}
              <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="flex items-center gap-2">
                        <currentItem.icon className="size-4" />
                        {currentItem.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                {/* Mobile nav */}
                <div className="ml-auto flex items-center gap-1 md:hidden">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={cn(
                        "p-2 rounded-lg transition-colors relative",
                        activeNav === item.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <item.icon className="size-4" />
                    </button>
                  ))}
                </div>
              </header>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeNav === "inventory" && (
                  <InventoryTab inventory={playerInfo.inventory} />
                )}
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
                {activeNav === "chat" && (
                  <ChatTab playerName={playerInfo.name} />
                )}
                {activeNav === "profile" && <ProfileTab />}
                {activeNav === "controls" && <ControlsTab />}
              </div>
            </main>
          </SidebarProvider>
        </DialogContent>
      </Dialog>

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "pointer-events-auto relative size-12 rounded-full shadow-lg",
          "flex items-center justify-center",
          "transition-all duration-200 hover:scale-110 active:scale-95",
          "ring-2 ring-white/10",
          open
            ? " ring-primary/30 bg-primary text-primary-foreground"
            : "bg-muted text-foreground  hover:ring-primary/40",
        )}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <div
          className={cn(
            "transition-transform duration-300",
            open && "rotate-180",
          )}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </div>
        {!open && jobsBadge && (
          <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-orange-500 border-2 border-background animate-pulse" />
        )}
        {!open && isLowHunger && !jobsBadge && (
          <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
        )}
      </button>
    </>
  );
}
