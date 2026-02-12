"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type MouseEvent,
} from "react";
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

const CATEGORY_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  shop: "Shop",
  service: "Service",
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  residential: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  commercial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  shop: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  service: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

type HoveredItem =
  | { type: "property"; data: Property; screenX: number; screenY: number }
  | { type: "player"; name: string; screenX: number; screenY: number }
  | null;

const PLAYER_HIT_RADIUS = 20; // world units
const TOOLTIP_OFFSET = 14;

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
  const [hoveredItem, setHoveredItem] = useState<HoveredItem>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const lastHitCheckRef = useRef(0);

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
        if (ZONES[zUp].hasRoads || ZONES[zDown].hasRoads) {
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
        if (ZONES[zLeft].hasRoads || ZONES[zRight].hasRoads) {
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
        const hasH =
          ZONES[getZoneAt(ix, iy - 1)].hasRoads ||
          ZONES[getZoneAt(ix, iy + 1)].hasRoads;
        const hasV =
          ZONES[getZoneAt(ix - 1, iy)].hasRoads ||
          ZONES[getZoneAt(ix + 1, iy)].hasRoads;
        if (!hasH || !hasV) continue;

        const x = (ix - ROAD_WIDTH / 2) * SCALE;
        const y = (iy - ROAD_WIDTH / 2) * SCALE;
        const s = ROAD_WIDTH * SCALE;
        ctx.fillStyle = asphaltColor;
        ctx.fillRect(x, y, s, s);
      }
    }

    // ── Properties ──
    const currentHoveredId = hoveredIdRef.current;
    for (const prop of properties) {
      const px = prop.x * SCALE;
      const py = prop.y * SCALE;
      const pw = Math.max(2, prop.width * SCALE);
      const ph = Math.max(2, prop.height * SCALE);

      const colors =
        CATEGORY_COLORS[prop.category] ?? CATEGORY_COLORS.commercial;

      const isHovered = currentHoveredId === prop._id;

      ctx.fillStyle = prop.isOwned ? colors.owned : colors.unowned;
      ctx.fillRect(px, py, pw, ph);

      if (isHovered) {
        // Bright hover highlight
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(px - 1, py - 1, pw + 2, ph + 2);
        // Glow
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 6;
        ctx.strokeRect(px - 1, py - 1, pw + 2, ph + 2);
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = "#00000040";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, pw, ph);
      }
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
      const isPlayerHovered = currentHoveredId === `player-${p._id}`;
      const baseR = size > 400 ? 3.5 : 2.5;
      const r = isPlayerHovered ? baseR + 2 : baseR;

      if (isPlayerHovered) {
        // Hover ring
        ctx.beginPath();
        ctx.arc(p.x * SCALE, p.y * SCALE, r + 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x * SCALE, p.y * SCALE, r, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = isPlayerHovered ? "#ffffff" : "#00000060";
      ctx.lineWidth = isPlayerHovered ? 1.5 : 0.5;
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

  // ── Hit-testing on mouse move ──
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      const now = performance.now();
      if (now - lastHitCheckRef.current < 40) return; // throttle ~25fps
      lastHitCheckRef.current = now;

      const canvas = canvasRef.current;
      if (!canvas || size <= 0) return;

      const rect = canvas.getBoundingClientRect();
      // const dpr = window.devicePixelRatio || 1;
      // Account for CSS size vs actual rendered bounds
      const cssW = rect.width;
      const cssH = rect.height;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Convert screen px to world coordinates
      const SCALE = size / MAP_SIZE;
      const worldX = ((mx / cssW) * size) / SCALE;
      const worldY = ((my / cssH) * size) / SCALE;

      // Tooltip position relative to the canvas wrapper
      const screenX = mx;
      const screenY = my;

      // 1. Check properties (rect hit test)
      for (const prop of properties) {
        if (
          worldX >= prop.x &&
          worldX <= prop.x + prop.width &&
          worldY >= prop.y &&
          worldY <= prop.y + prop.height
        ) {
          const id = prop._id as string;
          if (hoveredIdRef.current !== id) {
            hoveredIdRef.current = id;
            setHoveredItem({ type: "property", data: prop, screenX, screenY });
          } else {
            // Update position only
            setHoveredItem((prev) =>
              prev ? { ...prev, screenX, screenY } : prev,
            );
          }
          canvas.style.cursor = "pointer";
          return;
        }
      }

      // 2. Check other players (circle hit test)
      for (const p of otherPlayers) {
        const dx = worldX - p.x;
        const dy = worldY - p.y;
        if (dx * dx + dy * dy <= PLAYER_HIT_RADIUS * PLAYER_HIT_RADIUS) {
          const id = `player-${p._id}`;
          if (hoveredIdRef.current !== id) {
            hoveredIdRef.current = id;
            setHoveredItem({ type: "player", name: p.name, screenX, screenY });
          } else {
            setHoveredItem((prev) =>
              prev ? { ...prev, screenX, screenY } : prev,
            );
          }
          canvas.style.cursor = "pointer";
          return;
        }
      }

      // Nothing hovered
      if (hoveredIdRef.current !== null) {
        hoveredIdRef.current = null;
        setHoveredItem(null);
        canvas.style.cursor = "default";
      }
    },
    [size, properties, otherPlayers],
  );

  const handleMouseLeave = useCallback(() => {
    hoveredIdRef.current = null;
    setHoveredItem(null);
    if (canvasRef.current) canvasRef.current.style.cursor = "default";
  }, []);

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
              Residential
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-[#3b82f6]" />
            <span className="text-muted-foreground uppercase tracking-wider font-semibold">
              Commercial
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-[#a855f7]" />
            <span className="text-muted-foreground uppercase tracking-wider font-semibold">
              Shop
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-[#d4a017]" />
            <span className="text-muted-foreground uppercase tracking-wider font-semibold">
              Service
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-muted/10 rounded-xl border border-dashed border-muted-foreground/20 overflow-hidden relative">
        {size > 0 ? (
          <div className="relative shadow-2xl rounded-sm border border-white/5 overflow-hidden bg-black/40">
            <canvas
              ref={canvasRef}
              style={{ imageRendering: "pixelated" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />

            {/* ── Hover Tooltip ── */}
            {hoveredItem && (
              <HoverTooltip item={hoveredItem} canvasSize={size} />
            )}
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

/* ─────────────────────────────────────────────────────────
   Hover Tooltip Component
   ───────────────────────────────────────────────────────── */

function HoverTooltip({
  item,
  canvasSize,
}: {
  item: NonNullable<HoveredItem>;
  canvasSize: number;
}) {
  // Clamp tooltip so it doesn't overflow the canvas
  const tooltipW = 220;
  const tooltipH = item.type === "property" ? 160 : 40;
  let tx = item.screenX + TOOLTIP_OFFSET;
  let ty = item.screenY + TOOLTIP_OFFSET;

  if (tx + tooltipW > canvasSize) tx = item.screenX - tooltipW - 6;
  if (ty + tooltipH > canvasSize) ty = item.screenY - tooltipH - 6;
  if (tx < 0) tx = 4;
  if (ty < 0) ty = 4;

  if (item.type === "player") {
    return (
      <div
        className="absolute pointer-events-none z-50 animate-in fade-in-0 zoom-in-95 duration-100"
        style={{ left: tx, top: ty }}
      >
        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-xl px-3 py-1.5 flex items-center gap-2">
          <div className="size-2 rounded-full bg-red-500 shrink-0" />
          <span className="text-xs font-medium text-foreground truncate max-w-45">
            {item.name}
          </span>
        </div>
      </div>
    );
  }

  const prop = item.data;
  const zoneInfo = ZONES[prop.zoneId];
  const catLabel = CATEGORY_LABELS[prop.category] ?? prop.category;
  const badgeColor =
    CATEGORY_BADGE_COLORS[prop.category] ?? CATEGORY_BADGE_COLORS.commercial;

  return (
    <div
      className="absolute pointer-events-none z-50 animate-in fade-in-0 zoom-in-95 duration-100"
      style={{ left: tx, top: ty, width: tooltipW }}
    >
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-bold text-foreground leading-tight truncate">
            {prop.name}
          </h4>
          {prop.isOwned && (
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded px-1.5 py-0.5">
              Owned
            </span>
          )}
        </div>

        {/* Category + Zone */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[9px] font-semibold uppercase tracking-wider border rounded px-1.5 py-0.5 ${badgeColor}`}
          >
            {catLabel}
          </span>
          <span className="text-[9px] text-muted-foreground">
            📍 {zoneInfo?.name ?? prop.zoneId}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span className="font-semibold text-foreground">
              ${prop.price.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Income</span>
            <span className="font-semibold text-emerald-400">
              ${prop.income.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-muted-foreground">Owners</span>
            <span className="font-semibold text-foreground">
              {prop.ownerCount}/{prop.maxOwners}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
