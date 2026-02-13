// app/(protected)/game/features/world/canvas/WorldLayer.tsx
"use client";

import { useMemo } from "react";
import { WorldGrid } from "@game/features/world/renderers/nodes/WorldGrid";
import { PropertyNode } from "@game/features/world/renderers/nodes/PropertyNode";
import { TreeNode } from "@game/features/world/renderers/nodes/TreeNode";
import { OtherPlayers } from "@game/features/world/renderers/nodes/OtherPlayers";
import { PlayerCharacter } from "@game/features/world/renderers/player/PlayerCharacter";
import { DeliveryMarker } from "@game/features/world/renderers/nodes/DeliveryMarker";
import { ChopProgressBar } from "@game/features/world/renderers/nodes/ChopProgressBar";
import { DayNightOverlay } from "@game/features/world/renderers/daynight/DayNightOverlay";
import { getAvatarColor } from "@game/features/world/renderers/player/utils";
import { Property } from "@game/types/property";
import { Tree } from "@game/types/tree";
import { Player } from "@game/types/player";
import { Job } from "@game/types/job";
import { Id } from "@/convex/_generated/dataModel";

interface WorldLayerProps {
  width: number;
  height: number;
  renderPos: { x: number; y: number };
  properties: Property[];
  trees: Tree[];
  alivePlayers: Player[];
  activeJob: Job | null;
  gameTime: number;
  choppingTree: Tree | null;
  chopProgress: number;
  onPropertyClick: (id: Id<"properties">) => void;
  localPlayer: Player;
  ambient: {
    tintR: number;
    tintG: number;
    tintB: number;
    overlayColor: number;
    overlayAlpha: number;
    streetLightAlpha: number;
    sunlightIntensity: number;
  };
  onStartChopping: (id: Id<"trees">) => void;
}

const CULL_PADDING = 200;

export function WorldLayer({
  width,
  height,
  renderPos,
  properties,
  trees,
  alivePlayers,
  activeJob,
  choppingTree,
  chopProgress,
  onPropertyClick,
  localPlayer,
  ambient,
  onStartChopping,
}: WorldLayerProps) {
  const cameraX = Math.round(width / 2 - renderPos.x);
  const cameraY = Math.round(height / 2 - renderPos.y);

  const cullBounds = useMemo(
    () => ({
      left: renderPos.x - width / 2 - CULL_PADDING,
      right: renderPos.x + width / 2 + CULL_PADDING,
      top: renderPos.y - height / 2 - CULL_PADDING,
      bottom: renderPos.y + height / 2 + CULL_PADDING,
    }),
    [renderPos.x, renderPos.y, width, height],
  );

  const visibleProperties = useMemo(() => {
    return properties.filter(
      (p) =>
        p.x + p.width > cullBounds.left &&
        p.x < cullBounds.right &&
        p.y + p.height > cullBounds.top &&
        p.y < cullBounds.bottom,
    );
  }, [properties, cullBounds]);

  const visibleTrees = useMemo(() => {
    return trees.filter(
      (t) =>
        t.x > cullBounds.left &&
        t.x < cullBounds.right &&
        t.y > cullBounds.top &&
        t.y < cullBounds.bottom,
    );
  }, [trees, cullBounds]);

  return (
    <pixiContainer x={cameraX} y={cameraY} interactiveChildren={true}>
      <WorldGrid
        tintR={ambient.tintR}
        tintG={ambient.tintG}
        tintB={ambient.tintB}
      />

      {visibleTrees.map((tree) => (
        <TreeNode
          key={tree._id}
          tree={tree}
          onInteract={() => onStartChopping(tree._id)}
        />
      ))}

      {choppingTree && (
        <ChopProgressBar
          x={choppingTree.x}
          y={choppingTree.y}
          progress={chopProgress}
        />
      )}

      {visibleProperties.map((prop) => (
        <PropertyNode
          key={prop._id}
          property={prop}
          onInteract={() => onPropertyClick(prop._id)}
          sunlightIntensity={ambient.sunlightIntensity}
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
          (p) => String(p._id) !== String(localPlayer._id),
        )}
        sunlightIntensity={ambient.sunlightIntensity}
      />

      <PlayerCharacter
        x={renderPos.x}
        y={renderPos.y}
        name={localPlayer.name}
        color={getAvatarColor(localPlayer.avatar)}
        isMe={true}
        sunlightIntensity={ambient.sunlightIntensity}
        equippedClothing={localPlayer.equippedClothing}
      />

      <DayNightOverlay
        overlayColor={ambient.overlayColor}
        overlayAlpha={ambient.overlayAlpha}
        streetLightAlpha={ambient.streetLightAlpha}
      />
    </pixiContainer>
  );
}
