// components/game/viewport/world/PlayerCharacter.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo, useRef, useEffect, useState } from "react";

interface PlayerCharacterProps {
  x: number;
  y: number;
  name: string;
  color: number;
  isMe: boolean;
  sunlightIntensity?: number;
}

function darken(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xff) * (1 - factor));
  const g = Math.floor(((color >> 8) & 0xff) * (1 - factor));
  const b = Math.floor((color & 0xff) * (1 - factor));
  return (r << 16) | (g << 8) | b;
}

function lighten(color: number, factor: number): number {
  const r = Math.min(255, Math.floor(((color >> 16) & 0xff) * (1 + factor)));
  const g = Math.min(255, Math.floor(((color >> 8) & 0xff) * (1 + factor)));
  const b = Math.min(255, Math.floor((color & 0xff) * (1 + factor)));
  return (r << 16) | (g << 8) | b;
}

// Pixel size for the character grid
const PX = 3;

type Direction = "down" | "up" | "left" | "right";

interface AnimState {
  direction: Direction;
  isMoving: boolean;
  frame: number;
}

function PlayerCharacterInner({
  x,
  y,
  name,
  color,
  isMe,
  sunlightIntensity = 1,
}: PlayerCharacterProps) {
  const prevPosRef = useRef({ x, y });
  const [animState, setAnimState] = useState<AnimState>({
    direction: "down",
    isMoving: false,
    frame: 0,
  });

  // Refs for the animation loop to read (no state updates during render)
  const movementRef = useRef({
    isMoving: false,
    direction: "down" as Direction,
    lastMoveTime: 0,
  });
  const frameRef = useRef(0);
  const animRef = useRef<number | null>(null);

  // Detect movement - using useEffect to handle side effects (ref updates and performance.now)
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

  // Animation loop - handles frame cycling AND stop detection
  useEffect(() => {
    let lastFrameTime = 0;
    const FRAME_DURATION = 150;
    const STOP_DELAY = 100; // Stop animating after 100ms of no movement

    const tick = (time: number) => {
      const timeSinceMove = time - movementRef.current.lastMoveTime;
      const wasMoving = movementRef.current.isMoving;

      // Detect stop: no position updates for STOP_DELAY ms
      if (wasMoving && timeSinceMove > STOP_DELAY) {
        movementRef.current.isMoving = false;
        frameRef.current = 0;
        setAnimState({
          direction: movementRef.current.direction,
          isMoving: false,
          frame: 0,
        });
      }
      // Animate while moving
      else if (wasMoving && time - lastFrameTime > FRAME_DURATION) {
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

  const drawPlayer = useCallback(
    (g: Graphics) => {
      const skinColor = 0xffcc99;
      const skinShadow = 0xddaa77;
      const shirtColor = color;
      const shirtShadow = darken(color, 0.25);
      const pantsColor = darken(color, 0.4);
      const pantsShadow = darken(color, 0.55);
      const shoeColor = 0x333333;
      const hairColor = 0x3a2a1a;
      const isNight = sunlightIntensity < 0.3;

      g.clear();

      // Walk cycle offsets for limbs
      // frame: 0=stand, 1=step-right, 2=stand, 3=step-left
      let leftArmY = 0;
      let rightArmY = 0;
      let leftLegY = 0;
      let rightLegY = 0;
      let bodyBob = 0;

      if (isMoving) {
        switch (frame) {
          case 0:
            leftArmY = 0;
            rightArmY = 0;
            leftLegY = 0;
            rightLegY = 0;
            bodyBob = 0;
            break;
          case 1:
            leftArmY = -PX;
            rightArmY = PX;
            leftLegY = -PX;
            rightLegY = PX;
            bodyBob = -1;
            break;
          case 2:
            leftArmY = 0;
            rightArmY = 0;
            leftLegY = 0;
            rightLegY = 0;
            bodyBob = 0;
            break;
          case 3:
            leftArmY = PX;
            rightArmY = -PX;
            leftLegY = PX;
            rightLegY = -PX;
            bodyBob = -1;
            break;
        }
      }

      // Character is drawn centered at (0,0), facing `direction`
      // Total character height ~14 pixels * PX = 42px
      // Width ~8 pixels * PX = 24px
      const cx = 0; // center x
      const topY = -21 + bodyBob; // top of head

      const drawPixel = (gx: number, gy: number, c: number, a: number = 1) => {
        g.rect(cx + gx * PX - PX * 4, topY + gy * PX, PX, PX);
        g.fill({ color: c, alpha: a });
      };

      // ── "Me" indicator ring ──
      if (isMe) {
        g.circle(0, 6, 22);
        g.fill({ color, alpha: 0.08 });
        g.setStrokeStyle({ color, width: 1.5, alpha: 0.25 });
        g.circle(0, 6, 20);
        g.stroke();
      }

      // ── Shadow on ground ──
      g.ellipse(0, topY + 15 * PX, 12, 4);
      g.fill({ color: 0x000000, alpha: isNight ? 0.3 : 0.15 });

      const isSide = direction === "left" || direction === "right";
      const isBack = direction === "up";
      const flipX = direction === "left";

      if (isSide) {
        // ═══ SIDE VIEW ═══

        // -- Hair (back layer for side view)
        drawPixel(3 + (flipX ? 1 : 0), 0, hairColor);
        drawPixel(3 + (flipX ? 1 : 0), 1, hairColor);

        // -- Head
        drawPixel(3, 0, skinColor);
        drawPixel(4, 0, skinColor);
        drawPixel(2, 1, skinColor);
        drawPixel(3, 1, skinColor);
        drawPixel(4, 1, skinColor);
        drawPixel(5, 1, skinColor);
        drawPixel(3, 2, skinColor);
        drawPixel(4, 2, skinColor);
        drawPixel(5, 2, skinShadow);

        // Hair top
        drawPixel(2, 0, hairColor);
        drawPixel(5, 0, hairColor);

        // Eye (side view — one eye visible)
        const eyeX = flipX ? 3 : 5;
        drawPixel(eyeX, 1, 0xffffff);
        drawPixel(eyeX, 1, 0x222222, 0.7);

        // -- Neck
        drawPixel(3, 3, skinShadow);
        drawPixel(4, 3, skinShadow);

        // -- Torso
        drawPixel(2, 4, shirtColor);
        drawPixel(3, 4, shirtColor);
        drawPixel(4, 4, shirtColor);
        drawPixel(5, 4, shirtShadow);
        drawPixel(2, 5, shirtColor);
        drawPixel(3, 5, shirtColor);
        drawPixel(4, 5, shirtColor);
        drawPixel(5, 5, shirtShadow);
        drawPixel(3, 6, shirtColor);
        drawPixel(4, 6, shirtShadow);

        // -- Arm (one visible in side view, swings forward/back)
        const armBaseY = 4;
        const armSwing = flipX ? -rightArmY / PX : leftArmY / PX;
        drawPixel(flipX ? 2 : 5, armBaseY + 1 + armSwing, skinColor);
        drawPixel(flipX ? 2 : 5, armBaseY + 2 + armSwing, skinColor);

        // -- Belt
        drawPixel(3, 7, 0x555555);
        drawPixel(4, 7, 0x555555);

        // -- Legs (side view — alternating step)
        const legBaseY = 8;
        // Front leg
        const frontLegOff = leftLegY / PX;
        drawPixel(3, legBaseY + frontLegOff, pantsColor);
        drawPixel(3, legBaseY + 1 + frontLegOff, pantsColor);
        drawPixel(3, legBaseY + 2 + frontLegOff, pantsShadow);
        drawPixel(3, legBaseY + 3 + frontLegOff, shoeColor);

        // Back leg
        const backLegOff = rightLegY / PX;
        drawPixel(4, legBaseY + backLegOff, pantsShadow);
        drawPixel(4, legBaseY + 1 + backLegOff, pantsShadow);
        drawPixel(4, legBaseY + 2 + backLegOff, pantsShadow);
        drawPixel(4, legBaseY + 3 + backLegOff, shoeColor);
      } else {
        // ═══ FRONT / BACK VIEW ═══

        // -- Hair
        drawPixel(2, 0, hairColor);
        drawPixel(3, 0, hairColor);
        drawPixel(4, 0, hairColor);
        drawPixel(5, 0, hairColor);

        // -- Head
        drawPixel(2, 1, skinColor);
        drawPixel(3, 1, skinColor);
        drawPixel(4, 1, skinColor);
        drawPixel(5, 1, skinColor);
        drawPixel(2, 2, skinColor);
        drawPixel(3, 2, skinColor);
        drawPixel(4, 2, skinColor);
        drawPixel(5, 2, skinColor);
        drawPixel(3, 3, skinShadow);
        drawPixel(4, 3, skinShadow);

        if (!isBack) {
          // Face details (front only)
          // Eyes
          drawPixel(2, 1, 0xffffff, 0.9);
          drawPixel(5, 1, 0xffffff, 0.9);
          // Pupils
          drawPixel(2, 1, 0x222222, 0.6);
          drawPixel(5, 1, 0x222222, 0.6);
          // Mouth
          drawPixel(3, 2, skinShadow, 0.5);
          drawPixel(4, 2, skinShadow, 0.5);
        } else {
          // Back of hair extends down
          drawPixel(2, 2, hairColor, 0.8);
          drawPixel(5, 2, hairColor, 0.8);
        }

        // -- Torso
        drawPixel(2, 4, shirtColor);
        drawPixel(3, 4, shirtColor);
        drawPixel(4, 4, shirtColor);
        drawPixel(5, 4, shirtColor);
        drawPixel(2, 5, shirtColor);
        drawPixel(3, 5, isBack ? shirtColor : lighten(shirtColor, 0.15));
        drawPixel(4, 5, isBack ? shirtColor : lighten(shirtColor, 0.15));
        drawPixel(5, 5, shirtShadow);
        drawPixel(2, 6, shirtShadow);
        drawPixel(3, 6, shirtColor);
        drawPixel(4, 6, shirtColor);
        drawPixel(5, 6, shirtShadow);

        // -- Arms (swing opposite to legs)
        const armBaseY = 4;
        // Left arm
        const laOff = leftArmY / PX;
        drawPixel(1, armBaseY + laOff, shirtColor);
        drawPixel(1, armBaseY + 1 + laOff, skinColor);
        drawPixel(1, armBaseY + 2 + laOff, skinColor);

        // Right arm
        const raOff = rightArmY / PX;
        drawPixel(6, armBaseY + raOff, shirtColor);
        drawPixel(6, armBaseY + 1 + raOff, skinColor);
        drawPixel(6, armBaseY + 2 + raOff, skinColor);

        // -- Belt
        drawPixel(2, 7, 0x555555);
        drawPixel(3, 7, 0x666666);
        drawPixel(4, 7, 0x666666);
        drawPixel(5, 7, 0x555555);

        // -- Legs
        const legBaseY = 8;
        // Left leg
        const llOff = leftLegY / PX;
        drawPixel(2, legBaseY + llOff, pantsColor);
        drawPixel(3, legBaseY + llOff, pantsColor);
        drawPixel(2, legBaseY + 1 + llOff, pantsColor);
        drawPixel(3, legBaseY + 1 + llOff, pantsShadow);
        drawPixel(2, legBaseY + 2 + llOff, pantsShadow);
        drawPixel(3, legBaseY + 2 + llOff, pantsShadow);
        drawPixel(2, legBaseY + 3 + llOff, shoeColor);
        drawPixel(3, legBaseY + 3 + llOff, shoeColor);

        // Right leg
        const rlOff = rightLegY / PX;
        drawPixel(4, legBaseY + rlOff, pantsColor);
        drawPixel(5, legBaseY + rlOff, pantsColor);
        drawPixel(4, legBaseY + 1 + rlOff, pantsShadow);
        drawPixel(5, legBaseY + 1 + rlOff, pantsColor);
        drawPixel(4, legBaseY + 2 + rlOff, pantsShadow);
        drawPixel(5, legBaseY + 2 + rlOff, pantsShadow);
        drawPixel(4, legBaseY + 3 + rlOff, shoeColor);
        drawPixel(5, legBaseY + 3 + rlOff, shoeColor);
      }

      // ── Name badge ──
      const badgeW = Math.max(name.length * 7 + 14, 40);
      const badgeH = 16;
      const badgeY = topY - 20;

      g.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, 3);
      g.fill({ color: isMe ? darken(color, 0.3) : 0x1a1a1a, alpha: 0.8 });

      g.setStrokeStyle({
        color: isMe ? color : 0x444444,
        width: 1,
        alpha: 0.6,
      });
      g.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, 3);
      g.stroke();
    },
    [color, isMe, name.length, sunlightIntensity, direction, isMoving, frame],
  );

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics draw={drawPlayer} />
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
