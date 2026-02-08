// components/game/viewport/world/player/utils.ts
"use client";

import { Graphics } from "pixi.js";
import { PX, WalkCycleOffsets, PlayerAppearance } from "./types";

export function darken(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xff) * (1 - factor));
  const g = Math.floor(((color >> 8) & 0xff) * (1 - factor));
  const b = Math.floor((color & 0xff) * (1 - factor));
  return (r << 16) | (g << 8) | b;
}

export function lighten(color: number, factor: number): number {
  const r = Math.min(255, Math.floor(((color >> 16) & 0xff) * (1 + factor)));
  const g = Math.min(255, Math.floor(((color >> 8) & 0xff) * (1 + factor)));
  const b = Math.min(255, Math.floor((color & 0xff) * (1 + factor)));
  return (r << 16) | (g << 8) | b;
}

/**
 * Draw a single "pixel" in the character grid.
 * gx/gy are grid coordinates (0-based from top-left of character).
 */
export function drawPixel(
  g: Graphics,
  cx: number,
  topY: number,
  gx: number,
  gy: number,
  color: number,
  alpha: number = 1,
) {
  g.rect(cx + gx * PX - PX * 4, topY + gy * PX, PX, PX);
  g.fill({ color, alpha });
}

/**
 * Compute walk cycle offsets from animation frame.
 */
export function getWalkCycleOffsets(
  isMoving: boolean,
  frame: number,
): WalkCycleOffsets {
  if (!isMoving) {
    return {
      leftArmY: 0,
      rightArmY: 0,
      leftLegY: 0,
      rightLegY: 0,
      bodyBob: 0,
    };
  }

  switch (frame) {
    case 1:
      return {
        leftArmY: -PX,
        rightArmY: PX,
        leftLegY: -PX,
        rightLegY: PX,
        bodyBob: -1,
      };
    case 3:
      return {
        leftArmY: PX,
        rightArmY: -PX,
        leftLegY: PX,
        rightLegY: -PX,
        bodyBob: -1,
      };
    default: // frames 0 and 2
      return {
        leftArmY: 0,
        rightArmY: 0,
        leftLegY: 0,
        rightLegY: 0,
        bodyBob: 0,
      };
  }
}

/**
 * Build a PlayerAppearance from a base color (the player's identifying color).
 * This is the default "starter outfit". Later, this can be replaced with
 * per-player customization data from the database.
 */
export function buildDefaultAppearance(color: number): PlayerAppearance {
  return {
    skinColor: 0xffcc99,
    skinShadow: 0xddaa77,
    hairColor: 0x3a2a1a,
    shirtColor: color,
    pantsColor: darken(color, 0.4),
    shoeColor: 0x333333,
    beltColor: 0x555555,
  };
}
