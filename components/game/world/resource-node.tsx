"use client";

import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { WorldNode } from "@/types/world_node";
import { Id } from "@/convex/_generated/dataModel";

interface ResourceNodeProps {
  resource: WorldNode;
  onCollect: (nodeId: Id<"world_nodes">) => void;
}

export function ResourceNode({ resource, onCollect }: ResourceNodeProps) {
  const drawResource = useCallback(
    (g: Graphics) => {
      const { type, health } = resource;
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
    [resource],
  );

  return (
    <pixiContainer
      x={resource.x}
      y={resource.y}
      eventMode="static"
      onClick={() => onCollect(resource._id)}
    >
      <pixiGraphics draw={drawResource} />
    </pixiContainer>
  );
}
