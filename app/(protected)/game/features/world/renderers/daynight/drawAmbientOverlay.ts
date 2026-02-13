import { Graphics } from "pixi.js";
import { MAP_SIZE } from "@game/shared/contracts/game-config";

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
