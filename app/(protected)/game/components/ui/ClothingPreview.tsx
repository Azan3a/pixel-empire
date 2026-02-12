// components/game/ui/ClothingPreview.tsx
"use client";

import { ClothingSlot } from "@/convex/clothingConfig";
import { darken, lighten } from "@game/components/viewport/world/player/utils";

interface ClothingPreviewProps {
  slot: ClothingSlot;
  color: number;
  className?: string;
  size?: number;
}

export function ClothingPreview({
  slot,
  color,
  className = "",
  size = 48,
}: ClothingPreviewProps) {
  const shadow = darken(color, 0.25);
  const highlight = lighten(color, 0.15);

  const pixels: { x: number; y: number; c: number }[] = [];

  const addPixel = (x: number, y: number, c: number) => {
    pixels.push({ x, y, c });
  };

  // Grid is roughly 8x12 based on the PlayerCharacter logic
  // We'll normalize each slot to fit nicely in a preview box.

  if (slot === "hat") {
    // Hat logic (simplified front view)
    // Row -1 and 0 in PlayerHat
    addPixel(1, 2, shadow);
    addPixel(2, 2, color);
    addPixel(3, 2, color);
    addPixel(4, 2, color);
    addPixel(5, 2, color);
    addPixel(6, 2, shadow);
    addPixel(1, 3, shadow);
    addPixel(2, 3, shadow);
    addPixel(3, 3, shadow);
    addPixel(4, 3, shadow);
    addPixel(5, 3, shadow);
    addPixel(6, 3, shadow);
  } else if (slot === "shirt") {
    // Torso logic (Rows 4-6)
    addPixel(2, 2, color);
    addPixel(3, 2, color);
    addPixel(4, 2, color);
    addPixel(5, 2, color);
    addPixel(2, 3, color);
    addPixel(3, 3, highlight);
    addPixel(4, 3, highlight);
    addPixel(5, 3, shadow);
    addPixel(2, 4, shadow);
    addPixel(3, 4, color);
    addPixel(4, 4, color);
    addPixel(5, 4, shadow);
  } else if (slot === "pants") {
    // Pants logic (Rows 8-10 from PlayerLegs)
    // Left Leg
    addPixel(2, 2, color);
    addPixel(3, 2, color);
    addPixel(2, 3, color);
    addPixel(3, 3, shadow);
    addPixel(2, 4, shadow);
    addPixel(3, 4, shadow);
    // Right Leg
    addPixel(4, 2, color);
    addPixel(5, 2, color);
    addPixel(4, 3, shadow);
    addPixel(5, 3, color);
    addPixel(4, 4, shadow);
    addPixel(5, 4, shadow);
  } else if (slot === "shoes") {
    // Shoe logic (Row 11 from PlayerLegs)
    addPixel(2, 3, color);
    addPixel(3, 3, color);
    addPixel(4, 3, color);
    addPixel(5, 3, color);
  }

  // Find bounds to center and scale
  const minX = Math.min(...pixels.map((p) => p.x));
  const maxX = Math.max(...pixels.map((p) => p.x));
  const minY = Math.min(...pixels.map((p) => p.y));
  const maxY = Math.max(...pixels.map((p) => p.y));

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  // Viewbox padding
  //   const padding = 1;
  const vbWidth = 8;
  const vbHeight = 8;

  // Center the pixels in the viewbox
  const offsetX = (vbWidth - width) / 2 - minX;
  const offsetY = (vbHeight - height) / 2 - minY;

  return (
    <svg
      viewBox={`0 0 ${vbWidth} ${vbHeight}`}
      className={className}
      style={{ width: size, height: size, imageRendering: "pixelated" }}
    >
      {pixels.map((p, i) => (
        <rect
          key={i}
          x={p.x + offsetX}
          y={p.y + offsetY}
          width={1}
          height={1}
          fill={`#${p.c.toString(16).padStart(6, "0")}`}
        />
      ))}
    </svg>
  );
}
