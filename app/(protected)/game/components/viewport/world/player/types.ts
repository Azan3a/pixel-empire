// components/game/viewport/world/player/types.ts
"use client";

export const PX = 3;

export type Direction = "down" | "up" | "left" | "right";

export interface AnimState {
  direction: Direction;
  isMoving: boolean;
  frame: number;
}

export interface WalkCycleOffsets {
  leftArmY: number;
  rightArmY: number;
  leftLegY: number;
  rightLegY: number;
  bodyBob: number;
}

/**
 * Customizable appearance options for a player character.
 * Extend this interface to add new customization categories.
 */
export interface PlayerAppearance {
  skinColor: number;
  skinShadow: number;
  hairColor: number;
  shirtColor: number;
  pantsColor: number;
  shoeColor: number;
  beltColor: number;
  hatColor?: number;
}

export interface DrawContext {
  /** Center x for the character grid */
  cx: number;
  /** Top y of the character (includes body bob) */
  topY: number;
  direction: Direction;
  isMoving: boolean;
  appearance: PlayerAppearance;
  offsets: WalkCycleOffsets;
}
