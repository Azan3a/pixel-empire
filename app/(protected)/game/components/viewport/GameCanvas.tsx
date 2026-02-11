"use client";

import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Player } from "@game/types/player";
import { usePlayer } from "@game/hooks/use-player";
import { useWorld } from "@game/hooks/use-world";
import { useJobs } from "@game/hooks/use-jobs";
import { useMovement } from "@game/hooks/use-movement";
import { useGameTime } from "@game/hooks/use-game-time";
import { getSpawnPoint, SHOP_INTERACT_RADIUS } from "@/convex/map/constants";
import { MAX_HUNGER } from "@/convex/foodConfig";
import { Property } from "@game/types/property";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { WorldGrid } from "./world/WorldGrid";
import { PropertyNode } from "./world/PropertyNode";
import { PlayerCharacter } from "./world/player/PlayerCharacter";
import { DeliveryMarker } from "./world/DeliveryMarker";
import { DayNightOverlay } from "./world/daynight/DayNightOverlay";

import { FloatingMinimap } from "../ui/FloatingMinimap";
import { DeliveryHUD } from "../ui/DeliveryHUD";
import { PropertyDialog } from "../ui/PropertyDialog";
import { ShopDialog } from "../ui/ShopDialog";
import Loading from "../ui/Loading";

extend({ Container, Graphics, Sprite, Text });

export function GameCanvas() {
  const [me, setMe] = useState<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const [selectedShop, setSelectedShop] = useState<Property | null>(null);
  const [shopDialogOpen, setShopDialogOpen] = useState(false);

  const { alivePlayers, initPlayer, updatePosition, playerInfo } = usePlayer();
  const {
    properties,
    initCity,
    buyProperty,
    sellProperty,
    // collectIncome,
    // getPlayerZone,
    // ownedCount,
    // totalIncomePerCycle,
  } = useWorld();
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

  // Ref to track current position without re-creating click callbacks every frame
  const renderPosRef = useRef(renderPos);
  useEffect(() => {
    renderPosRef.current = renderPos;
  }, [renderPos]);

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
      if (!prop) return;

      if (prop.category === "shop") {
        // Compute distance from player to building center
        const centerX = prop.x + prop.width / 2;
        const centerY = prop.y + prop.height / 2;
        const pos = renderPosRef.current;
        const distance = Math.sqrt(
          (centerX - pos.x) ** 2 + (centerY - pos.y) ** 2,
        );

        if (distance <= SHOP_INTERACT_RADIUS) {
          setSelectedShop(prop);
          setShopDialogOpen(true);
        } else {
          toast("Walk closer to enter this shop", {
            description: `You need to be near ${prop.name} to shop here.`,
          });
        }
      } else {
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

  const handleShopBuyProperty = useCallback(async () => {
    if (!selectedShop) return;
    await buyProperty(selectedShop._id);
    setShopDialogOpen(false);
    setSelectedShop(null);
  }, [selectedShop, buyProperty]);

  const handleShopSellProperty = useCallback(async () => {
    if (!selectedShop) return;
    await sellProperty(selectedShop._id);
    setShopDialogOpen(false);
    setSelectedShop(null);
  }, [selectedShop, sellProperty]);

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

      <PropertyDialog
        property={selectedProperty}
        playerCash={playerCash}
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        onBuy={handleBuyConfirm}
        onSell={handleSellConfirm}
      />

      <ShopDialog
        property={selectedShop}
        playerCash={playerCash}
        open={shopDialogOpen}
        onOpenChange={setShopDialogOpen}
        onBuyProperty={handleShopBuyProperty}
        onSellProperty={handleShopSellProperty}
      />

      <Application background={bgColor} resizeTo={containerRef}>
        <pixiContainer x={camX} y={camY}>
          <WorldGrid tintR={tintR} tintG={tintG} tintB={tintB} />

          {properties.map((p) => (
            <PropertyNode
              key={p._id}
              property={p}
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
