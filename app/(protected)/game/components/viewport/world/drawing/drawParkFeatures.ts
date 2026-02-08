// components/game/viewport/world/drawing/drawParkFeatures.ts

import { Graphics } from "pixi.js";
import { ZONES } from "@/convex/mapZones";
import type { TintFn } from "../utils/tintFactory";

/**
 * Draw park paths (cross + diagonal) and a decorative pond.
 */
export function drawParkFeatures(g: Graphics, t: TintFn): void {
  const parkBounds = ZONES.park.bounds;
  const parkCX = (parkBounds.x1 + parkBounds.x2) / 2;
  const parkCY = (parkBounds.y1 + parkBounds.y2) / 2;

  // ── Paths ──
  g.setStrokeStyle({ color: t(0xc4a473), width: 8, alpha: 0.5 });

  // Horizontal path
  g.moveTo(parkBounds.x1 + 40, parkCY).lineTo(parkBounds.x2 - 40, parkCY);
  g.stroke();

  // Vertical path
  g.moveTo(parkCX, parkBounds.y1 + 40).lineTo(parkCX, parkBounds.y2 - 40);
  g.stroke();

  // Diagonal paths
  g.moveTo(parkBounds.x1 + 80, parkBounds.y1 + 80).lineTo(
    parkBounds.x2 - 80,
    parkBounds.y2 - 80,
  );
  g.moveTo(parkBounds.x2 - 80, parkBounds.y1 + 80).lineTo(
    parkBounds.x1 + 80,
    parkBounds.y2 - 80,
  );
  g.stroke();

  // ── Pond ──
  const pondX = parkCX + 120;
  const pondY = parkCY - 100;

  g.ellipse(pondX, pondY, 80, 50);
  g.fill({ color: t(0x3a8aaa), alpha: 0.6 });

  g.setStrokeStyle({ color: t(0x2a7a9a), width: 2, alpha: 0.4 });
  g.ellipse(pondX, pondY, 80, 50);
  g.stroke();

  // Pond highlight
  g.ellipse(pondX - 20, pondY - 12, 30, 18);
  g.fill({ color: 0xffffff, alpha: 0.08 });
}
