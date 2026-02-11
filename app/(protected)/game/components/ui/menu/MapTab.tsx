"use client";

import { useRef, useEffect, useCallback, useState } from "react";
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

    // Sand gradient
    const sandGradient = ctx.createLinearGradient(0, sandTopPx, 0, waterLinePx);
    sandGradient.addColorStop(0, "#d4b483");
    sandGradient.addColorStop(1, "#f0e4c8");
    ctx.fillStyle = sandGradient;
    ctx.fillRect(0, sandTopPx, size, waterLinePx - sandTopPx);

    // ── Boardwalk ──
    const bwTopPx = (BOARDWALK_Y - BOARDWALK_HEIGHT / 2) * SCALE;
    const bwHPx = BOARDWALK_HEIGHT * SCALE;
    ctx.fillStyle = "#8b6b4a";
    ctx.fillRect(0, bwTopPx, size, bwHPx);

    // Plank lines (subtle)
    ctx.strokeStyle = "#6b4a2a";
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    for (let px = 0; px < MAP_SIZE; px += 24) {
      ctx.beginPath();
      ctx.moveTo(px * SCALE, bwTopPx);
      ctx.lineTo(px * SCALE, bwTopPx + bwHPx);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // ── Ocean ──
    ctx.fillStyle = "#1a6b8a";
    ctx.fillRect(0, waterLinePx, size, size - waterLinePx);

    // Waves
    ctx.strokeStyle = "#2a8aaa";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    for (let wy = WATER_LINE_Y + 15; wy < MAP_SIZE; wy += 40) {
      ctx.beginPath();
      for (let wx = 0; wx < MAP_SIZE; wx += 60) {
        ctx.moveTo(wx * SCALE, wy * SCALE);
        ctx.lineTo((wx + 30) * SCALE, (wy - 4) * SCALE);
        ctx.lineTo((wx + 60) * SCALE, wy * SCALE);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // ── Park features ──
    const parkBounds = ZONES.park.bounds;
    const parkCX = (parkBounds.x1 + parkBounds.x2) / 2;
    const parkCY = (parkBounds.y1 + parkBounds.y2) / 2;

    // Park paths
    ctx.strokeStyle = "#bc9c63";
    ctx.lineWidth = 10 * SCALE;
    ctx.globalAlpha = 0.5;
    const radius = 280;
    ctx.beginPath();
    ctx.arc(parkCX * SCALE, parkCY * SCALE, radius * SCALE, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(parkBounds.x1 * SCALE, parkCY * SCALE);
    ctx.lineTo(parkBounds.x2 * SCALE, parkCY * SCALE);
    ctx.moveTo(parkCX * SCALE, parkBounds.y1 * SCALE);
    ctx.lineTo(parkCX * SCALE, parkBounds.y2 * SCALE);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Central Fountain
    ctx.beginPath();
    ctx.arc(parkCX * SCALE, parkCY * SCALE, 55 * SCALE, 0, Math.PI * 2);
    ctx.fillStyle = "#bbbbbb";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(parkCX * SCALE, parkCY * SCALE, 45 * SCALE, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(74, 146, 178, 0.8)";
    ctx.fill();

    // Ponds
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
      ctx.strokeStyle = "rgba(42, 122, 154, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    drawPond(parkCX + 420, parkCY - 100, 110, 70);
    drawPond(parkCX - 380, parkCY + 280, 90, 60);

    // ── Roads ──
    const asphaltColor = "#3a3a3a";
    const sidewalkColor = "#9e9e9e";

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
          drawRoadSegment(ctx, segmentStart, ry, rx - segmentStart, true);
          segmentStart = -1;
        }
      }
      if (segmentStart !== -1) {
        drawRoadSegment(ctx, segmentStart, ry, MAP_SIZE - segmentStart, true);
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
          drawRoadSegment(ctx, rx, segmentStart, ry - segmentStart, false);
          segmentStart = -1;
        }
      }
      if (segmentStart !== -1) {
        drawRoadSegment(ctx, rx, segmentStart, MAP_SIZE - segmentStart, false);
      }
    }

    function drawRoadSegment(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      length: number,
      horizontal: boolean,
    ) {
      if (horizontal) {
        const rTop = (y - FULL_SW) * SCALE;
        const rBottom = Math.min((y + FULL_SW) * SCALE, waterLinePx);
        const rH = rBottom - rTop;
        if (rH <= 0) return;

        // Sidewalk
        ctx.fillStyle = sidewalkColor;
        ctx.fillRect(x * SCALE, rTop, length * SCALE, rH);

        // Asphalt
        const aTop = (y - ROAD_WIDTH / 2) * SCALE;
        const aBottom = Math.min((y + ROAD_WIDTH / 2) * SCALE, waterLinePx);
        const aH = aBottom - aTop;
        if (aH > 0) {
          ctx.fillStyle = asphaltColor;
          ctx.fillRect(x * SCALE, aTop, length * SCALE, aH);

          // Center line
          if (size > 300 && y * SCALE < waterLinePx) {
            ctx.setLineDash([4 * SCALE, 4 * SCALE]);
            ctx.strokeStyle = "rgba(232, 185, 48, 0.5)";
            ctx.lineWidth = 1 * SCALE;
            ctx.beginPath();
            ctx.moveTo(x * SCALE, y * SCALE);
            ctx.lineTo((x + length) * SCALE, y * SCALE);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      } else {
        const rLeft = (x - FULL_SW) * SCALE;
        const rW = (ROAD_WIDTH + SIDEWALK_W * 2) * SCALE;
        const rTop = y * SCALE;
        const rBottom = Math.min((y + length) * SCALE, waterLinePx);
        const rH = rBottom - rTop;
        if (rH <= 0) return;

        // Sidewalk
        ctx.fillStyle = sidewalkColor;
        ctx.fillRect(rLeft, rTop, rW, rH);

        // Asphalt
        const aLeft = (x - ROAD_WIDTH / 2) * SCALE;
        const aW = ROAD_WIDTH * SCALE;
        ctx.fillStyle = asphaltColor;
        ctx.fillRect(aLeft, rTop, aW, rH);

        // Center line
        if (size > 300) {
          ctx.setLineDash([4 * SCALE, 4 * SCALE]);
          ctx.strokeStyle = "rgba(232, 185, 48, 0.5)";
          ctx.lineWidth = 1 * SCALE;
          ctx.beginPath();
          ctx.moveTo(x * SCALE, rTop);
          ctx.lineTo(x * SCALE, rBottom);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // ── Intersections ──
    for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
      for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
        if (iy - HALF_ROAD > WATER_LINE_Y) continue;
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

        const x = (ix - ROAD_WIDTH / 2) * SCALE;
        const y = (iy - ROAD_WIDTH / 2) * SCALE;
        const s = ROAD_WIDTH * SCALE;
        ctx.fillStyle = asphaltColor;
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
  const zoneName = currentZone ? ZONES[currentZone].name : "Ocean";

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
