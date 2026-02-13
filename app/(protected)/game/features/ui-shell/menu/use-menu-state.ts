// app/(protected)/game/features/ui-shell/menu/use-menu-state.ts
"use client";

import { useState, useEffect } from "react";
import { useKeyboard } from "@game/hooks/use-keyboard";

export type NavId =
  | "map"
  | "inventory"
  | "wardrobe"
  | "jobs"
  | "properties"
  | "rankings"
  | "profile"
  | "chat"
  | "controls";

export function useMenuState() {
  const [open, setOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<NavId>("inventory");

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
        controlId: "open_wardrobe",
        onKeyDown: () => {
          setOpen(true);
          setActiveNav("wardrobe");
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

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setActiveNav("map");
    };
    window.addEventListener("open-game-menu-map-tab", handler);
    return () => window.removeEventListener("open-game-menu-map-tab", handler);
  }, []);

  return {
    open,
    setOpen,
    activeNav,
    setActiveNav,
  };
}
