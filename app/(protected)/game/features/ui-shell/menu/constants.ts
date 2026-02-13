// app/(protected)/game/features/ui-shell/menu/constants.ts
import {
  Package,
  Briefcase,
  BarChart3,
  MessageSquare,
  Keyboard,
  Map,
  Building2,
  User,
  Shirt,
} from "lucide-react";

export const NAV_ITEMS = [
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
    id: "wardrobe",
    name: "Wardrobe",
    icon: Shirt,
    shortcut: "C",
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

export type NavId = (typeof NAV_ITEMS)[number]["id"];
