// /components/game/ui/GameMenu.tsx
"use client";

import * as React from "react";
import {
  Package,
  Briefcase,
  BarChart3,
  MessageSquare,
  Keyboard,
  X,
  Menu,
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
import { usePlayer } from "@/hooks/use-player";
import { useJobs } from "@/hooks/use-jobs";
import { InventoryTab } from "./InventoryTab";
import { JobsTab } from "./JobsTab";
import { RankingsTab } from "./RankingsTab";
import { ChatTab } from "./ChatTab";
import { ControlsTab } from "./ControlsTabs";

const NAV_ITEMS = [
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
    id: "rankings",
    name: "Rankings",
    icon: BarChart3,
    shortcut: "R",
    group: "gameplay",
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

  const { playerInfo, leaderboard } = usePlayer();
  const { activeJob } = useJobs();

  // Keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key.toLowerCase()) {
        case "tab":
          e.preventDefault();
          setOpen((v) => !v);
          break;
        case "i":
          setOpen(true);
          setActiveNav("inventory");
          break;
        case "j":
          setOpen(true);
          setActiveNav("jobs");
          break;
        case "r":
          setOpen(true);
          setActiveNav("rankings");
          break;
        case "l":
          setOpen(true);
          setActiveNav("chat");
          break;
        case "h":
          setOpen(true);
          setActiveNav("controls");
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!playerInfo) return null;

  const currentItem = NAV_ITEMS.find((n) => n.id === activeNav)!;
  const jobsBadge = !!activeJob;

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
            Manage your inventory, jobs, rankings, and more.
          </DialogDescription>

          <SidebarProvider className="items-start">
            {/* ── Sidebar ── */}
            <Sidebar collapsible="none" className="hidden md:flex border-r">
              <SidebarContent>
                {/* Gameplay group */}
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
                            {/* Active job badge on Jobs */}
                            {item.id === "jobs" && jobsBadge && (
                              <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
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

                {/* Social group */}
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

                {/* System group */}
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
                      🧑
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold truncate">
                        {playerInfo.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        ${(playerInfo.cash || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </SidebarContent>
            </Sidebar>

            {/* ── Main Content ── */}
            <main className="flex h-[min(80vh,78vh)] flex-1 flex-col overflow-hidden">
              {/* Header with breadcrumb */}
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

                <div className="ml-auto flex items-center gap-1 md:hidden">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
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

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeNav === "inventory" && (
                  <InventoryTab inventory={playerInfo.inventory} />
                )}
                {activeNav === "jobs" && <JobsTab />}
                {activeNav === "rankings" && (
                  <RankingsTab
                    leaderboard={leaderboard}
                    currentPlayerId={playerInfo._id}
                  />
                )}
                {activeNav === "chat" && (
                  <ChatTab playerName={playerInfo.name} />
                )}
                {activeNav === "controls" && <ControlsTab />}
              </div>
            </main>
          </SidebarProvider>
        </DialogContent>
      </Dialog>

      {/* ── FAB Trigger ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "pointer-events-auto relative size-14 rounded-full shadow-lg",
          "flex items-center justify-center",
          "transition-all duration-200 hover:scale-110 active:scale-95",
          "ring-2 ring-white/10",
          open
            ? "bg-muted text-foreground ring-primary/30"
            : "bg-primary text-primary-foreground hover:ring-primary/40",
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
        {/* Notification badge */}
        {!open && jobsBadge && (
          <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-orange-500 border-2 border-background animate-pulse" />
        )}
      </button>
    </>
  );
}
