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
  cx: number;
  topY: number;
  direction: Direction;
  isMoving: boolean;
  appearance: PlayerAppearance;
  offsets: WalkCycleOffsets;
}
