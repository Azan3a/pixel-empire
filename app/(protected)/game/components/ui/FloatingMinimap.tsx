// components/game/ui/FloatingMinimap.tsx
"use client";

import { useRef, useEffect, useCallback } from "react";
import { Property } from "@game/types/property";
import { Job } from "@game/types/job";
import { MAP_SIZE, ROAD_STYLES } from "@/convex/map/constants";
import {
  ZONES,
  ZONE_VISUALS,
  getZoneAt,
  getZoneList,
} from "@/convex/map/zones";
import { ALL_ZONE_DATA } from "@/convex/map/zones/index";
import { COASTLINE_POLYGON, SMALL_ISLAND_POLYGON } from "@/convex/map/islands";
import { hexToStr } from "@/lib/utils";
interface MinimapPlayer {
  _id: string;
  x: number;
  y: number;
  name: string;
}

interface FloatingMinimapProps {
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

// Minimap category colors
const CATEGORY_COLORS: Record<string, { owned: string; unowned: string }> = {
  residential: { owned: "#f97316", unowned: "rgba(249,115,22,0.5)" },
  commercial: { owned: "#3b82f6", unowned: "rgba(59,130,246,0.5)" },
  shop: { owned: "#a855f7", unowned: "rgba(168,85,247,0.5)" },
  service: { owned: "#d4a017", unowned: "#d4a01780" },
};

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

    ctx.clearRect(0, 0, w, h);

    // ── Zone-colored background ──
    const zoneBlockPx = 20; // resolution in minimap pixels
    // const zoneBlockWorld = zoneBlockPx / SCALE;
    for (let bx = 0; bx < w; bx += zoneBlockPx) {
      for (let by = 0; by < h; by += zoneBlockPx) {
        const worldX = (bx + zoneBlockPx / 2) / SCALE;
        const worldY = (by + zoneBlockPx / 2) / SCALE;
        const zoneId = getZoneAt(worldX, worldY);
        if (!zoneId) {
          ctx.fillStyle = "#1a6b8a";
        } else {
          const vis = ZONE_VISUALS[zoneId];
          ctx.fillStyle = hexToStr(vis.grassColor);
        }
        ctx.fillRect(bx, by, zoneBlockPx, zoneBlockPx);
      }
    }

    // ── Coastline outline ──
    ctx.strokeStyle = "#ddeeff";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3;
    for (const poly of [COASTLINE_POLYGON, SMALL_ISLAND_POLYGON]) {
      ctx.beginPath();
      ctx.moveTo(poly[0].x * SCALE, poly[0].y * SCALE);
      for (let i = 1; i < poly.length; i++)
        ctx.lineTo(poly[i].x * SCALE, poly[i].y * SCALE);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // ── Park Ponds ──
    const parkBounds = ZONES.park.bounds;
    const parkCX = (parkBounds.x1 + parkBounds.x2) / 2;
    const parkCY = (parkBounds.y1 + parkBounds.y2) / 2;

    const drawPond = (px: number, py: number, rw: number, rh: number) => {
      ctx.beginPath();
      ctx.ellipse(
        px * SCALE,
        py * SCALE,
        rw * SCALE,
        rh * SCALE,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "rgba(58, 138, 170, 0.5)";
      ctx.fill();
    };
    drawPond(parkCX + 420, parkCY - 100, 110, 70);
    drawPond(parkCX - 380, parkCY + 280, 90, 60);

    // ── Zone Roads ──
    const allRoads = Object.values(ALL_ZONE_DATA).flatMap((z) => z.roads);
    for (const road of allRoads) {
      const style = ROAD_STYLES[road.style];
      if (!style) continue;
      const hw = (style.width / 2) * SCALE;

      ctx.fillStyle = "#555555";

      if (road.y1 === road.y2) {
        // Horizontal
        const x = Math.min(road.x1, road.x2) * SCALE;
        const len = Math.abs(road.x2 - road.x1) * SCALE;
        ctx.fillRect(x, road.y1 * SCALE - hw, len, hw * 2);
      } else if (road.x1 === road.x2) {
        // Vertical
        const y = Math.min(road.y1, road.y2) * SCALE;
        const len = Math.abs(road.y2 - road.y1) * SCALE;
        ctx.fillRect(road.x1 * SCALE - hw, y, hw * 2, len);
      } else {
        // Diagonal — draw as thick line
        ctx.beginPath();
        ctx.lineWidth = style.width * SCALE;
        ctx.strokeStyle = "#555555";
        ctx.moveTo(road.x1 * SCALE, road.y1 * SCALE);
        ctx.lineTo(road.x2 * SCALE, road.y2 * SCALE);
        ctx.stroke();
      }
    }

    // ── Properties ──
    for (const prop of properties) {
      const px = prop.x * SCALE;
      const py = prop.y * SCALE;
      const pw = Math.max(2, prop.width * SCALE);
      const ph = Math.max(2, prop.height * SCALE);

      const colors =
        CATEGORY_COLORS[prop.category] ?? CATEGORY_COLORS.commercial;

      ctx.fillStyle = prop.isOwned ? colors.owned : colors.unowned;
      ctx.fillRect(px, py, pw, ph);

      ctx.strokeStyle = "#00000040";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, py, pw, ph);
    }

    // ── Zone boundary lines ──
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "#ffffff18";
    ctx.lineWidth = 1;
    const zoneList = getZoneList();
    for (const zone of zoneList) {
      if (zone.id === "suburbs") continue; // suburbs is the fallback, no boundary
      const b = zone.bounds;
      ctx.strokeRect(
        b.x1 * SCALE,
        b.y1 * SCALE,
        (b.x2 - b.x1) * SCALE,
        (b.y2 - b.y1) * SCALE,
      );
    }
    ctx.setLineDash([]);

    // ── Delivery markers ──
    if (activeJob) {
      const pulse = Math.sin(pulseRef.current) * 0.5 + 0.5;
      const markerSize = 3 + pulse * 2;

      if (activeJob.status === "accepted") {
        const px = activeJob.pickupX * SCALE;
        const py = activeJob.pickupY * SCALE;
        ctx.beginPath();
        ctx.arc(px, py, markerSize + 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${0.15 + pulse * 0.15})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, markerSize, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const dx = activeJob.dropoffX * SCALE;
      const dy = activeJob.dropoffY * SCALE;
      const isDropoffActive = activeJob.status === "picked_up";

      if (isDropoffActive) {
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

      // Route line
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
      ctx.beginPath();
      ctx.arc(p.x * SCALE, p.y * SCALE, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#00000060";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ── Local player ──
    const lpx = playerX * SCALE;
    const lpy = playerY * SCALE;
    ctx.beginPath();
    ctx.arc(lpx, lpy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    ctx.fill();
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

    const tick = 4;
    ctx.strokeStyle = "#ffffffa0";
    ctx.lineWidth = 1.5;
    // Corner ticks
    ctx.beginPath();
    ctx.moveTo(vpX, vpY + tick);
    ctx.lineTo(vpX, vpY);
    ctx.lineTo(vpX + tick, vpY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(vpX + vpW - tick, vpY);
    ctx.lineTo(vpX + vpW, vpY);
    ctx.lineTo(vpX + vpW, vpY + tick);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(vpX, vpY + vpH - tick);
    ctx.lineTo(vpX, vpY + vpH);
    ctx.lineTo(vpX + tick, vpY + vpH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(vpX + vpW - tick, vpY + vpH);
    ctx.lineTo(vpX + vpW, vpY + vpH);
    ctx.lineTo(vpX + vpW, vpY + vpH - tick);
    ctx.stroke();

    // ── Border ──
    ctx.strokeStyle = "#ffffff15";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);

    // ── Zone label at player position ──
    const currentZone = getZoneAt(playerX, playerY);
    const zoneName = currentZone ? ZONES[currentZone].name : "Ocean";

    ctx.fillStyle = "#ffffffcc";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(zoneName, 4, 11);

    // ── Coordinates ──
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

  // Add click handler to open MapTab
  const handleMinimapClick = () => {
    window.dispatchEvent(new CustomEvent("open-game-menu-map-tab"));
  };

  return (
    <div
      className="pointer-events-auto flex flex-col gap-1"
      onClick={handleMinimapClick}
      style={{ cursor: "pointer" }}
    >
      <div className="rounded-sm overflow-hidden border border-white/10 shadow-2xl bg-black/30 backdrop-blur-sm">
        <canvas ref={canvasRef} style={{ imageRendering: "pixelated" }} />
      </div>
    </div>
  );
}
