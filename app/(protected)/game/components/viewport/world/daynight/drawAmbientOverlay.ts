// components/game/viewport/world/daynight/drawAmbientOverlay.ts
import { Graphics } from "pixi.js";
import { MAP_SIZE } from "@/convex/map/constants";

export function drawAmbientOverlay(
  g: Graphics,
  overlayColor: number,
  overlayAlpha: number,
) {
  if (overlayAlpha > 0.005) {
    g.rect(0, 0, MAP_SIZE, MAP_SIZE);
    g.fill({ color: overlayColor, alpha: overlayAlpha });
  }
}
