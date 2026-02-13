// components/game/ui/FloatingMinimap.tsx
"use client";

import { useRef, useEffect, useCallback } from "react";
import { Property } from "@game/types/property";
import { Job } from "@game/types/job";
import { MAP_SIZE } from "@game/shared/contracts/game-config";
import {
  MapRenderer,
  type MapPlayerPoint,
} from "@game/features/world/renderers/minimap/map-renderer";

interface FloatingMinimapProps {
  playerX: number;
  playerY: number;
  properties: Property[];
  otherPlayers: MapPlayerPoint[];
  activeJob: Job | null;
  viewportWidth: number;
  viewportHeight: number;
}

const MINIMAP_SIZE = 240;

export function FloatingMinimap({
  playerX,
  playerY,
  properties,
  otherPlayers,
  activeJob,
  viewportWidth,
  viewportHeight,
}: FloatingMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const pulseRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = MINIMAP_SIZE;
    const h = MINIMAP_SIZE;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    }

    const renderer = new MapRenderer({
      ctx,
      size: MINIMAP_SIZE,
      playerX,
      playerY,
      properties,
      otherPlayers,
      activeJob,
      pulseValue: pulseRef.current,
    });

    renderer.draw({
      ctx,
      size: MINIMAP_SIZE,
      playerX,
      playerY,
      properties,
      otherPlayers,
      activeJob,
      pulseValue: pulseRef.current,
    });

    const scale = MINIMAP_SIZE / MAP_SIZE;
    const vpX = (playerX - viewportWidth / 2) * scale;
    const vpY = (playerY - viewportHeight / 2) * scale;
    const vpW = viewportWidth * scale;
    const vpH = viewportHeight * scale;

    ctx.strokeStyle = "#ffffff50";
    ctx.lineWidth = 1;
    ctx.strokeRect(vpX, vpY, vpW, vpH);
  }, [
    playerX,
    playerY,
    properties,
    otherPlayers,
    activeJob,
    viewportWidth,
    viewportHeight,
  ]);

  useEffect(() => {
    const loop = () => {
      pulseRef.current += 1;
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const handleMinimapClick = () => {
    window.dispatchEvent(new CustomEvent("open-game-menu-map-tab"));
  };

  return (
    <div
      className="rounded-sm overflow-hidden border-2 border-white/20 shadow-2xl bg-black/40 backdrop-blur-sm pointer-events-auto"
      onClick={handleMinimapClick}
      style={{ cursor: "pointer" }}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
