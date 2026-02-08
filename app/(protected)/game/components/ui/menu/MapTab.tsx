"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Property } from "@game/types/property";
import { Job } from "@game/types/job";
import {
  MAP_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
} from "@/convex/gameConstants";
import {
  ZONES,
  ZONE_VISUALS,
  WATER_LINE_Y,
  BOARDWALK_Y,
  BOARDWALK_HEIGHT,
  getZoneAt,
  getZoneList,
} from "@/convex/mapZones";
import { hexToStr } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MapPlayer {
  _id: string;
  x: number;
  y: number;
  name: string;
}

interface MapTabProps {
  playerX: number;
  playerY: number;
  properties: Property[];
  otherPlayers: MapPlayer[];
  activeJob: Job | null;
}

const CATEGORY_COLORS: Record<string, { owned: string; unowned: string }> = {
  residential: { owned: "#f97316", unowned: "rgba(249,115,22,0.5)" },
  commercial: { owned: "#3b82f6", unowned: "rgba(59,130,246,0.5)" },
  shop: { owned: "#a855f7", unowned: "rgba(168,85,247,0.5)" },
  service: { owned: "#d4a017", unowned: "#d4a01780" },
};

export function MapTab({
  playerX,
  playerY,
  properties,
  otherPlayers,
  activeJob,
}: MapTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(0);
  const animRef = useRef<number>(0);
  const pulseRef = useRef(0);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Leave some margin for the header and padding
        setSize(Math.min(width, height - 60) - 10);
      }
    };

    updateSize();
    // Use a small delay to ensure container is fully rendered
    const timer = setTimeout(updateSize, 100);

    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      clearTimeout(timer);
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || size <= 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const SCALE = size / MAP_SIZE;
    const HALF_ROAD = ROAD_WIDTH / 2;
    const FULL_SW = HALF_ROAD + SIDEWALK_W;

    if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, size, size);

    // ── Zone-colored background ──
    const zoneBlockPx = 20; // resolution
    for (let bx = 0; bx < size; bx += zoneBlockPx) {
      for (let by = 0; by < size; by += zoneBlockPx) {
        const worldX = (bx + zoneBlockPx / 2) / SCALE;
        const worldY = (by + zoneBlockPx / 2) / SCALE;
        const zoneId = getZoneAt(worldX, worldY);
        const vis = ZONE_VISUALS[zoneId];
        ctx.fillStyle = hexToStr(vis.grassColor);
        ctx.fillRect(bx, by, zoneBlockPx, zoneBlockPx);
      }
    }

    // ── Beach sand ──
    const beachBounds = ZONES.beach.bounds;
    const sandTopPx = beachBounds.y1 * SCALE;
    const waterLinePx = WATER_LINE_Y * SCALE;
    ctx.fillStyle = "#d4b483";
    ctx.fillRect(0, sandTopPx, size, waterLinePx - sandTopPx);

    // ── Boardwalk ──
    const bwTopPx = (BOARDWALK_Y - BOARDWALK_HEIGHT / 2) * SCALE;
    const bwHPx = BOARDWALK_HEIGHT * SCALE;
    ctx.fillStyle = "#8b6b4a";
    ctx.fillRect(0, bwTopPx, size, bwHPx);

    // ── Ocean ──
    ctx.fillStyle = "#1a6b8a";
    ctx.fillRect(0, waterLinePx, size, size - waterLinePx);

    // ── Park pond ──
    const parkBounds = ZONES.park.bounds;
    const parkCX = ((parkBounds.x1 + parkBounds.x2) / 2) * SCALE;
    const parkCY = ((parkBounds.y1 + parkBounds.y2) / 2) * SCALE;
    const pondX = parkCX + 120 * SCALE;
    const pondY = parkCY - 100 * SCALE;
    ctx.beginPath();
    ctx.ellipse(pondX, pondY, 80 * SCALE, 50 * SCALE, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(58, 138, 170, 0.5)";
    ctx.fill();

    // ── Roads ──
    ctx.fillStyle = "#555555";
    for (let ry = ROAD_SPACING; ry < MAP_SIZE; ry += ROAD_SPACING) {
      if (ry - FULL_SW > WATER_LINE_Y) continue;
      const y = (ry - FULL_SW) * SCALE;
      const roadH = Math.min(
        (ROAD_WIDTH + SIDEWALK_W * 2) * SCALE,
        waterLinePx - y,
      );
      if (roadH > 0) ctx.fillRect(0, y, size, roadH);
    }
    for (let rx = ROAD_SPACING; rx < MAP_SIZE; rx += ROAD_SPACING) {
      const x = (rx - FULL_SW) * SCALE;
      const roadW = (ROAD_WIDTH + SIDEWALK_W * 2) * SCALE;
      const roadH = Math.min(size, waterLinePx);
      ctx.fillRect(x, 0, roadW, roadH);
    }

    // ── Road center lines ──
    ctx.strokeStyle = "#777777";
    ctx.lineWidth = 0.5;
    for (let ry = ROAD_SPACING; ry < MAP_SIZE; ry += ROAD_SPACING) {
      if (ry > WATER_LINE_Y) continue;
      ctx.beginPath();
      ctx.moveTo(0, ry * SCALE);
      ctx.lineTo(size, ry * SCALE);
      ctx.stroke();
    }
    for (let rx = ROAD_SPACING; rx < MAP_SIZE; rx += ROAD_SPACING) {
      ctx.beginPath();
      ctx.moveTo(rx * SCALE, 0);
      ctx.lineTo(rx * SCALE, Math.min(size, waterLinePx));
      ctx.stroke();
    }

    // ── Intersections ──
    ctx.fillStyle = "#666666";
    for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
      for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
        if (iy > WATER_LINE_Y) continue;
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
    ctx.lineWidth = size > 400 ? 1.5 : 1;
    const zoneList = getZoneList();
    for (const zone of zoneList) {
      if (zone.id === "suburbs") continue;
      const b = zone.bounds;
      ctx.strokeRect(
        b.x1 * SCALE,
        b.y1 * SCALE,
        (b.x2 - b.x1) * SCALE,
        (b.y2 - b.y1) * SCALE,
      );

      if (size > 400) {
        ctx.fillStyle = "#ffffff30";
        ctx.font = "italic 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(zone.name, (b.x1 + 10) * SCALE, (b.y1 + 15) * SCALE);
      }
    }
    ctx.setLineDash([]);

    // ── Delivery markers ──
    if (activeJob) {
      const pulse = Math.sin(pulseRef.current) * 0.5 + 0.5;
      const markerBaseSize = size > 400 ? 5 : 3;
      const markerSize = markerBaseSize + pulse * 2;

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
      ctx.arc(
        dx,
        dy,
        isDropoffActive ? markerSize : markerBaseSize,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = isDropoffActive ? "#f97316" : "#f9731660";
      ctx.fill();
      ctx.strokeStyle = isDropoffActive ? "#ffffff" : "#ffffff40";
      ctx.lineWidth = isDropoffActive ? 1 : 0.5;
      ctx.stroke();
    }

    // ── Other players ──
    for (const p of otherPlayers) {
      ctx.beginPath();
      ctx.arc(p.x * SCALE, p.y * SCALE, size > 400 ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#00000060";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ── Local player ──
    const lpx = playerX * SCALE;
    const lpy = playerY * SCALE;
    const localSize = size > 400 ? 5 : 3.5;
    ctx.beginPath();
    ctx.arc(lpx, lpy, localSize * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lpx, lpy, localSize, 0, Math.PI * 2);
    ctx.fillStyle = "#10b981";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── Border ──
    ctx.strokeStyle = "#ffffff15";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, size, size);
  }, [playerX, playerY, properties, otherPlayers, activeJob, size]);

  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      pulseRef.current += 0.05;
      draw();
      animRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  const currentZone = getZoneAt(playerX, playerY);
  const zoneName = ZONES[currentZone]?.name || "Unknown";

  return (
    <div className="flex flex-col h-full gap-4 min-h-100" ref={containerRef}>
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2">
            World Map
            <Badge variant="outline" className="font-mono text-[10px] py-0">
              {Math.round(playerX)}, {Math.round(playerY)}
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground">
            Current Location:{" "}
            <span className="text-foreground">{zoneName}</span>
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-[#10b981]" />
            <span className="text-muted-foreground uppercase tracking-wider font-semibold">
              You
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-[#ef4444]" />
            <span className="text-muted-foreground uppercase tracking-wider font-semibold">
              Players
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-[#f97316]" />
            <span className="text-muted-foreground uppercase tracking-wider font-semibold">
              Owned
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-[#3b82f6]" />
            <span className="text-muted-foreground uppercase tracking-wider font-semibold">
              Commercial
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-muted/10 rounded-xl border border-dashed border-muted-foreground/20 overflow-hidden relative">
        {size > 0 ? (
          <div className="relative shadow-2xl rounded-sm border border-white/5 overflow-hidden bg-black/40">
            <canvas ref={canvasRef} style={{ imageRendering: "pixelated" }} />
          </div>
        ) : (
          <div className="text-muted-foreground text-sm animate-pulse">
            Calculating map scale...
          </div>
        )}
      </div>
    </div>
  );
}
