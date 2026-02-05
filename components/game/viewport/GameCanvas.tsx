"use client";

import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { useEffect, useState, useRef } from "react";
import { Player } from "@/types/player";
import { usePlayer } from "@/hooks/use-player";
import { useWorld } from "@/hooks/use-world";

// Components
import { WorldGrid } from "./world/WorldGrid";
import { ResourceNode } from "./world/ResourceNode";
import { BuildingNode } from "./world/BuildingNode";
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
  const {
    resources,
    buildings,
    collectResource: collect,
    collectProduction,
    seedResources: seed,
  } = useWorld();

  const [renderPos, setRenderPos] = useState({ x: 400, y: 300 });
  const localPos = useRef({ x: 400, y: 300 });
  const keys = useRef<Record<string, boolean>>({});
  const lastSync = useRef(0);

  // Initialize player
  useEffect(() => {
    initPlayer().then((p) => {
      if (p) {
        setMe(p as unknown as Player);
        localPos.current = { x: p.x, y: p.y };
        setRenderPos({ x: p.x, y: p.y });
      }
    });
    // Seed world if empty
    seed();
  }, [initPlayer, seed]);

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
      let moved = false;
      const speed = 5;
      if (keys.current["w"] || keys.current["arrowup"]) {
        localPos.current.y -= speed;
        moved = true;
      }
      if (keys.current["s"] || keys.current["arrowdown"]) {
        localPos.current.y += speed;
        moved = true;
      }
      if (keys.current["a"] || keys.current["arrowleft"]) {
        localPos.current.x -= speed;
        moved = true;
      }
      if (keys.current["d"] || keys.current["arrowright"]) {
        localPos.current.x += speed;
        moved = true;
      }

      if (moved) {
        // Clamp to map
        localPos.current.x = Math.max(
          0,
          Math.min(MAP_SIZE, localPos.current.x),
        );
        localPos.current.y = Math.max(
          0,
          Math.min(MAP_SIZE, localPos.current.y),
        );

        setRenderPos({ x: localPos.current.x, y: localPos.current.y });

        // Sync to server every 100ms
        if (Date.now() - lastSync.current > 100) {
          updatePos({ x: localPos.current.x, y: localPos.current.y });
          lastSync.current = Date.now();
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
      className="h-full w-full overflow-hidden bg-[#fafafa]"
    >
      <Application background="#eef2f3" resizeTo={containerRef}>
        <pixiContainer x={camX} y={camY}>
          {/* Grid */}
          <WorldGrid mapSize={MAP_SIZE} tileSize={TILE_SIZE} />

          {/* Resources */}
          {resources.map((res) => (
            <ResourceNode
              key={res._id}
              resource={res}
              onCollect={(nodeId) => collect(nodeId)}
            />
          ))}

          {/* Buildings */}
          {buildings.map((b) => (
            <BuildingNode
              key={b._id}
              building={b}
              isOwner={b.playerId === me._id}
              onCollectProduction={(buildingId) =>
                collectProduction(buildingId)
              }
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
