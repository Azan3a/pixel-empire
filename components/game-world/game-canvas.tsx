"use client";

import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { useCallback, useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Player from "@/types/player";
import WorldNode from "@/types/world_node";

// Extend PixiJS classes
extend({ Container, Graphics, Sprite, Text });

const MAP_SIZE = 2000;
const TILE_SIZE = 50;

export function GameCanvas() {
  const [me, setMe] = useState<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

  const drawPlayer = useCallback(
    (g: Graphics, color: number, isMe: boolean) => {
      g.clear();
      // Shadow
      g.setFillStyle({ color: 0x000000, alpha: 0.1 });
      g.ellipse(2, 22, 15, 6);
      g.fill();

      // Body
      g.setFillStyle({ color });
      g.circle(0, 0, 22);
      g.fill();

      // Border
      g.setStrokeStyle({
        color: isMe ? 0xffffff : 0x000000,
        width: 3,
        alpha: isMe ? 0.8 : 0.2,
      });
      g.circle(0, 0, 22);
      g.stroke();
    },
    [],
  );

  const drawResource = useCallback(
    (g: Graphics, type: string, health: number) => {
      g.clear();
      let color = 0x22c55e; // tree emerald
      if (type === "rock") color = 0x94a3b8; // stone slate
      if (type === "ore_deposit") color = 0xeab308; // ore amber

      const alpha = health > 0 ? 1 : 0.15;
      g.setFillStyle({ color, alpha });

      if (type === "tree") {
        // Simple pine shape
        g.moveTo(0, -35).lineTo(25, 5).lineTo(-25, 5).closePath();
        g.fill();
        g.rect(-6, 5, 12, 15);
        g.fill();
      } else {
        // Blobby rock or crystal
        g.moveTo(-15, -15)
          .lineTo(15, -20)
          .lineTo(20, 10)
          .lineTo(-5, 20)
          .lineTo(-20, 5)
          .closePath();
        g.fill();
      }
    },
    [],
  );

  const drawGrid = useCallback((g: Graphics) => {
    g.clear();
    // Subtle background
    g.setFillStyle({ color: 0xf8fafc });
    g.rect(0, 0, MAP_SIZE, MAP_SIZE);
    g.fill();

    // Subtle lines
    g.setStrokeStyle({ color: 0xe2e8f0, width: 1 });
    for (let i = 0; i <= MAP_SIZE; i += TILE_SIZE) {
      g.moveTo(i, 0).lineTo(i, MAP_SIZE);
      g.moveTo(0, i).lineTo(MAP_SIZE, i);
    }
    g.stroke();
  }, []);

  if (!me)
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <div className="text-xl font-bold text-emerald-500 tracking-widest uppercase animate-pulse">
            Initializing World...
          </div>
        </div>
      </div>
    );

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
                <pixiGraphics draw={(g) => drawPlayer(g, 0xef4444, false)} />
                <pixiText
                  text={p.name}
                  x={0}
                  y={-45}
                  anchor={0.5}
                  style={{
                    fill: "#333333",
                    fontSize: 14,
                    fontWeight: "bold",
                    dropShadow: true,
                    dropShadowBlur: 2,
                    dropShadowColor: "#ffffff",
                    dropShadowDistance: 0,
                  }}
                />
              </pixiContainer>
            ))}

          {/* Local Player */}
          <pixiContainer x={renderPos.x} y={renderPos.y}>
            <pixiGraphics draw={(g) => drawPlayer(g, 0x10b981, true)} />
            <pixiText
              text={me.name}
              x={0}
              y={-45}
              anchor={0.5}
              style={{
                fill: "#059669",
                fontSize: 14,
                fontWeight: "900",
                dropShadow: true,
                dropShadowBlur: 4,
                dropShadowColor: "#ffffff",
                dropShadowDistance: 0,
              }}
            />
          </pixiContainer>
        </pixiContainer>
      </Application>
    </div>
  );
}
