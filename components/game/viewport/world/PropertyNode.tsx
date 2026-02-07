// /components/game/viewport/world/PropertyNode.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { Property } from "@/types/property";
import { Id } from "@/convex/_generated/dataModel";

interface PropertyNodeProps {
  property: Property;
  isOwner: boolean;
  onInteract: (id: Id<"properties">) => void;
}

export function PropertyNode({
  property,
  isOwner,
  onInteract,
}: PropertyNodeProps) {
  const drawProperty = useCallback(
    (g: Graphics) => {
      g.clear();
      const isCommercial = property.type === "commercial";
      // Commercial = Light Blue, Residential = Orange
      const color = isCommercial ? 0x60a5fa : 0xf97316;

      // Draw Rectangle based on width/height
      g.rect(0, 0, property.width, property.height);
      g.fill({ color, alpha: isOwner ? 0.9 : 0.6 });

      // Border
      g.setStrokeStyle({ color: 0xffffff, width: 2, alpha: 0.8 });
      g.rect(0, 0, property.width, property.height);
      g.stroke();
    },
    [property, isOwner],
  );

  return (
    <pixiContainer
      x={property.x}
      y={property.y}
      eventMode="static"
      cursor="pointer"
      onPointerTap={() => onInteract(property._id)}
    >
      <pixiGraphics draw={drawProperty} />

      {/* Property Name */}
      <pixiText
        text={property.name}
        x={property.width / 2}
        y={property.height / 2}
        anchor={0.5}
        style={{
          fill: "white",
          fontSize: 14,
          fontWeight: "bold",
          stroke: { color: "#000000", width: 4, join: "round" },
        }}
      />

      {/* For Sale Indicator */}
      {!property.ownerId && (
        <pixiText
          text="FOR SALE"
          x={property.width / 2}
          y={property.height / 2 + 20}
          anchor={0.5}
          style={{
            fill: "#ef4444", // Red
            fontSize: 12,
            fontWeight: "bold",
            stroke: { color: "#ffffff", width: 3, join: "round" },
          }}
        />
      )}
    </pixiContainer>
  );
}
