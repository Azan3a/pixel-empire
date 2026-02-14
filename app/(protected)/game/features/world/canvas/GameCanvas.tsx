"use client";

import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Player } from "@game/types/player";
import { usePlayer } from "@game/features/player/hooks/use-player";
import { useWorld } from "@game/features/world/hooks/use-world";
import { useJobs } from "@game/features/jobs/hooks/use-jobs";
import { useMovement } from "@game/features/player/hooks/use-movement";
import { useGameTime } from "@game/features/world/hooks/use-game-time";
import { useTrees } from "@game/features/world/hooks/use-trees";
import { getSpawnPoint, MAX_HUNGER } from "@game/shared/contracts/game-config";
import Loading from "@game/features/ui-shell/components/Loading";

import { useViewport } from "@game/features/world/canvas/use-viewport";
import { useInteractionOverlay } from "@game/features/world/interactions/use-interaction-overlay";
import { WorldLayer } from "@game/features/world/canvas/WorldLayer";
import { WorldOverlay } from "@game/features/world/canvas/WorldOverlay";

import { FloatingMinimap } from "@game/features/world/components/FloatingMinimap";
import { DeliveryHUD } from "@game/features/jobs/components/DeliveryHUD";
import { PropertyDialog } from "@game/features/world/components/PropertyDialog";
import { ShopDialog } from "@game/features/shops/ui/ShopDialog";
import { RangerStationDialog } from "@game/features/jobs/components/RangerStationDialog";
import { FloatingChatLog } from "@game/features/ui-shell/components/FloatingChatLog";

extend({ Container, Graphics, Sprite, Text });

export function GameCanvas() {
  const [me, setMe] = useState<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { alivePlayers, initPlayer, updatePosition, playerInfo } = usePlayer();
  const { properties, initCity, buyProperty, sellProperty } = useWorld();
  const { activeJob } = useJobs();
  const gameTime = useGameTime();

  const spawn = getSpawnPoint();

  // Ref to track current position without re-creating click callbacks every frame
  const renderPosRef = useRef(spawn);

  const hunger = playerInfo?.hunger ?? MAX_HUNGER;
  const playerCash = playerInfo?.cash ?? 0;
  const axeQty =
    playerInfo?.inventory
      ?.filter((i) => i.item === "axe")
      .reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const woodQty =
    playerInfo?.inventory
      ?.filter((i) => i.item === "wood")
      .reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const hasAxe = axeQty >= 1;

  const {
    trees,
    initForestTrees,
    startChopping,
    cancelChopping,
    choppingTreeId,
    chopProgress,
    buyAxe,
    sellWood,
  } = useTrees({ playerPosRef: renderPosRef, hasAxe });

  const onSync = useCallback(
    (pos: { x: number; y: number }) => updatePosition(pos),
    [updatePosition],
  );

  const { renderPos, resetPosition } = useMovement({
    initialPos: spawn,
    properties,
    trees,
    onSync,
    hunger,
  });

  const { width, height, bgColor, bgHex } = useViewport(
    containerRef,
    gameTime.ambient,
  );

  const {
    selectedProperty,
    setSelectedProperty,
    purchaseDialogOpen,
    setPurchaseDialogOpen,
    selectedShop,
    setSelectedShop,
    shopDialogOpen,
    setShopDialogOpen,
    setSelectedRangerStation,
    rangerDialogOpen,
    setRangerDialogOpen,
    handlePropertyClick,
  } = useInteractionOverlay(renderPos, properties);

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

  useEffect(() => {
    if (properties.length > 0 && trees.length === 0) {
      void initForestTrees();
    }
  }, [properties.length, trees.length, initForestTrees]);

  const choppingTree = useMemo(
    () => (choppingTreeId ? trees.find((t) => t._id === choppingTreeId) : null),
    [choppingTreeId, trees],
  );

  const handleBuyConfirm = useCallback(async () => {
    if (!selectedProperty) return;
    await buyProperty(selectedProperty._id);
    setPurchaseDialogOpen(false);
    setSelectedProperty(null);
  }, [
    selectedProperty,
    buyProperty,
    setPurchaseDialogOpen,
    setSelectedProperty,
  ]);

  const handleSellConfirm = useCallback(async () => {
    if (!selectedProperty) return;
    await sellProperty(selectedProperty._id);
    setPurchaseDialogOpen(false);
    setSelectedProperty(null);
  }, [
    selectedProperty,
    sellProperty,
    setPurchaseDialogOpen,
    setSelectedProperty,
  ]);

  const handleShopBuyProperty = useCallback(async () => {
    if (!selectedShop) return;
    await buyProperty(selectedShop._id);
    setShopDialogOpen(false);
    setSelectedShop(null);
  }, [selectedShop, buyProperty, setShopDialogOpen, setSelectedShop]);

  const handleShopSellProperty = useCallback(async () => {
    if (!selectedShop) return;
    await sellProperty(selectedShop._id);
    setShopDialogOpen(false);
    setSelectedShop(null);
  }, [selectedShop, sellProperty, setShopDialogOpen, setSelectedShop]);

  if (!me) return <Loading />;

  const otherPlayers = alivePlayers
    .filter((p) => String(p._id) !== String(me._id))
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
          viewportWidth={width}
          viewportHeight={height}
        />
        <DeliveryHUD playerX={renderPos.x} playerY={renderPos.y} />
      </div>

      <FloatingChatLog />

      <PropertyDialog
        property={selectedProperty}
        playerCash={playerCash}
        open={purchaseDialogOpen}
        onOpenChange={(open) => {
          setPurchaseDialogOpen(open);
          if (!open) setSelectedProperty(null);
        }}
        onBuy={handleBuyConfirm}
        onSell={handleSellConfirm}
      />

      <ShopDialog
        property={selectedShop}
        playerCash={playerCash}
        open={shopDialogOpen}
        onOpenChange={(open) => {
          setShopDialogOpen(open);
          if (!open) setSelectedShop(null);
        }}
        onBuyProperty={handleShopBuyProperty}
        onSellProperty={handleShopSellProperty}
      />

      <RangerStationDialog
        open={rangerDialogOpen}
        onOpenChange={(open) => {
          setRangerDialogOpen(open);
          if (!open) setSelectedRangerStation(null);
        }}
        playerCash={playerCash}
        axeQty={axeQty}
        woodQty={woodQty}
        onBuyAxe={buyAxe}
        onSellWood={sellWood}
      />

      <WorldOverlay
        width={width}
        height={height}
        renderPos={renderPos}
        properties={properties}
      />

      <Application background={bgColor} resizeTo={containerRef}>
        <WorldLayer
          width={width}
          height={height}
          renderPos={renderPos}
          properties={properties}
          trees={trees}
          alivePlayers={alivePlayers}
          activeJob={activeJob ?? null}
          gameTime={gameTime.gameHour}
          choppingTree={choppingTree ?? null}
          chopProgress={chopProgress}
          onPropertyClick={handlePropertyClick}
          localPlayer={me}
          ambient={gameTime.ambient}
          onStartChopping={(id) => {
            if (choppingTreeId && choppingTreeId !== id) {
              cancelChopping();
            }
            startChopping(id);
          }}
        />
      </Application>
    </div>
  );
}
