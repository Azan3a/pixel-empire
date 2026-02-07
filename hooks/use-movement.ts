// hooks/use-movement.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { Property } from "@/types/property";

const MAP_SIZE = 2000;
const SPEED = 5;
const SYNC_INTERVAL = 100;
const TICK_RATE = 16;
const PLAYER_HITBOX = 40;

interface UseMovementOptions {
  initialPos: { x: number; y: number };
  properties: Property[];
  onSync: (pos: { x: number; y: number }) => void;
}

export function useMovement({
  initialPos,
  properties,
  onSync,
}: UseMovementOptions) {
  const [renderPos, setRenderPos] = useState(initialPos);
  const localPos = useRef(initialPos);
  const keys = useRef<Record<string, boolean>>({});
  const lastSync = useRef(0);
  const propertiesRef = useRef<Property[]>([]);

  // Keep properties ref in sync
  useEffect(() => {
    propertiesRef.current = properties;
  }, [properties]);

  // Allow resetting position (e.g. on init/respawn)
  const resetPosition = useCallback((pos: { x: number; y: number }) => {
    localPos.current = { ...pos };
    setRenderPos({ ...pos });
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Movement tick
  useEffect(() => {
    const interval = setInterval(() => {
      let dx = 0;
      let dy = 0;

      if (keys.current["w"] || keys.current["arrowup"]) dy -= SPEED;
      if (keys.current["s"] || keys.current["arrowdown"]) dy += SPEED;
      if (keys.current["a"] || keys.current["arrowleft"]) dx -= SPEED;
      if (keys.current["d"] || keys.current["arrowright"]) dx += SPEED;

      if (dx === 0 && dy === 0) return;

      const newX = localPos.current.x + dx;
      const newY = localPos.current.y + dy;

      // AABB collision against properties
      const halfSize = PLAYER_HITBOX / 2;
      const pLeft = newX - halfSize;
      const pTop = newY - halfSize;

      const collides = propertiesRef.current.some(
        (prop) =>
          pLeft < prop.x + prop.width &&
          pLeft + PLAYER_HITBOX > prop.x &&
          pTop < prop.y + prop.height &&
          pTop + PLAYER_HITBOX > prop.y,
      );

      if (collides) return;

      // Clamp to map bounds
      localPos.current.x = Math.max(0, Math.min(MAP_SIZE, newX));
      localPos.current.y = Math.max(0, Math.min(MAP_SIZE, newY));

      setRenderPos({ x: localPos.current.x, y: localPos.current.y });

      // Throttled server sync
      const now = Date.now();
      if (now - lastSync.current > SYNC_INTERVAL) {
        onSync({ x: localPos.current.x, y: localPos.current.y });
        lastSync.current = now;
      }
    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [onSync]);

  return { renderPos, resetPosition };
}
