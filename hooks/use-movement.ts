// hooks/use-movement.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { Property } from "@/types/property";
import { MAP_SIZE } from "@/convex/gameConstants";
import { HUNGER_SLOW_THRESHOLD } from "@/convex/foodConfig";

const BASE_SPEED = 5;
const SYNC_INTERVAL = 100;
const TICK_RATE = 16;
const PLAYER_HITBOX = 40;

interface UseMovementOptions {
  initialPos: { x: number; y: number };
  properties: Property[];
  onSync: (pos: { x: number; y: number }) => void;
  hunger?: number;
}

export function useMovement({
  initialPos,
  properties,
  onSync,
  hunger = 100,
}: UseMovementOptions) {
  const [renderPos, setRenderPos] = useState(initialPos);
  const localPos = useRef(initialPos);
  const keys = useRef<Record<string, boolean>>({});
  const lastSync = useRef(0);
  const propertiesRef = useRef<Property[]>([]);
  const hungerRef = useRef(hunger);

  useEffect(() => {
    propertiesRef.current = properties;
  }, [properties]);

  useEffect(() => {
    hungerRef.current = hunger;
  }, [hunger]);

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
      // ── Speed scales with hunger ──
      const h = hungerRef.current;
      const speedMultiplier =
        h < HUNGER_SLOW_THRESHOLD
          ? 0.5 + (h / HUNGER_SLOW_THRESHOLD) * 0.5 // 0.5 at 0, 1.0 at threshold
          : 1.0;
      const speed = Math.max(1, Math.round(BASE_SPEED * speedMultiplier));

      let dx = 0;
      let dy = 0;

      if (keys.current["w"] || keys.current["arrowup"]) dy -= speed;
      if (keys.current["s"] || keys.current["arrowdown"]) dy += speed;
      if (keys.current["a"] || keys.current["arrowleft"]) dx -= speed;
      if (keys.current["d"] || keys.current["arrowright"]) dx += speed;

      if (dx === 0 && dy === 0) return;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const factor = speed / Math.sqrt(dx * dx + dy * dy);
        dx = Math.round(dx * factor);
        dy = Math.round(dy * factor);
      }

      const newX = localPos.current.x + dx;
      const newY = localPos.current.y + dy;

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

      localPos.current.x = Math.max(0, Math.min(MAP_SIZE, newX));
      localPos.current.y = Math.max(0, Math.min(MAP_SIZE, newY));

      setRenderPos({ x: localPos.current.x, y: localPos.current.y });

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
