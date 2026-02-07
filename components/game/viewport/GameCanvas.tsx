// /components/game/viewport/GameCanvas.tsx
"use client";

import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { useEffect, useState, useRef, useCallback } from "react";
import { Player } from "@/types/player";
import { usePlayer } from "@/hooks/use-player";
import { useWorld } from "@/hooks/use-world";
import { useMovement } from "@/hooks/use-movement";

import { WorldGrid } from "./world/WorldGrid";
import { PropertyNode } from "./world/PropertyNode";
import { PlayerCharacter } from "./world/PlayerCharacter";
import Loading from "../ui/Loading";
import { MAP_SIZE, TILE_SIZE, getSpawnPoint } from "@/convex/gameConstants";

extend({ Container, Graphics, Sprite, Text });

export function GameCanvas() {
  const [me, setMe] = useState<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { alivePlayers, initPlayer, updatePosition } = usePlayer();
  const { properties, initCity, buyProperty } = useWorld();

  const onSync = useCallback(
    (pos: { x: number; y: number }) => updatePosition(pos),
    [updatePosition],
  );
  const spawn = getSpawnPoint();
  const { renderPos, resetPosition } = useMovement({
    initialPos: spawn,
    properties,
    onSync,
  });

  // Initialize player
  useEffect(() => {
    initPlayer().then((p) => {
      if (p) {
        setMe(p as unknown as Player);
        resetPosition({ x: p.x, y: p.y });
      }
    });
  }, [initPlayer, resetPosition]);

  // Init city
  useEffect(() => {
    if (properties.length === 0) {
      const timer = setTimeout(() => {
        if (properties.length === 0) initCity();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [properties, initCity]);

  if (!me) return <Loading />;

  const vw = typeof window !== "undefined" ? window.innerWidth : 800;
  const vh = typeof window !== "undefined" ? window.innerHeight : 600;
  const camX = vw / 2 - renderPos.x;
  const camY = vh / 2 - renderPos.y;

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden bg-[#2c2c2c]"
    >
      <Application background="#2c2c2c" resizeTo={containerRef}>
        <pixiContainer x={camX} y={camY}>
          <WorldGrid />

          {properties.map((p) => (
            <PropertyNode
              key={p._id}
              property={p}
              isOwner={p.ownerId === me._id}
              onInteract={(id) => buyProperty(id)}
            />
          ))}

          {alivePlayers
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
