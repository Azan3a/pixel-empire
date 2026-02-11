// components/game/viewport/world/property/PropertyLabel.tsx
"use client";

import { memo } from "react";
import type { PropertyCategory } from "@/convex/map/zones";

interface PropertyLabelProps {
  name: string;
  category: PropertyCategory;
  isOwned: boolean;
  ownerCount: number;
  maxOwners: number;
  price: number;
  containerWidth: number;
  containerHeight: number;
}

function PropertyLabelInner({
  name,
  category,
  isOwned,
  ownerCount,
  maxOwners,
  price,
  containerWidth,
  containerHeight,
}: PropertyLabelProps) {
  const isService = category === "service";

  let statusText: string;
  let statusColor: string;

  if (isService) {
    statusText = "PUBLIC";
    statusColor = "#d4a017";
  } else if (isOwned) {
    statusText = `YOURS${ownerCount > 1 ? ` (+${ownerCount - 1})` : ""}`;
    statusColor = "#34d399";
  } else if (ownerCount >= maxOwners) {
    statusText = "FULL";
    statusColor = "#999999";
  } else if (ownerCount > 0) {
    statusText = `$${price.toLocaleString()} · ${ownerCount}/${maxOwners}`;
    statusColor = "#4ade80";
  } else {
    statusText = `$${price.toLocaleString()}`;
    statusColor = "#4ade80";
  }

  return (
    <>
      <pixiText
        text={name}
        x={containerWidth / 2}
        y={containerHeight / 2 - 8}
        anchor={0.5}
        resolution={2}
        style={{
          fill: "#ffffff",
          fontSize: 12,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          stroke: { color: "#000000", width: 3, join: "round" as const },
          letterSpacing: 0.5,
        }}
      />
      <pixiText
        text={statusText}
        x={containerWidth / 2}
        y={containerHeight / 2 + 10}
        anchor={0.5}
        resolution={2}
        style={{
          fill: statusColor,
          fontSize: 10,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          stroke: { color: "#000000", width: 3, join: "round" as const },
        }}
      />
    </>
  );
}

export const PropertyLabel = memo(PropertyLabelInner);
