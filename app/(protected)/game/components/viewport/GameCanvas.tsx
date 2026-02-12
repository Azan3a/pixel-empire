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
import { useTrees } from "@game/hooks/use-trees";
import { getSpawnPoint, SHOP_INTERACT_RADIUS } from "@/convex/gameConstants";
import { MAX_HUNGER } from "@/convex/foodConfig";
import { Property } from "@game/types/property";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { WorldGrid } from "./world/WorldGrid";
import { PropertyNode } from "./world/PropertyNode";
import { TreeNode } from "./world/TreeNode";
import { ChopProgressBar } from "./world/ChopProgressBar";
import { PlayerCharacter } from "./world/player/PlayerCharacter";
import { DeliveryMarker } from "./world/DeliveryMarker";
import { DayNightOverlay } from "./world/daynight/DayNightOverlay";
import { OtherPlayers } from "./world/OtherPlayers";
import { getAvatarColor } from "./world/player/utils";

import { FloatingMinimap } from "../ui/FloatingMinimap";
import { DeliveryHUD } from "../ui/DeliveryHUD";
import { PropertyDialog } from "../ui/PropertyDialog";
import { ShopDialog } from "../ui/ShopDialog";
import { RangerStationDialog } from "../ui/RangerStationDialog";
import Loading from "../ui/Loading";

extend({ Container, Graphics, Sprite, Text });

/** Padding (px) around viewport for culling — keeps objects visible just before entering view */
const CULL_PADDING = 200;

export function GameCanvas() {
  const [me, setMe] = useState<Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const [selectedShop, setSelectedShop] = useState<Property | null>(null);
  const [shopDialogOpen, setShopDialogOpen] = useState(false);

  const [selectedRangerStation, setSelectedRangerStation] =
    useState<Property | null>(null);
  const [rangerDialogOpen, setRangerDialogOpen] = useState(false);

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

  // Auto-close dialogs if player walks too far away
  useEffect(() => {
    const isTooFar = (prop: Property) => {
      const centerX = prop.x + prop.width / 2;
      const centerY = prop.y + prop.height / 2;
      const distance = Math.sqrt(
        (centerX - renderPos.x) ** 2 + (centerY - renderPos.y) ** 2,
      );
      return distance > SHOP_INTERACT_RADIUS + 20; // 20px buffer to prevent flickering
    };

    if (shopDialogOpen && selectedShop && isTooFar(selectedShop)) {
      setTimeout(() => {
        setShopDialogOpen(false);
        setSelectedShop(null);
      }, 0);
    }

    if (purchaseDialogOpen && selectedProperty && isTooFar(selectedProperty)) {
      setTimeout(() => {
        setPurchaseDialogOpen(false);
        setSelectedProperty(null);
      }, 0);
    }

    if (
      rangerDialogOpen &&
      selectedRangerStation &&
      isTooFar(selectedRangerStation)
    ) {
      setTimeout(() => {
        setRangerDialogOpen(false);
        setSelectedRangerStation(null);
      }, 0);
    }
  }, [
    renderPos,
    shopDialogOpen,
    selectedShop,
    purchaseDialogOpen,
    selectedProperty,
    rangerDialogOpen,
    selectedRangerStation,
  ]);

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
    // Backfill for existing worlds: if city exists but trees haven't been initialized yet.
    if (properties.length > 0 && trees.length === 0) {
      void initForestTrees();
    }
  }, [properties.length, trees.length, initForestTrees]);

  const choppingTree = useMemo(
    () => (choppingTreeId ? trees.find((t) => t._id === choppingTreeId) : null),
    [choppingTreeId, trees],
  );

  const handlePropertyClick = useCallback(
    (propertyId: Id<"properties">) => {
      const prop = properties.find((p) => p._id === propertyId);
      if (!prop) return;

      // Compute distance from player to building center
      const centerX = prop.x + prop.width / 2;
      const centerY = prop.y + prop.height / 2;
      const pos = renderPosRef.current;
      const distance = Math.sqrt(
        (centerX - pos.x) ** 2 + (centerY - pos.y) ** 2,
      );

      if (distance > SHOP_INTERACT_RADIUS) {
        toast("Walk closer to interact", {
          description: `You need to be near ${prop.name} to interact.`,
        });
        return;
      }

      // Ranger Station (service building) acts like a shop for lumberjacking.
      if (prop.subType === "ranger_station") {
        setSelectedRangerStation(prop);
        setRangerDialogOpen(true);
        return;
      }

      if (prop.category === "shop") {
        setSelectedShop(prop);
        setShopDialogOpen(true);
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

  const vw = typeof window !== "undefined" ? window.innerWidth : 800;
  const vh = typeof window !== "undefined" ? window.innerHeight : 600;

  // ── Viewport culling bounds (world-space) ──
  const cullLeft = renderPos.x - vw / 2 - CULL_PADDING;
  const cullRight = renderPos.x + vw / 2 + CULL_PADDING;
  const cullTop = renderPos.y - vh / 2 - CULL_PADDING;
  const cullBottom = renderPos.y + vh / 2 + CULL_PADDING;

  const visibleProperties = useMemo(
    () =>
      properties.filter(
        (p) =>
          p.x + p.width > cullLeft &&
          p.x < cullRight &&
          p.y + p.height > cullTop &&
          p.y < cullBottom,
      ),
    [properties, cullLeft, cullRight, cullTop, cullBottom],
  );

  const visibleTrees = useMemo(
    () =>
      trees.filter(
        (t) =>
          t.x > cullLeft &&
          t.x < cullRight &&
          t.y > cullTop &&
          t.y < cullBottom,
      ),
    [trees, cullLeft, cullRight, cullTop, cullBottom],
  );

  if (!me) return <Loading />;

  const camX = vw / 2 - renderPos.x;
  const camY = vh / 2 - renderPos.y;

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
          viewportWidth={vw}
          viewportHeight={vh}
        />
        <DeliveryHUD playerX={renderPos.x} playerY={renderPos.y} />
      </div>

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

      <Application background={bgColor} resizeTo={containerRef}>
        <pixiContainer x={camX} y={camY} interactiveChildren={true}>
          <WorldGrid tintR={tintR} tintG={tintG} tintB={tintB} />

          {visibleTrees.map((t) => (
            <TreeNode
              key={t._id}
              tree={t}
              onInteract={() => {
                // Clicking elsewhere cancels.
                if (choppingTreeId && choppingTreeId !== t._id) {
                  cancelChopping();
                }
                startChopping(t._id);
              }}
            />
          ))}

          {choppingTree && (
            <ChopProgressBar
              x={choppingTree.x}
              y={choppingTree.y}
              progress={chopProgress}
            />
          )}

          {visibleProperties.map((p) => (
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

          <OtherPlayers
            players={alivePlayers.filter(
              (p) => String(p._id) !== String(me._id),
            )}
            sunlightIntensity={sunlightIntensity}
          />

          <PlayerCharacter
            x={renderPos.x}
            y={renderPos.y}
            name={me.name}
            color={getAvatarColor(me.avatar)}
            isMe={true}
            sunlightIntensity={sunlightIntensity}
            equippedClothing={playerInfo?.equippedClothing}
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
