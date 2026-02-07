"use client";

import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { useEffect, useState, useRef, useCallback } from "react";
import { Player } from "@/types/player";
import { usePlayer } from "@/hooks/use-player";
import { useWorld } from "@/hooks/use-world";
import { useJobs } from "@/hooks/use-jobs";
import { useMovement } from "@/hooks/use-movement";
import { getSpawnPoint } from "@/convex/gameConstants";
import { MAX_HUNGER } from "@/convex/foodConfig";

import { WorldGrid } from "./world/WorldGrid";
import { PropertyNode } from "./world/PropertyNode";
import { PlayerCharacter } from "./world/PlayerCharacter";
import { DeliveryMarker } from "./world/DeliveryMarker";

import { FloatingMinimap } from "../ui/FloatingMinimap";
import { DeliveryHUD } from "../ui/DeliveryHUD";
import { GameMenu } from "../ui/menu/GameMenu";
import Loading from "../ui/Loading";

extend({ Container, Graphics, Sprite, Text });

export function GameCanvas() {
  const [me, setMe] = useState<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { alivePlayers, initPlayer, updatePosition, playerInfo } = usePlayer();
  const { properties, initCity, buyProperty } = useWorld();
  const { activeJob } = useJobs();

  const hunger = playerInfo?.hunger ?? MAX_HUNGER;

  const onSync = useCallback(
    (pos: { x: number; y: number }) => updatePosition(pos),
    [updatePosition],
  );

  const spawn = getSpawnPoint();
  const { renderPos, resetPosition } = useMovement({
    initialPos: spawn,
    properties,
    onSync,
    hunger,
  });

  useEffect(() => {
    initPlayer().then((p) => {
      if (p) {
        setMe(p as unknown as Player);
        resetPosition({ x: p.x, y: p.y });
      }
    });
  }, [initPlayer, resetPosition]);

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

  const otherPlayers = alivePlayers
    .filter((p) => p._id !== me._id)
    .map((p) => ({ _id: p._id, x: p.x, y: p.y, name: p.name }));

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden bg-[#2c2c2c] relative"
    >
      {/* Hunger warning vignette */}
      {hunger < 15 && (
        <div
          className="absolute inset-0 pointer-events-none z-50 animate-pulse"
          style={{
            boxShadow: `inset 0 0 ${hunger < 5 ? 150 : 80}px rgba(239, 68, 68, ${hunger <= 0 ? 0.4 : 0.2})`,
          }}
        />
      )}

      {hunger <= 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <p className="text-red-500 font-black text-xl animate-pulse opacity-60 text-center">
            ⚠️ STARVING — BUY FOOD ⚠️
            <br />
            <span className="text-sm font-bold">Movement speed halved</span>
          </p>
        </div>
      )}

      {/* Top-right: Minimap + Delivery HUD */}
      <div className="absolute top-4 right-4 z-30 pointer-events-none flex flex-col items-end gap-3">
        <FloatingMinimap
          playerX={renderPos.x}
          playerY={renderPos.y}
          properties={properties}
          otherPlayers={otherPlayers}
          activeJob={
            activeJob as
              | (typeof activeJob & {
                  status:
                    | "available"
                    | "accepted"
                    | "picked_up"
                    | "completed"
                    | "cancelled";
                })
              | null
          }
          viewportWidth={vw}
          viewportHeight={vh}
        />
        <DeliveryHUD playerX={renderPos.x} playerY={renderPos.y} />
      </div>

      {/* Bottom-right: FAB Menu */}
      <div className="absolute bottom-6 left-6 z-40 pointer-events-none flex flex-col items-end">
        <GameMenu />
      </div>

      {/* PixiJS Canvas */}
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

          {activeJob && (
            <>
              <DeliveryMarker
                x={activeJob.pickupX}
                y={activeJob.pickupY}
                type="pickup"
                label={activeJob.pickupName}
                active={activeJob.status === "accepted"}
              />
              <DeliveryMarker
                x={activeJob.dropoffX}
                y={activeJob.dropoffY}
                type="dropoff"
                label={activeJob.dropoffName}
                active={activeJob.status === "picked_up"}
              />
            </>
          )}

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
