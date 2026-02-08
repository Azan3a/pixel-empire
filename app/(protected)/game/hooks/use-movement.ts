// hooks/use-movement.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { Property } from "@game/types/property";
import { MAP_SIZE } from "@/convex/gameConstants";
import { HUNGER_SLOW_THRESHOLD } from "@/convex/foodConfig";
import { getZoneAt, ZONES, WATER_LINE_Y } from "@/convex/mapZones";
import { useKeysPressed, isControlPressed } from "@game/hooks/use-keyboard";

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
  const keys = useKeysPressed();
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

  // Movement tick
  useEffect(() => {
    const interval = setInterval(() => {
      // ── Hunger speed scaling ──
      const h = hungerRef.current;
      const hungerMultiplier =
        h < HUNGER_SLOW_THRESHOLD
          ? 0.5 + (h / HUNGER_SLOW_THRESHOLD) * 0.5
          : 1.0;

      // ── Zone-based speed scaling ──
      const currentZoneId = getZoneAt(localPos.current.x, localPos.current.y);
      const zoneMultiplier = ZONES[currentZoneId].speedMultiplier;

      const speed = Math.max(
        1,
        Math.round(BASE_SPEED * hungerMultiplier * zoneMultiplier),
      );

      let dx = 0;
      let dy = 0;

      if (isControlPressed(keys, "move_up")) dy -= speed;
      if (isControlPressed(keys, "move_down")) dy += speed;
      if (isControlPressed(keys, "move_left")) dx -= speed;
      if (isControlPressed(keys, "move_right")) dx += speed;

      if (dx === 0 && dy === 0) return;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const factor = speed / Math.sqrt(dx * dx + dy * dy);
        dx = Math.round(dx * factor);
        dy = Math.round(dy * factor);
      }

      let newX = localPos.current.x + dx;
      let newY = localPos.current.y + dy;

      // ── Map boundaries ──
      newX = Math.max(0, Math.min(MAP_SIZE, newX));
      newY = Math.max(0, Math.min(MAP_SIZE, newY));

      // ── Ocean boundary — can't walk into water ──
      const halfSize = PLAYER_HITBOX / 2;
      const playerBottom = newY + halfSize;
      if (playerBottom > WATER_LINE_Y) {
        newY = WATER_LINE_Y - halfSize;
      }

      // ── Building collision (AABB) ──
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

      localPos.current.x = newX;
      localPos.current.y = newY;

      setRenderPos({ x: localPos.current.x, y: localPos.current.y });

      const now = Date.now();
      if (now - lastSync.current > SYNC_INTERVAL) {
        onSync({ x: localPos.current.x, y: localPos.current.y });
        lastSync.current = now;
      }
    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [onSync, keys]);

  return { renderPos, resetPosition };
}
