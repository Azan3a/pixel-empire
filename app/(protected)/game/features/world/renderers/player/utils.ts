"use client";

import { Graphics } from "pixi.js";
import { PX, WalkCycleOffsets, PlayerAppearance } from "./types";
import {
  CLOTHING_ITEMS,
  ClothingType,
} from "@game/shared/contracts/game-config";

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

export function getAvatarColor(avatar?: string): number {
  switch (avatar) {
    case "avatar1":
      return 0x3b82f6;
    case "avatar2":
      return 0xef4444;
    case "avatar3":
      return 0xf59e0b;
    case "avatar4":
      return 0xa855f7;
    default:
      return 0x71717a;
  }
}

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
    default:
      return {
        leftArmY: 0,
        rightArmY: 0,
        leftLegY: 0,
        rightLegY: 0,
        bodyBob: 0,
      };
  }
}

export function buildAppearance(
  color: number,
  equippedClothing?: {
    hat?: string;
    shirt?: string;
    pants?: string;
    shoes?: string;
  },
): PlayerAppearance {
  const appearance: PlayerAppearance = {
    skinColor: 0xffcc99,
    skinShadow: 0xddaa77,
    hairColor: 0x3a2a1a,
    shirtColor: color,
    pantsColor: darken(color, 0.4),
    shoeColor: 0x333333,
    beltColor: 0x555555,
  };

  if (equippedClothing) {
    if (equippedClothing.shirt) {
      const item = CLOTHING_ITEMS[equippedClothing.shirt as ClothingType];
      if (item) appearance.shirtColor = item.color;
    }
    if (equippedClothing.pants) {
      const item = CLOTHING_ITEMS[equippedClothing.pants as ClothingType];
      if (item) appearance.pantsColor = item.color;
    }
    if (equippedClothing.shoes) {
      const item = CLOTHING_ITEMS[equippedClothing.shoes as ClothingType];
      if (item) appearance.shoeColor = item.color;
    }
    if (equippedClothing.hat) {
      const item = CLOTHING_ITEMS[equippedClothing.hat as ClothingType];
      if (item) appearance.hatColor = item.color;
    }
  }

  return appearance;
}
