// components/game/viewport/world/player/PlayerCharacter.tsx
"use client";

import { memo, useRef, useEffect, useState, useMemo } from "react";
import { Direction, AnimState } from "./types";
import { getWalkCycleOffsets, buildAppearance } from "./utils";
import {
  PlayerHead,
  PlayerTorso,
  PlayerArms,
  PlayerLegs,
  PlayerShadow,
  PlayerBadge,
} from "./parts";
import { PlayerHat } from "./parts/PlayerHat";

interface PlayerCharacterProps {
  x: number;
  y: number;
  name: string;
  color: number;
  isMe: boolean;
  sunlightIntensity?: number;
  equippedClothing?: {
    hat?: string;
    shirt?: string;
    pants?: string;
    shoes?: string;
  };
}

function PlayerCharacterInner({
  x,
  y,
  name,
  color,
  isMe,
  sunlightIntensity = 1,
  equippedClothing,
}: PlayerCharacterProps) {
  const prevPosRef = useRef({ x, y });
  const [animState, setAnimState] = useState<AnimState>({
    direction: "down",
    isMoving: false,
    frame: 0,
  });

  const movementRef = useRef({
    isMoving: false,
    direction: "down" as Direction,
    lastMoveTime: 0,
  });
  const frameRef = useRef(0);
  const animRef = useRef<number | null>(null);

  // Detect movement
  useEffect(() => {
    const dx = x - prevPosRef.current.x;
    const dy = y - prevPosRef.current.y;
    const dist = Math.abs(dx) + Math.abs(dy);

    if (dist > 0.5) {
      movementRef.current.isMoving = true;
      movementRef.current.lastMoveTime = performance.now();

      if (Math.abs(dx) > Math.abs(dy)) {
        movementRef.current.direction = dx > 0 ? "right" : "left";
      } else {
        movementRef.current.direction = dy > 0 ? "down" : "up";
      }
    }
    prevPosRef.current = { x, y };
  }, [x, y]);

  // Animation loop
  useEffect(() => {
    let lastFrameTime = 0;
    const FRAME_DURATION = 150;
    const STOP_DELAY = 100;

    const tick = (time: number) => {
      const timeSinceMove = time - movementRef.current.lastMoveTime;
      const wasMoving = movementRef.current.isMoving;

      if (wasMoving && timeSinceMove > STOP_DELAY) {
        movementRef.current.isMoving = false;
        frameRef.current = 0;
        setAnimState({
          direction: movementRef.current.direction,
          isMoving: false,
          frame: 0,
        });
      } else if (wasMoving && time - lastFrameTime > FRAME_DURATION) {
        frameRef.current = (frameRef.current + 1) % 4;
        lastFrameTime = time;
        setAnimState({
          direction: movementRef.current.direction,
          isMoving: true,
          frame: frameRef.current,
        });
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const { direction, isMoving, frame } = animState;
  const offsets = useMemo(
    () => getWalkCycleOffsets(isMoving, frame),
    [isMoving, frame],
  );
  const appearance = useMemo(
    () => buildAppearance(color, equippedClothing),
    [color, equippedClothing],
  );
  const isNight = sunlightIntensity < 0.3;

  // Layout constants
  const cx = 0;
  const topY = -21 + offsets.bodyBob;

  return (
    <pixiContainer x={x} y={y} interactiveChildren={false}>
      {/* Ground shadow */}
      <PlayerShadow topY={topY} isNight={isNight} />

      {/* Badge & indicator (renders behind body) */}
      <PlayerBadge name={name} color={color} isMe={isMe} topY={topY} />

      {/* Body parts — layered bottom to top */}
      <PlayerLegs
        cx={cx}
        topY={topY}
        direction={direction}
        appearance={appearance}
        offsets={offsets}
      />
      <PlayerTorso
        cx={cx}
        topY={topY}
        direction={direction}
        appearance={appearance}
      />
      <PlayerArms
        cx={cx}
        topY={topY}
        direction={direction}
        appearance={appearance}
        offsets={offsets}
      />
      <PlayerHead
        cx={cx}
        topY={topY}
        direction={direction}
        appearance={appearance}
      />
      {appearance.hatColor !== undefined && (
        <PlayerHat
          cx={cx}
          topY={topY}
          direction={direction}
          appearance={appearance}
        />
      )}

      {/* Name text */}
      <pixiText
        text={name}
        x={0}
        y={-34}
        anchor={0.5}
        resolution={2}
        style={{
          fill: "#ffffff",
          fontSize: 10,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          letterSpacing: 0.3,
        }}
      />
    </pixiContainer>
  );
}

export const PlayerCharacter = memo(PlayerCharacterInner);
