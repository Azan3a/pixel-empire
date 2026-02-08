// components/game/viewport/world/drawing/drawMapBorder.ts

import { Graphics } from "pixi.js";
import { MAP_SIZE } from "@/convex/gameConstants";

/**
 * Draw a subtle white border around the entire map.
 */
export function drawMapBorder(g: Graphics): void {
  g.setStrokeStyle({ color: 0xffffff, width: 4, alpha: 0.15 });
  g.rect(0, 0, MAP_SIZE, MAP_SIZE);
  g.stroke();
}
