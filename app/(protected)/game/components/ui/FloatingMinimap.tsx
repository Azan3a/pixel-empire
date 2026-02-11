// components/game/ui/FloatingMinimap.tsx
"use client";

import { useRef, useEffect, useCallback } from "react";
import { Property } from "@game/types/property";
import { Job } from "@game/types/job";
import { ROAD_SPACING, ROAD_WIDTH, SIDEWALK_W } from "@/convex/gameConstants";
import { MAP_SIZE } from "@/convex/map/constants";
import {
  ZONES,
  ZONE_VISUALS,
  getZoneAt,
  getZoneList,
} from "@/convex/map/zones";
import { WATER_LINE_Y, BOARDWALK_Y, BOARDWALK_HEIGHT } from "@/convex/mapZones";
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
const HALF_ROAD = ROAD_WIDTH / 2;
const FULL_SW = HALF_ROAD + SIDEWALK_W;

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

    // ── Beach sand ──
    const beachBounds = ZONES.beach.bounds;
    const waterLinePx = WATER_LINE_Y * SCALE;
    const sandTopPx = beachBounds.y1 * SCALE;

    const sandGradient = ctx.createLinearGradient(0, sandTopPx, 0, waterLinePx);
    sandGradient.addColorStop(0, "#d4b483");
    sandGradient.addColorStop(1, "#f0e4c8");
    ctx.fillStyle = sandGradient;
    ctx.fillRect(0, sandTopPx, w, waterLinePx - sandTopPx);

    // ── Boardwalk ──
    const bwTopPx = (BOARDWALK_Y - BOARDWALK_HEIGHT / 2) * SCALE;
    const bwHPx = BOARDWALK_HEIGHT * SCALE;
    ctx.fillStyle = "#8b6b4a";
    ctx.fillRect(0, bwTopPx, w, bwHPx);

    // ── Ocean ──
    ctx.fillStyle = "#1a6b8a";
    ctx.fillRect(0, waterLinePx, w, h - waterLinePx);

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

    // ── Roads ──
    const asphaltColor = "#555555";

    // Horizontal Roads
    for (let ry = ROAD_SPACING; ry < MAP_SIZE; ry += ROAD_SPACING) {
      if (ry - FULL_SW > WATER_LINE_Y) continue;

      let segmentStart = -1;
      for (let rx = 0; rx < MAP_SIZE; rx += ROAD_SPACING) {
        const zUp = getZoneAt(rx + ROAD_SPACING / 2, ry - 1);
        const zDown = getZoneAt(rx + ROAD_SPACING / 2, ry + 1);
        if ((zUp && ZONES[zUp].hasRoads) || (zDown && ZONES[zDown].hasRoads)) {
          if (segmentStart === -1) segmentStart = rx;
        } else if (segmentStart !== -1) {
          ctx.fillStyle = asphaltColor;
          ctx.fillRect(
            segmentStart * SCALE,
            (ry - FULL_SW) * SCALE,
            (rx - segmentStart) * SCALE,
            (ROAD_WIDTH + SIDEWALK_W * 2) * SCALE,
          );
          segmentStart = -1;
        }
      }
      if (segmentStart !== -1) {
        ctx.fillStyle = asphaltColor;
        ctx.fillRect(
          segmentStart * SCALE,
          (ry - FULL_SW) * SCALE,
          (MAP_SIZE - segmentStart) * SCALE,
          (ROAD_WIDTH + SIDEWALK_W * 2) * SCALE,
        );
      }
    }

    // Vertical Roads
    for (let rx = ROAD_SPACING; rx < MAP_SIZE; rx += ROAD_SPACING) {
      let segmentStart = -1;
      for (let ry = 0; ry < MAP_SIZE; ry += ROAD_SPACING) {
        const zLeft = getZoneAt(rx - 1, ry + ROAD_SPACING / 2);
        const zRight = getZoneAt(rx + 1, ry + ROAD_SPACING / 2);
        if (
          (zLeft && ZONES[zLeft].hasRoads) ||
          (zRight && ZONES[zRight].hasRoads)
        ) {
          if (segmentStart === -1) segmentStart = ry;
        } else if (segmentStart !== -1) {
          ctx.fillStyle = asphaltColor;
          ctx.fillRect(
            (rx - FULL_SW) * SCALE,
            segmentStart * SCALE,
            (ROAD_WIDTH + SIDEWALK_W * 2) * SCALE,
            (ry - segmentStart) * SCALE,
          );
          segmentStart = -1;
        }
      }
      if (segmentStart !== -1) {
        ctx.fillStyle = asphaltColor;
        const rTop = segmentStart * SCALE;
        const rH = Math.min(MAP_SIZE, WATER_LINE_Y) * SCALE - rTop;
        if (rH > 0) {
          ctx.fillRect(
            (rx - FULL_SW) * SCALE,
            rTop,
            (ROAD_WIDTH + SIDEWALK_W * 2) * SCALE,
            rH,
          );
        }
      }
    }

    // ── Intersections ──
    ctx.fillStyle = "#666666";
    for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
      for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
        if (iy > WATER_LINE_Y) continue;
        const hUp = getZoneAt(ix, iy - 1);
        const hDown = getZoneAt(ix, iy + 1);
        const hasH =
          (hUp ? ZONES[hUp].hasRoads : false) ||
          (hDown ? ZONES[hDown].hasRoads : false);
        const vLeft = getZoneAt(ix - 1, iy);
        const vRight = getZoneAt(ix + 1, iy);
        const hasV =
          (vLeft ? ZONES[vLeft].hasRoads : false) ||
          (vRight ? ZONES[vRight].hasRoads : false);
        if (!hasH || !hasV) continue;

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
