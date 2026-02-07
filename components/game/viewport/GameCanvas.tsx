// /components/game/viewport/GameCanvas.tsx
"use client";

import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { useEffect, useState, useRef } from "react";
import { Player } from "@/types/player";
import { usePlayer } from "@/hooks/use-player";
import { useWorld } from "@/hooks/use-world";
import { Property } from "@/types/property";

// Components
import { WorldGrid } from "./world/WorldGrid";
import { PropertyNode } from "./world/PropertyNode";
import { PlayerCharacter } from "./world/PlayerCharacter";
import Loading from "../ui/Loading";

// Extend PixiJS classes
extend({ Container, Graphics, Sprite, Text });

const MAP_SIZE = 2000;
const TILE_SIZE = 50;

export function GameCanvas() {
  const [me, setMe] = useState<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    alivePlayers: otherPlayers,
    initPlayer,
    updatePosition: updatePos,
  } = usePlayer();
  const { properties, initCity, buyProperty } = useWorld();

  const [renderPos, setRenderPos] = useState({ x: 400, y: 300 });
  const localPos = useRef({ x: 400, y: 300 });
  const keys = useRef<Record<string, boolean>>({});
  const lastSync = useRef(0);
  // Keep track of properties ref for collision inside interval
  const propertiesRef = useRef<Property[]>([]);

  useEffect(() => {
    propertiesRef.current = properties;
  }, [properties]);

  // Initialize player
  useEffect(() => {
    initPlayer().then((p) => {
      if (p) {
        setMe(p as unknown as Player);
        localPos.current = { x: p.x, y: p.y };
        setRenderPos({ x: p.x, y: p.y });
      }
    });
  }, [initPlayer]);

  // Init City if needed
  useEffect(() => {
    if (properties.length === 0) {
      // Debounce or just call it, backend usually handles idempotency or we check once
      const timer = setTimeout(() => {
        // double check after a small delay to ensure data loaded
        if (properties.length === 0) initCity();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [properties, initCity]);

  // Input handling
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) =>
      (keys.current[e.key.toLowerCase()] = true);
    const onKeyUp = (e: KeyboardEvent) =>
      (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Movement loop
  useEffect(() => {
    const interval = setInterval(() => {
      const speed = 5;
      let dx = 0;
      let dy = 0;

      if (keys.current["w"] || keys.current["arrowup"]) dy -= speed;
      if (keys.current["s"] || keys.current["arrowdown"]) dy += speed;
      if (keys.current["a"] || keys.current["arrowleft"]) dx -= speed;
      if (keys.current["d"] || keys.current["arrowright"]) dx += speed;

      if (dx !== 0 || dy !== 0) {
        const newX = localPos.current.x + dx;
        const newY = localPos.current.y + dy;

        // Collision Check (Player ~22px radius, use AABB approx 40x40)
        let collides = false;
        const pSize = 40;
        const pX = newX - pSize / 2;
        const pY = newY - pSize / 2;

        for (const prop of propertiesRef.current) {
          // Check intersection AABB
          if (
            pX < prop.x + prop.width &&
            pX + pSize > prop.x &&
            pY < prop.y + prop.height &&
            pY + pSize > prop.y
          ) {
            collides = true;
            break;
          }
        }

        if (!collides) {
          // Clamp to map
          localPos.current.x = Math.max(0, Math.min(MAP_SIZE, newX));
          localPos.current.y = Math.max(0, Math.min(MAP_SIZE, newY));

          setRenderPos({ x: localPos.current.x, y: localPos.current.y });

          // Sync to server every 100ms
          if (Date.now() - lastSync.current > 100) {
            updatePos({ x: localPos.current.x, y: localPos.current.y });
            lastSync.current = Date.now();
          }
        }
      }
    }, 16);
    return () => clearInterval(interval);
  }, [updatePos]);

  if (!me) return <Loading />;

  // Camera calculation: center localPos in view
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 800;
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 600;

  const camX = viewportWidth / 2 - renderPos.x;
  const camY = viewportHeight / 2 - renderPos.y;

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden bg-[#2c2c2c]"
    >
      <Application background="#2c2c2c" resizeTo={containerRef}>
        <pixiContainer x={camX} y={camY}>
          {/* Grid */}
          <WorldGrid mapSize={MAP_SIZE} tileSize={TILE_SIZE} />

          {/* Properties */}
          {properties.map((p) => (
            <PropertyNode
              key={p._id}
              property={p}
              isOwner={p.ownerId === me._id}
              onInteract={(id) => buyProperty(id)}
            />
          ))}

          {/* Other Players */}
          {otherPlayers
            .filter((p) => p._id !== me._id)
            .map((p) => (
              <PlayerCharacter
                key={p._id}
                x={p.x}
                y={p.y}
                name={p.name}
                color={0xef4444}
                isMe={false}
              />
            ))}

          {/* Local Player */}
          <PlayerCharacter
            x={renderPos.x}
            y={renderPos.y}
            name={me.name}
            color={0x10b981}
            isMe={true}
          />
        </pixiContainer>
      </Application>
    </div>
  );
}
