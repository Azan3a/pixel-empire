// components/game/viewport/GameCanvas.tsx
"use client";

import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Player } from "@/types/player";
import { usePlayer } from "@/hooks/use-player";
import { useWorld } from "@/hooks/use-world";
import { useJobs } from "@/hooks/use-jobs";
import { useMovement } from "@/hooks/use-movement";
import { useGameTime } from "@/hooks/use-game-time";
import { getSpawnPoint } from "@/convex/gameConstants";
import { MAX_HUNGER } from "@/convex/foodConfig";
import { Property } from "@/types/property";
import { Id } from "@/convex/_generated/dataModel";

import { WorldGrid } from "./world/WorldGrid";
import { PropertyNode } from "./world/PropertyNode";
import { PlayerCharacter } from "./world/player/PlayerCharacter";
import { DeliveryMarker } from "./world/DeliveryMarker";
import { DayNightOverlay } from "./world/DayNightOverlay";

import { FloatingMinimap } from "../ui/FloatingMinimap";
import { DeliveryHUD } from "../ui/DeliveryHUD";
import { GameMenu } from "../ui/menu/GameMenu";
import { PropertyDialog } from "../ui/PropertyDialog";
import Loading from "../ui/Loading";

extend({ Container, Graphics, Sprite, Text });

export function GameCanvas() {
  const [me, setMe] = useState<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const { alivePlayers, initPlayer, updatePosition, playerInfo } = usePlayer();
  const { properties, initCity, buyProperty, sellProperty } = useWorld();
  const { activeJob } = useJobs();
  const gameTime = useGameTime();

  const hunger = playerInfo?.hunger ?? MAX_HUNGER;
  const playerCash = playerInfo?.cash ?? 0;

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

  const handlePropertyClick = useCallback(
    (propertyId: Id<"properties">) => {
      const prop = properties.find((p) => p._id === propertyId);
      if (prop) {
        setSelectedProperty(prop);
        setPurchaseDialogOpen(true);
      }
    },
    [properties],
  );

  const handleBuyConfirm = useCallback(async () => {
    if (!selectedProperty) return;
    await buyProperty(selectedProperty._id);
    setPurchaseDialogOpen(false);
    setSelectedProperty(null);
  }, [selectedProperty, buyProperty]);

  const handleSellConfirm = useCallback(async () => {
    if (!selectedProperty) return;
    await sellProperty(selectedProperty._id);
    setPurchaseDialogOpen(false);
    setSelectedProperty(null);
  }, [selectedProperty, sellProperty]);

  const {
    tintR,
    tintG,
    tintB,
    overlayColor,
    overlayAlpha,
    streetLightAlpha,
    sunlightIntensity,
  } = gameTime.ambient;

  const bgColor = useMemo(() => {
    const bgR = Math.round(0x2c * tintR);
    const bgG = Math.round(0x2c * tintG);
    const bgB = Math.round(0x2c * tintB);
    return (bgR << 16) | (bgG << 8) | bgB;
  }, [tintR, tintG, tintB]);

  const bgHex = useMemo(
    () => `#${bgColor.toString(16).padStart(6, "0")}`,
    [bgColor],
  );

  if (!me) return <Loading />;

  const vw = typeof window !== "undefined" ? window.innerWidth : 800;
  const vh = typeof window !== "undefined" ? window.innerHeight : 600;
  const camX = vw / 2 - renderPos.x;
  const camY = vh / 2 - renderPos.y;

  const otherPlayers = alivePlayers
    .filter((p) => p._id !== me._id)
    .map((p) => ({ _id: p._id, x: p.x, y: p.y, name: p.name }));

  const isSelectedOwner =
    selectedProperty?.ownerId !== undefined &&
    me !== null &&
    selectedProperty.ownerId === me._id;

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden relative"
      style={{ backgroundColor: bgHex }}
    >
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

      <div className="absolute bottom-6 left-6 z-40 pointer-events-none flex flex-col items-end">
        <GameMenu />
      </div>

      <PropertyDialog
        property={selectedProperty}
        playerCash={playerCash}
        isOwner={isSelectedOwner}
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        onBuy={handleBuyConfirm}
        onSell={handleSellConfirm}
      />

      <Application background={bgColor} resizeTo={containerRef}>
        <pixiContainer x={camX} y={camY}>
          <WorldGrid tintR={tintR} tintG={tintG} tintB={tintB} />

          {properties.map((p) => (
            <PropertyNode
              key={p._id}
              property={p}
              isOwner={p.ownerId === me._id}
              onInteract={handlePropertyClick}
              sunlightIntensity={sunlightIntensity}
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
                sunlightIntensity={sunlightIntensity}
              />
            ))}

          <PlayerCharacter
            x={renderPos.x}
            y={renderPos.y}
            name={me.name}
            color={0x10b981}
            isMe={true}
            sunlightIntensity={sunlightIntensity}
          />

          <DayNightOverlay
            overlayColor={overlayColor}
            overlayAlpha={overlayAlpha}
            streetLightAlpha={streetLightAlpha}
          />
        </pixiContainer>
      </Application>
    </div>
  );
}
