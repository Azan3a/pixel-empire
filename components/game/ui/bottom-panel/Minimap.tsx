// components/game/ui/bottom-panel/Minimap.tsx
"use client";

import { useRef, useEffect, useCallback } from "react";
import { Property } from "@/types/property";
import { Job } from "@/types/job";
import {
  MAP_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
} from "@/convex/gameConstants";

interface MinimapPlayer {
  _id: string;
  x: number;
  y: number;
  name: string;
}

interface MinimapProps {
  playerX: number;
  playerY: number;
  properties: Property[];
  otherPlayers: MinimapPlayer[];
  activeJob: Job | null;
  viewportWidth: number;
  viewportHeight: number;
}

const MINIMAP_SIZE = 240;
const SCALE = MINIMAP_SIZE / MAP_SIZE;
const HALF_ROAD = ROAD_WIDTH / 2;
const FULL_SW = HALF_ROAD + SIDEWALK_W;

export function Minimap({
  playerX,
  playerY,
  properties,
  otherPlayers,
  activeJob,
  viewportWidth,
  viewportHeight,
}: MinimapProps) {
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

    // Size canvas for crisp rendering
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);

    // ── Background (grass) ──
    ctx.fillStyle = "#3a5a3a";
    ctx.fillRect(0, 0, w, h);

    // ── Roads ──
    ctx.fillStyle = "#555555";

    // Horizontal roads
    for (let ry = ROAD_SPACING; ry < MAP_SIZE; ry += ROAD_SPACING) {
      const y = (ry - FULL_SW) * SCALE;
      const roadH = (ROAD_WIDTH + SIDEWALK_W * 2) * SCALE;
      ctx.fillRect(0, y, w, roadH);
    }

    // Vertical roads
    for (let rx = ROAD_SPACING; rx < MAP_SIZE; rx += ROAD_SPACING) {
      const x = (rx - FULL_SW) * SCALE;
      const roadW = (ROAD_WIDTH + SIDEWALK_W * 2) * SCALE;
      ctx.fillRect(x, 0, roadW, h);
    }

    // ── Road center lines (subtle) ──
    ctx.strokeStyle = "#777777";
    ctx.lineWidth = 0.5;
    for (let ry = ROAD_SPACING; ry < MAP_SIZE; ry += ROAD_SPACING) {
      ctx.beginPath();
      ctx.moveTo(0, ry * SCALE);
      ctx.lineTo(w, ry * SCALE);
      ctx.stroke();
    }
    for (let rx = ROAD_SPACING; rx < MAP_SIZE; rx += ROAD_SPACING) {
      ctx.beginPath();
      ctx.moveTo(rx * SCALE, 0);
      ctx.lineTo(rx * SCALE, h);
      ctx.stroke();
    }

    // ── Intersections (slightly brighter) ──
    ctx.fillStyle = "#666666";
    for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
      for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
        const x = (ix - HALF_ROAD) * SCALE;
        const y = (iy - HALF_ROAD) * SCALE;
        const s = ROAD_WIDTH * SCALE;
        ctx.fillRect(x, y, s, s);
      }
    }

    // ── Properties ──
    for (const prop of properties) {
      const px = prop.x * SCALE;
      const py = prop.y * SCALE;
      const pw = Math.max(2, prop.width * SCALE);
      const ph = Math.max(2, prop.height * SCALE);

      if (prop.type === "commercial") {
        ctx.fillStyle = prop.ownerId ? "#3b82f6" : "#60a5fa80";
      } else {
        ctx.fillStyle = prop.ownerId ? "#f97316" : "#f9731680";
      }
      ctx.fillRect(px, py, pw, ph);

      // Thin border
      ctx.strokeStyle = "#00000040";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, py, pw, ph);
    }

    // ── Delivery markers ──
    if (activeJob) {
      const pulse = Math.sin(pulseRef.current) * 0.5 + 0.5;
      const markerSize = 3 + pulse * 2;

      // Pickup
      if (activeJob.status === "accepted") {
        const px = activeJob.pickupX * SCALE;
        const py = activeJob.pickupY * SCALE;

        // Glow ring
        ctx.beginPath();
        ctx.arc(px, py, markerSize + 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${0.15 + pulse * 0.15})`;
        ctx.fill();

        // Marker dot
        ctx.beginPath();
        ctx.arc(px, py, markerSize, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Dropoff (always show, dim if not active)
      const dx = activeJob.dropoffX * SCALE;
      const dy = activeJob.dropoffY * SCALE;
      const isDropoffActive = activeJob.status === "picked_up";

      if (isDropoffActive) {
        // Glow ring
        ctx.beginPath();
        ctx.arc(dx, dy, markerSize + 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 115, 22, ${0.15 + pulse * 0.15})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(dx, dy, isDropoffActive ? markerSize : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isDropoffActive ? "#f97316" : "#f9731660";
      ctx.fill();
      ctx.strokeStyle = isDropoffActive ? "#ffffff" : "#ffffff40";
      ctx.lineWidth = isDropoffActive ? 1 : 0.5;
      ctx.stroke();

      // ── Route line (dashed) ──
      if (activeJob.status === "accepted") {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = "#ffffff30";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(activeJob.pickupX * SCALE, activeJob.pickupY * SCALE);
        ctx.lineTo(dx, dy);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // ── Other players ──
    for (const p of otherPlayers) {
      const px = p.x * SCALE;
      const py = p.y * SCALE;

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#00000060";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ── Local player ──
    const lpx = playerX * SCALE;
    const lpy = playerY * SCALE;

    // Glow
    ctx.beginPath();
    ctx.arc(lpx, lpy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    ctx.fill();

    // Dot
    ctx.beginPath();
    ctx.arc(lpx, lpy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#10b981";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── Viewport rectangle ──
    const vpX = (playerX - viewportWidth / 2) * SCALE;
    const vpY = (playerY - viewportHeight / 2) * SCALE;
    const vpW = viewportWidth * SCALE;
    const vpH = viewportHeight * SCALE;

    ctx.strokeStyle = "#ffffff50";
    ctx.lineWidth = 1;
    ctx.strokeRect(vpX, vpY, vpW, vpH);

    // Corner ticks for emphasis
    const tick = 4;
    ctx.strokeStyle = "#ffffffa0";
    ctx.lineWidth = 1.5;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(vpX, vpY + tick);
    ctx.lineTo(vpX, vpY);
    ctx.lineTo(vpX + tick, vpY);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(vpX + vpW - tick, vpY);
    ctx.lineTo(vpX + vpW, vpY);
    ctx.lineTo(vpX + vpW, vpY + tick);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(vpX, vpY + vpH - tick);
    ctx.lineTo(vpX, vpY + vpH);
    ctx.lineTo(vpX + tick, vpY + vpH);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(vpX + vpW - tick, vpY + vpH);
    ctx.lineTo(vpX + vpW, vpY + vpH);
    ctx.lineTo(vpX + vpW, vpY + vpH - tick);
    ctx.stroke();

    // ── Border ──
    ctx.strokeStyle = "#ffffff15";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);

    // ── Coordinates label ──
    ctx.fillStyle = "#ffffff90";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "right";
    ctx.fillText(
      `${Math.round(playerX)}, ${Math.round(playerY)}`,
      w - 4,
      h - 4,
    );
  }, [
    playerX,
    playerY,
    properties,
    otherPlayers,
    activeJob,
    viewportWidth,
    viewportHeight,
  ]);

  // Animation loop
  useEffect(() => {
    let running = true;

    const tick = () => {
      if (!running) return;
      pulseRef.current += 0.06;
      draw();
      animRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Title */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Minimap
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            You
          </span>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            Others
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-border/50 bg-black/20 flex-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-lg"
          style={{
            imageRendering: "pixelated",
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-sm bg-[#3b82f6]" />
          Commercial
        </span>
        <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-sm bg-[#f97316]" />
          Residential
        </span>
        {activeJob && (
          <>
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-[#3b82f6] ring-1 ring-white" />
              Pickup
            </span>
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-[#f97316] ring-1 ring-white" />
              Dropoff
            </span>
          </>
        )}
      </div>
    </div>
  );
}
