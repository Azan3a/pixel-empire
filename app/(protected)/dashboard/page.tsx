"use client";

import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { useCallback, useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GameUI } from "@/components/game-ui";
import { Player } from "@/types/player";
import { WorldNode } from "@/types/world_node";

// Extend PixiJS classes
extend({ Container, Graphics, Sprite, Text });

const MAP_SIZE = 2000;
const TILE_SIZE = 50;

export default function GamePage() {
  const [me, setMe] = useState<Player | null>(null);
  const otherPlayers =
    (useQuery(api.players.getAlivePlayers) as Player[]) || [];
  const resources = (useQuery(api.world.getResources) as WorldNode[]) || [];
  const initPlayer = useMutation(api.players.getOrCreatePlayer);
  const updatePos = useMutation(api.players.updatePosition);
  const collect = useMutation(api.world.collectResource);
  const seed = useMutation(api.world.seedResources);

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

      // Clamp to map
      localPos.current.x = Math.max(0, Math.min(MAP_SIZE, localPos.current.x));
      localPos.current.y = Math.max(0, Math.min(MAP_SIZE, localPos.current.y));

      if (moved) {
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

  const drawPlayer = useCallback((g: Graphics, color: number) => {
    g.clear();
    g.setFillStyle({ color });
    g.circle(0, 0, 20);
    g.fill();
  }, []);

  const drawResource = useCallback(
    (g: Graphics, type: string, health: number) => {
      g.clear();
      let color = 0x00ff00; // tree
      if (type === "rock") color = 0x888888;
      if (type === "ore_deposit") color = 0xffd700;

      g.setFillStyle({ color, alpha: health > 0 ? 1 : 0.2 });
      if (type === "tree") {
        g.moveTo(0, -25).lineTo(20, 10).lineTo(-20, 10).closePath();
      } else {
        g.rect(-15, -15, 30, 30);
      }
      g.fill();
    },
    [],
  );

  const drawGrid = useCallback((g: Graphics) => {
    g.clear();
    g.setStrokeStyle({ color: 0xeeeeee, width: 1 });
    for (let i = 0; i <= MAP_SIZE; i += TILE_SIZE) {
      g.moveTo(i, 0).lineTo(i, MAP_SIZE);
      g.moveTo(0, i).lineTo(MAP_SIZE, i);
    }
    g.stroke();
  }, []);

  if (!me)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading world...
      </div>
    );

  // Camera calculation: center localPos in view
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 800;
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 600;

  const camX = viewportWidth / 2 - renderPos.x;
  const camY = viewportHeight / 2 - renderPos.y;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#fafafa]">
      <Application
        background="#eef2f3"
        resizeTo={typeof window !== "undefined" ? window : undefined}
      >
        <pixiContainer x={camX} y={camY}>
          {/* Grid */}
          <pixiGraphics draw={drawGrid} />

          {/* Resources */}
          {resources.map((res) => (
            <pixiContainer
              key={res._id}
              x={res.x}
              y={res.y}
              eventMode="static"
              onClick={() => collect({ nodeId: res._id })}
            >
              <pixiGraphics
                draw={(g) => drawResource(g, res.type, res.health)}
              />
            </pixiContainer>
          ))}

          {/* Other Players */}
          {otherPlayers
            .filter((p) => p._id !== me._id)
            .map((p) => (
              <pixiContainer key={p._id} x={p.x} y={p.y}>
                <pixiGraphics draw={(g) => drawPlayer(g, 0x0000ff)} />
                <pixiText
                  text={p.name}
                  anchor={0.5}
                  y={-35}
                  style={{ fontSize: 14, fill: 0x333333 }}
                />
              </pixiContainer>
            ))}

          {/* Local Player */}
          <pixiContainer x={renderPos.x} y={renderPos.y}>
            <pixiGraphics draw={(g) => drawPlayer(g, 0xff0000)} />
            <pixiText
              text={`${me.name} (You)`}
              anchor={0.5}
              y={-35}
              style={{ fontSize: 14, fontWeight: "bold", fill: 0x000000 }}
            />
          </pixiContainer>
        </pixiContainer>
      </Application>

      <GameUI />
    </div>
  );
}
