"use client";

import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { Building } from "@/types/building";
import { Id } from "@/convex/_generated/dataModel";

interface BuildingNodeProps {
  building: Building;
  isOwner: boolean;
  onCollectProduction: (buildingId: Id<"buildings">) => void;
}

export function BuildingNode({
  building,
  isOwner,
  onCollectProduction,
}: BuildingNodeProps) {
  const drawBuilding = useCallback(
    (g: Graphics) => {
      const { type } = building;
      g.clear();
      let color = 0x3b82f6; // Default blue
      if (type === "lumber_mill") color = 0x78350f;
      if (type === "stone_mason") color = 0x475569;
      if (type === "smelter") color = 0xd97706;

      // Base
      g.setFillStyle({ color, alpha: 0.9 });
      g.rect(-30, -30, 60, 60);
      g.fill();

      // Roof or details
      g.setFillStyle({ color: 0x000000, alpha: 0.2 });
      g.moveTo(-30, -30).lineTo(0, -50).lineTo(30, -30).closePath();
      g.fill();

      // Border
      g.setStrokeStyle({ color: 0xffffff, width: 2, alpha: 0.3 });
      g.rect(-30, -30, 60, 60);
      g.stroke();
    },
    [building],
  );

  return (
    <pixiContainer
      x={building.x}
      y={building.y}
      eventMode="static"
      onClick={() => {
        if (isOwner) {
          onCollectProduction(building._id);
        }
      }}
    >
      <pixiGraphics draw={drawBuilding} />
      <pixiText
        text={`${building.ownerName}'s ${building.type
          .split("_")
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(" ")}`}
        x={0}
        y={45}
        anchor={0.5}
        style={{
          fill: "#4b5563",
          fontSize: 10,
          fontWeight: "bold",
          dropShadow: {
            blur: 2,
            color: "#ffffff",
            distance: 0,
          },
        }}
      />
    </pixiContainer>
  );
}
