"use client";

import { useEffect, useRef } from "react";

// ── Single source of truth for all keyboard controls ──
export const CONTROL_MAP = {
  // Movement (handled by movement tick, not discrete events)
  move_up: { keys: ["w", "arrowup"], action: "Move Up", group: "movement" },
  move_down: {
    keys: ["s", "arrowdown"],
    action: "Move Down",
    group: "movement",
  },
  move_left: {
    keys: ["a", "arrowleft"],
    action: "Move Left",
    group: "movement",
  },
  move_right: {
    keys: ["d", "arrowright"],
    action: "Move Right",
    group: "movement",
  },

  // Interaction
  interact: { keys: ["f"], action: "Interact", group: "gameplay" },

  // Menu navigation
  toggle_menu: { keys: ["tab"], action: "Toggle Menu", group: "menu" },
  close_menu: { keys: ["escape"], action: "Close Menus", group: "menu" },
  open_inventory: { keys: ["i"], action: "Inventory", group: "menu" },
  open_map: { keys: ["m"], action: "World Map", group: "menu" },
  open_jobs: { keys: ["j"], action: "Jobs", group: "menu" },
  open_properties: { keys: ["p"], action: "Properties", group: "menu" },
  open_rankings: { keys: ["r"], action: "Rankings", group: "menu" },
  open_chat: { keys: ["l"], action: "Chat / Log", group: "menu" },
  open_profile: { keys: ["k"], action: "Profile", group: "menu" },
  open_controls: { keys: ["h"], action: "Controls", group: "menu" },
  open_food: { keys: ["e"], action: "Food Menu", group: "gameplay" },
  open_wardrobe: { keys: ["c"], action: "Wardrobe", group: "menu" },
} as const;

export type ControlId = keyof typeof CONTROL_MAP;
export type ControlGroup = (typeof CONTROL_MAP)[ControlId]["group"];

// ── Derived controls list for the ControlsTab ──
export function getControlsList(): {
  action: string;
  keys: string[];
  group: ControlGroup;
}[] {
  // Group movement into a single display entry
  const entries: { action: string; keys: string[]; group: ControlGroup }[] = [
    { action: "Move", keys: ["WASD", "Arrows"], group: "movement" },
  ];

  const seen = new Set<string>([
    "move_up",
    "move_down",
    "move_left",
    "move_right",
  ]);

  for (const [id, control] of Object.entries(CONTROL_MAP)) {
    if (seen.has(id)) continue;
    seen.add(id);

    const displayKeys = control.keys.map((k) => {
      if (k === "tab") return "Tab";
      if (k === "escape") return "Esc";
      return k.toUpperCase();
    });

    entries.push({
      action: control.action,
      keys: displayKeys,
      group: control.group,
    });
  }

  return entries;
}

// ── Types for handler registration ──
type KeyHandler = (e: KeyboardEvent) => void;

interface KeyBinding {
  /** Control ID from CONTROL_MAP */
  controlId: ControlId;
  /** Handler to call on keydown */
  onKeyDown: KeyHandler;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Only fire when no input/textarea is focused (default: true) */
  ignoreInputs?: boolean;
}

interface UseKeyboardOptions {
  /** Array of key bindings to register */
  bindings: KeyBinding[];
  /** Master enable/disable (default: true) */
  enabled?: boolean;
}

/**
 * Centralized keyboard hook that handles:
 * - Registering/unregistering keydown handlers
 * - Ignoring events from input/textarea fields
 * - Preventing default for specified keys (e.g., Tab)
 * - Looking up keys from CONTROL_MAP
 */
export function useKeyboard({ bindings, enabled = true }: UseKeyboardOptions) {
  const bindingsRef = useRef(bindings);

  // Keep bindings ref up to date without re-registering the listener
  useEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";

      for (const binding of bindingsRef.current) {
        const control = CONTROL_MAP[binding.controlId];
        if (!(control.keys as readonly string[]).includes(key)) continue;

        const ignoreInputs = binding.ignoreInputs ?? true;
        if (ignoreInputs && isInput) continue;

        if (binding.preventDefault) {
          e.preventDefault();
        }

        binding.onKeyDown(e);
        // Don't break — allow multiple bindings for the same key if needed
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled]);
}

// ── Pressed-keys tracker for continuous input (movement) ──

/**
 * Tracks which keys are currently held down.
 * Returns a ref to a Set<string> of pressed key names (lowercase).
 * Useful for movement loops that poll key state each tick.
 */
export function useKeysPressed(enabled = true) {
  const pressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentPressed = pressed.current;

    if (!enabled) {
      currentPressed.clear();
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      currentPressed.add(e.key.toLowerCase());
    };

    const onKeyUp = (e: KeyboardEvent) => {
      currentPressed.delete(e.key.toLowerCase());
    };

    // Clear all keys if window loses focus
    const onBlur = () => {
      currentPressed.clear();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      currentPressed.clear();
    };
  }, [enabled]);

  return pressed;
}

/**
 * Helper: check if any key for a given control is currently pressed.
 */
export function isControlPressed(
  pressed: React.RefObject<Set<string>>,
  controlId: ControlId,
): boolean {
  const control = CONTROL_MAP[controlId];
  for (const key of control.keys as readonly string[]) {
    if (pressed.current?.has(key)) return true;
  }
  return false;
}
