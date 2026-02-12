"use client";

import { useRef, useState } from "react";
import { useTick } from "@pixi/react";
import { Player } from "@game/types/player";

interface InterpolatedPlayer extends Player {
  displayX: number;
  displayY: number;
}
// controls how quickly the displayed position catches up to the server position. Adjust for smoother or snappier movement.
const LERP_SPEED = 0.2; // Adjust for smoothness (0.1 = smoother, 0.3 = snappier)

export function useInterpolatedPlayers(
  serverPlayers: Player[],
): InterpolatedPlayer[] {
  const displayPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map(),
  );
  const [interpolatedPlayers, setInterpolatedPlayers] = useState<
    InterpolatedPlayer[]
  >([]);

  useTick(() => {
    const positions = displayPositions.current;

    // Remove players that are no longer in the server list
    const currentIds = new Set(serverPlayers.map((p) => p._id as string));
    for (const id of Array.from(positions.keys())) {
      if (!currentIds.has(id)) {
        positions.delete(id);
      }
    }

    const results: InterpolatedPlayer[] = [];

    for (const player of serverPlayers) {
      let display = positions.get(player._id);

      if (!display) {
        // First time seeing this player — snap to their position
        display = { x: player.x, y: player.y };
        positions.set(player._id, display);
      } else {
        // Lerp toward the server position
        display.x += (player.x - display.x) * LERP_SPEED;
        display.y += (player.y - display.y) * LERP_SPEED;

        // Snap if very close to avoid endless micro-movement
        if (
          Math.abs(player.x - display.x) < 0.5 &&
          Math.abs(player.y - display.y) < 0.5
        ) {
          display.x = player.x;
          display.y = player.y;
        }
      }

      results.push({
        ...player,
        displayX: display.x,
        displayY: display.y,
      });
    }

    setInterpolatedPlayers(results);
  });

  // On first render (before any tick), return server positions directly
  return interpolatedPlayers.length > 0
    ? interpolatedPlayers
    : serverPlayers.map((p) => ({ ...p, displayX: p.x, displayY: p.y }));
}
