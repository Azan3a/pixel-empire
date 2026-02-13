"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { Property } from "@game/types/property";
import { Job } from "@game/types/job";
import { MAP_SIZE } from "@game/shared/contracts/game-config";
import {
  MapRenderer,
  type MapPlayerPoint,
} from "@game/features/world/renderers/minimap/map-renderer";

interface MapTabProps {
  playerX: number;
  playerY: number;
  properties: Property[];
  otherPlayers: MapPlayerPoint[];
  activeJob: Job | null;
}

interface TooltipInfo {
  type: "property" | "player" | "self";
  label: string;
  details: { key: string; value: string }[];
  x: number;
  y: number;
}

interface SelectedEntity {
  type: "property" | "player" | "self";
  id: string;
  label: string;
  details: { key: string; value: string }[];
  worldX: number;
  worldY: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  shop: "Shop",
  service: "Service",
};

const CATEGORY_COLORS: Record<string, string> = {
  residential: "#f97316",
  commercial: "#3b82f6",
  shop: "#a855f7",
  service: "#eab308",
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_SPEED = 0.003;
const ZOOM_BUTTON_FACTOR = 1.3;
const HIT_RADIUS = 12;
const PAN_KEYBOARD_STEP = 40;
const INERTIA_FRICTION = 0.92;
const INERTIA_MIN_VELOCITY = 0.5;
const ZOOM_ANIMATION_DURATION = 200;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function MapTab({
  playerX,
  playerY,
  properties,
  otherPlayers,
  activeJob,
}: MapTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(
    null,
  );
  const [hoveredEntityId, setHoveredEntityId] = useState<string | null>(null);

  const activeCategories = useMemo(
    () => new Set(Object.keys(CATEGORY_LABELS)),
    [],
  );

  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragDistRef = useRef(0);

  // Inertia state
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMoveTimeRef = useRef(0);
  const inertiaAnimRef = useRef<number>(0);

  // Zoom animation state
  const zoomAnimRef = useRef<{
    startZoom: number;
    endZoom: number;
    startPan: { x: number; y: number };
    endPan: { x: number; y: number };
    startTime: number;
    duration: number;
  } | null>(null);

  // Pinch-to-zoom state
  const pinchRef = useRef<{
    initialDistance: number;
    initialZoom: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  const pulseRef = useRef(0);
  const animRef = useRef<number>(0);

  const filteredProperties = useMemo(
    () => properties.filter((p) => activeCategories.has(p.category)),
    [properties, activeCategories],
  );

  // ---- Sizing (full container) ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const { width, height } = el.getBoundingClientRect();
      setCanvasSize({ width, height });
    };

    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    offscreenRef.current = document.createElement("canvas");
    return () => {
      offscreenRef.current = null;
    };
  }, []);

  // Use the full container dimensions
  const displayWidth = canvasSize.width;
  const displayHeight = canvasSize.height;
  // The map is logically square; we use the larger dimension so it covers the whole screen
  const size = Math.min(displayWidth, displayHeight);

  // Clamp pan so the map edges don't reveal empty space
  const clampPan = useCallback(
    (pan: { x: number; y: number }, zoom: number) => {
      const mapW = size * zoom;
      const mapH = size * zoom;

      const maxPanX = Math.max((mapW - displayWidth) / 2, 0);
      const maxPanY = Math.max((mapH - displayHeight) / 2, 0);

      return {
        x: clamp(pan.x, -maxPanX, maxPanX),
        y: clamp(pan.y, -maxPanY, maxPanY),
      };
    },
    [size, displayWidth, displayHeight],
  );

  // ---- Coordinate helpers ----
  const screenToBase = useCallback(
    (screenX: number, screenY: number): [number, number] => {
      const cx = displayWidth / 2;
      const cy = displayHeight / 2;
      const z = zoomRef.current;
      const p = panRef.current;
      const mapC = size / 2;
      return [(screenX - cx - p.x) / z + mapC, (screenY - cy - p.y) / z + mapC];
    },
    [size, displayWidth, displayHeight],
  );

  const baseToWorld = useCallback(
    (baseX: number, baseY: number): [number, number] => {
      if (size <= 0) return [0, 0];
      const scale = size / MAP_SIZE;
      return [baseX / scale, baseY / scale];
    },
    [size],
  );

  const worldToBase = useCallback(
    (worldX: number, worldY: number): [number, number] => {
      if (size <= 0) return [0, 0];
      const scale = size / MAP_SIZE;
      return [worldX * scale, worldY * scale];
    },
    [size],
  );

  // ---- Hit-testing ----
  const hitTest = useCallback(
    (
      screenX: number,
      screenY: number,
    ):
      | (Omit<TooltipInfo, "x" | "y"> & {
          entityId: string;
          worldX: number;
          worldY: number;
        })
      | null => {
      if (size <= 0) return null;

      const [baseX, baseY] = screenToBase(screenX, screenY);
      const [worldX, worldY] = baseToWorld(baseX, baseY);

      for (let i = filteredProperties.length - 1; i >= 0; i -= 1) {
        const p = filteredProperties[i];
        const inX = worldX >= p.x && worldX <= p.x + p.width;
        const inY = worldY >= p.y && worldY <= p.y + p.height;
        if (inX && inY) {
          return {
            type: "property",
            entityId: p._id ?? `prop-${i}`,
            label: p.name,
            worldX: p.x + p.width / 2,
            worldY: p.y + p.height / 2,
            details: [
              {
                key: "Type",
                value: CATEGORY_LABELS[p.category] ?? p.category,
              },
              { key: "Zone", value: p.zoneId },
              { key: "Size", value: `${p.width}×${p.height}` },
              { key: "Price", value: `$${p.price.toLocaleString()}` },
              { key: "Income", value: `$${p.income.toLocaleString()}/hr` },
              {
                key: "Ownership",
                value: p.isOwned
                  ? `Owned (${p.ownerCount}/${p.maxOwners})`
                  : `Available (${p.ownerCount}/${p.maxOwners})`,
              },
            ],
          };
        }
      }

      const dist2 = (ax: number, ay: number, bx: number, by: number) => {
        const dx = ax - bx;
        const dy = ay - by;
        return dx * dx + dy * dy;
      };

      const adjustedRadius = HIT_RADIUS / zoomRef.current;
      const hitRadiusSq = adjustedRadius * adjustedRadius;

      if (dist2(worldX, worldY, playerX, playerY) <= hitRadiusSq) {
        return {
          type: "self",
          entityId: "self",
          label: "You",
          worldX: playerX,
          worldY: playerY,
          details: [
            {
              key: "Position",
              value: `${Math.round(playerX)}, ${Math.round(playerY)}`,
            },
            ...(activeJob
              ? [{ key: "Job", value: activeJob.title ?? "Active" }]
              : []),
          ],
        };
      }

      for (let i = 0; i < otherPlayers.length; i += 1) {
        const p = otherPlayers[i];
        if (dist2(worldX, worldY, p.x, p.y) <= hitRadiusSq) {
          return {
            type: "player",
            entityId: p._id,
            label: p.name?.trim() || "Player",
            worldX: p.x,
            worldY: p.y,
            details: [
              { key: "ID", value: p._id },
              {
                key: "Position",
                value: `${Math.round(p.x)}, ${Math.round(p.y)}`,
              },
            ],
          };
        }
      }

      return null;
    },
    [
      size,
      screenToBase,
      baseToWorld,
      filteredProperties,
      otherPlayers,
      playerX,
      playerY,
      activeJob,
    ],
  );

  // ---- Drawing ----
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const offscreen = offscreenRef.current;
    if (
      !canvas ||
      !offscreen ||
      size <= 0 ||
      displayWidth <= 0 ||
      displayHeight <= 0
    )
      return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const pxW = Math.round(displayWidth * dpr);
    const pxH = Math.round(displayHeight * dpr);

    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW;
      canvas.height = pxH;
    }

    // Offscreen is always square at `size`
    const pxSize = Math.round(size * dpr);
    if (offscreen.width !== pxSize || offscreen.height !== pxSize) {
      offscreen.width = pxSize;
      offscreen.height = pxSize;
    }

    const oCtx = offscreen.getContext("2d");
    if (!oCtx) return;
    oCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const renderer = new MapRenderer({
      ctx: oCtx,
      size,
      playerX,
      playerY,
      properties: filteredProperties,
      otherPlayers,
      activeJob,
      pulseValue: pulseRef.current,
    });

    renderer.draw({
      ctx: oCtx,
      size,
      playerX,
      playerY,
      properties: filteredProperties,
      otherPlayers,
      activeJob,
      pulseValue: pulseRef.current,
    });

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pxW, pxH);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = displayWidth / 2;
    const cy = displayHeight / 2;
    const mapC = size / 2;
    const z = zoomRef.current;
    const p = panRef.current;

    // Background
    ctx.fillStyle = "#070b14";
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw the map centered in the viewport with zoom/pan
    ctx.save();
    ctx.translate(cx + p.x, cy + p.y);
    ctx.scale(z, z);
    ctx.translate(-mapC, -mapC);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(offscreen, 0, 0, size, size);

    // Hover highlight
    if (hoveredEntityId) {
      const scale = size / MAP_SIZE;
      for (const prop of filteredProperties) {
        const propId = prop._id ?? `prop-${filteredProperties.indexOf(prop)}`;
        if (propId === hoveredEntityId) {
          const px0 = prop.x * scale;
          const py0 = prop.y * scale;
          const pw = prop.width * scale;
          const ph = prop.height * scale;

          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 2 / z;
          ctx.setLineDash([4 / z, 4 / z]);
          ctx.strokeRect(px0, py0, pw, ph);
          ctx.setLineDash([]);

          ctx.shadowColor = CATEGORY_COLORS[prop.category] ?? "#fff";
          ctx.shadowBlur = 8 / z;
          ctx.strokeStyle = (CATEGORY_COLORS[prop.category] ?? "#fff") + "66";
          ctx.lineWidth = 1 / z;
          ctx.strokeRect(px0, py0, pw, ph);
          ctx.shadowBlur = 0;
          break;
        }
      }
    }

    // Selection ring
    if (selectedEntity) {
      const [bx, by] = worldToBase(
        selectedEntity.worldX,
        selectedEntity.worldY,
      );
      const pulse = Math.sin(pulseRef.current * 0.05) * 0.3 + 0.7;

      ctx.beginPath();
      ctx.arc(bx, by, (14 + pulse * 4) / z, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(96, 165, 250, ${pulse})`;
      ctx.lineWidth = 2 / z;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(bx, by, (18 + pulse * 6) / z, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(96, 165, 250, ${pulse * 0.4})`;
      ctx.lineWidth = 1 / z;
      ctx.stroke();
    }

    ctx.restore();
  }, [
    size,
    displayWidth,
    displayHeight,
    playerX,
    playerY,
    filteredProperties,
    otherPlayers,
    activeJob,
    hoveredEntityId,
    selectedEntity,
    worldToBase,
  ]);

  // ---- Animation loop ----
  useEffect(() => {
    const loop = () => {
      pulseRef.current += 1;

      // Process zoom animation
      const za = zoomAnimRef.current;
      if (za) {
        const elapsed = performance.now() - za.startTime;
        const t = clamp(elapsed / za.duration, 0, 1);
        const eased = easeOutCubic(t);

        zoomRef.current = lerp(za.startZoom, za.endZoom, eased);
        panRef.current = clampPan(
          {
            x: lerp(za.startPan.x, za.endPan.x, eased),
            y: lerp(za.startPan.y, za.endPan.y, eased),
          },
          zoomRef.current,
        );
        setZoomLevel(zoomRef.current);

        if (t >= 1) {
          zoomAnimRef.current = null;
        }
      }

      // Process inertia (only when zoomed in)
      const vel = velocityRef.current;
      if (
        !dragRef.current &&
        zoomRef.current > 1 &&
        (Math.abs(vel.x) > INERTIA_MIN_VELOCITY ||
          Math.abs(vel.y) > INERTIA_MIN_VELOCITY)
      ) {
        panRef.current = clampPan(
          {
            x: panRef.current.x + vel.x,
            y: panRef.current.y + vel.y,
          },
          zoomRef.current,
        );
        vel.x *= INERTIA_FRICTION;
        vel.y *= INERTIA_FRICTION;
        if (
          Math.abs(vel.x) <= INERTIA_MIN_VELOCITY &&
          Math.abs(vel.y) <= INERTIA_MIN_VELOCITY
        ) {
          vel.x = 0;
          vel.y = 0;
        }
      }

      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw, clampPan]);

  // ---- Zoom helpers ----
  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number, animate = false) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || size <= 0) return;

      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const prevZoom = zoomRef.current;
      const nextZoom = clamp(prevZoom * factor, MIN_ZOOM, MAX_ZOOM);
      if (Math.abs(nextZoom - prevZoom) < 0.001) return;

      const cx = displayWidth / 2;
      const cy = displayHeight / 2;
      const ratio = nextZoom / prevZoom;

      const rawEndPan = {
        x: mx - cx - (mx - cx - panRef.current.x) * ratio,
        y: my - cy - (my - cy - panRef.current.y) * ratio,
      };

      const endPan = clampPan(rawEndPan, nextZoom);

      if (animate) {
        zoomAnimRef.current = {
          startZoom: prevZoom,
          endZoom: nextZoom,
          startPan: { ...panRef.current },
          endPan,
          startTime: performance.now(),
          duration: ZOOM_ANIMATION_DURATION,
        };
      } else {
        panRef.current = endPan;
        zoomRef.current = nextZoom;
        setZoomLevel(nextZoom);
      }
    },
    [size, displayWidth, displayHeight, clampPan],
  );

  const centerOnWorld = useCallback(
    (worldX: number, worldY: number, targetZoom?: number) => {
      if (size <= 0) return;

      const [bx, by] = worldToBase(worldX, worldY);
      const mapC = size / 2;
      const z = targetZoom ?? zoomRef.current;

      const rawEndPan = {
        x: -((bx - mapC) * z),
        y: -((by - mapC) * z),
      };

      const endPan = clampPan(rawEndPan, z);

      zoomAnimRef.current = {
        startZoom: zoomRef.current,
        endZoom: z,
        startPan: { ...panRef.current },
        endPan,
        startTime: performance.now(),
        duration: 300,
      };
    },
    [size, worldToBase, clampPan],
  );

  // ---- Wheel zoom ----
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      zoomAnimRef.current = null;
      const factor = Math.exp(-e.deltaY * ZOOM_SPEED);
      zoomAt(e.clientX, e.clientY, factor, false);
    },
    [zoomAt],
  );

  // ---- Pointer events ----
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      velocityRef.current = { x: 0, y: 0 };
      cancelAnimationFrame(inertiaAnimRef.current);

      dragRef.current = true;
      setIsDragging(true);
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      lastPointerRef.current = { x, y };
      dragStartRef.current = { x, y };
      dragDistRef.current = 0;
      lastMoveTimeRef.current = performance.now();
      (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const stopDragging = useCallback(
    (pointerId: number, el: HTMLCanvasElement) => {
      dragRef.current = false;
      setIsDragging(false);
      if (el.hasPointerCapture(pointerId)) {
        el.releasePointerCapture(pointerId);
      }
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (dragRef.current) {
        // No panning at zoom level 1
        if (zoomRef.current <= 1) {
          dragDistRef.current +=
            Math.abs(x - lastPointerRef.current.x) +
            Math.abs(y - lastPointerRef.current.y);
          lastPointerRef.current = { x, y };
          return;
        }

        const dx = x - lastPointerRef.current.x;
        const dy = y - lastPointerRef.current.y;

        panRef.current = clampPan(
          {
            x: panRef.current.x + dx,
            y: panRef.current.y + dy,
          },
          zoomRef.current,
        );

        const now = performance.now();
        const dt = now - lastMoveTimeRef.current;
        if (dt > 0) {
          velocityRef.current = {
            x: dx / Math.max(dt / 16, 1),
            y: dy / Math.max(dt / 16, 1),
          };
        }
        lastMoveTimeRef.current = now;

        dragDistRef.current += Math.abs(dx) + Math.abs(dy);
        lastPointerRef.current = { x, y };
        setTooltip(null);
        setHoveredEntityId(null);
        return;
      }

      const hit = hitTest(x, y);
      if (!hit) {
        setTooltip(null);
        setHoveredEntityId(null);
        return;
      }

      setHoveredEntityId(hit.entityId);

      const tooltipW = 200;
      const tooltipH = 120;
      const tx = clamp(x + 14, 0, displayWidth - tooltipW);
      const ty = clamp(
        x + 14 > displayWidth - tooltipW ? y - tooltipH - 14 : y + 14,
        0,
        displayHeight - tooltipH,
      );

      setTooltip({
        type: hit.type,
        label: hit.label,
        details: hit.details,
        x: tx,
        y: ty,
      });
    },
    [hitTest, displayWidth, displayHeight, clampPan],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const wasDragging = dragRef.current;
      const dist = dragDistRef.current;
      stopDragging(e.pointerId, e.currentTarget as HTMLCanvasElement);

      if (wasDragging && dist < 5) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const hit = hitTest(x, y);

        if (hit) {
          setSelectedEntity({
            type: hit.type,
            id: hit.entityId,
            label: hit.label,
            details: hit.details,
            worldX: hit.worldX,
            worldY: hit.worldY,
          });
        } else {
          setSelectedEntity(null);
        }
      }
    },
    [stopDragging, hitTest],
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      setTooltip(null);
      setHoveredEntityId(null);
      if (dragRef.current) {
        stopDragging(e.pointerId, e.currentTarget as HTMLCanvasElement);
      }
    },
    [stopDragging],
  );

  // ---- Touch: pinch-to-zoom ----
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        pinchRef.current = {
          initialDistance: dist,
          initialZoom: zoomRef.current,
          centerX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          centerY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
      }
    },
    [],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const scale = dist / pinchRef.current.initialDistance;
        const newZoom = clamp(
          pinchRef.current.initialZoom * scale,
          MIN_ZOOM,
          MAX_ZOOM,
        );

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const pcx = pinchRef.current.centerX - rect.left;
        const pcy = pinchRef.current.centerY - rect.top;
        const cx = displayWidth / 2;
        const cy = displayHeight / 2;
        const ratio = newZoom / zoomRef.current;

        panRef.current = clampPan(
          {
            x: pcx - cx - (pcx - cx - panRef.current.x) * ratio,
            y: pcy - cy - (pcy - cy - panRef.current.y) * ratio,
          },
          newZoom,
        );

        zoomRef.current = newZoom;
        setZoomLevel(newZoom);
      }
    },
    [displayWidth, displayHeight, clampPan],
  );

  const handleTouchEnd = useCallback(() => {
    pinchRef.current = null;
  }, []);

  // ---- Keyboard navigation ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      let handled = true;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          if (zoomRef.current > 1)
            panRef.current = clampPan(
              { x: panRef.current.x, y: panRef.current.y + PAN_KEYBOARD_STEP },
              zoomRef.current,
            );
          break;
        case "ArrowDown":
        case "s":
          if (zoomRef.current > 1)
            panRef.current = clampPan(
              { x: panRef.current.x, y: panRef.current.y - PAN_KEYBOARD_STEP },
              zoomRef.current,
            );
          break;
        case "ArrowLeft":
        case "a":
          if (zoomRef.current > 1)
            panRef.current = clampPan(
              { x: panRef.current.x + PAN_KEYBOARD_STEP, y: panRef.current.y },
              zoomRef.current,
            );
          break;
        case "ArrowRight":
        case "d":
          if (zoomRef.current > 1)
            panRef.current = clampPan(
              { x: panRef.current.x - PAN_KEYBOARD_STEP, y: panRef.current.y },
              zoomRef.current,
            );
          break;
        case "+":
        case "=":
          zoomAt(
            (canvasRef.current?.getBoundingClientRect()?.left ?? 0) +
              displayWidth / 2,
            (canvasRef.current?.getBoundingClientRect()?.top ?? 0) +
              displayHeight / 2,
            ZOOM_BUTTON_FACTOR,
            true,
          );
          break;
        case "-":
        case "_":
          zoomAt(
            (canvasRef.current?.getBoundingClientRect()?.left ?? 0) +
              displayWidth / 2,
            (canvasRef.current?.getBoundingClientRect()?.top ?? 0) +
              displayHeight / 2,
            1 / ZOOM_BUTTON_FACTOR,
            true,
          );
          break;
        case "Escape":
          setSelectedEntity(null);
          break;
        case "Home":
          centerOnWorld(playerX, playerY, 2);
          break;
        default:
          handled = false;
      }
      if (handled) e.preventDefault();
    },
    [
      zoomAt,
      displayWidth,
      displayHeight,
      centerOnWorld,
      playerX,
      playerY,
      clampPan,
    ],
  );

  // ---- Double-click to zoom in ----
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, 2, true);
    },
    [zoomAt],
  );

  // ---- Toolbar actions ----
  const resetView = useCallback(() => {
    zoomAnimRef.current = {
      startZoom: zoomRef.current,
      endZoom: 1,
      startPan: { ...panRef.current },
      endPan: { x: 0, y: 0 },
      startTime: performance.now(),
      duration: 300,
    };
  }, []);

  const zoomIn = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      ZOOM_BUTTON_FACTOR,
      true,
    );
  }, [zoomAt]);

  const zoomOut = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAt(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      1 / ZOOM_BUTTON_FACTOR,
      true,
    );
  }, [zoomAt]);

  const goToPlayer = useCallback(() => {
    centerOnWorld(playerX, playerY, Math.max(zoomRef.current, 2));
  }, [centerOnWorld, playerX, playerY]);

  const goToSelected = useCallback(() => {
    if (!selectedEntity) return;
    centerOnWorld(
      selectedEntity.worldX,
      selectedEntity.worldY,
      Math.max(zoomRef.current, 2.5),
    );
  }, [centerOnWorld, selectedEntity]);

  // Prevent default on wheel at the DOM level
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e: WheelEvent) => e.preventDefault();
    canvas.addEventListener("wheel", handler, { passive: false });
    return () => canvas.removeEventListener("wheel", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-[#070b14]"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block touch-none outline-none w-full h-full"
        tabIndex={0}
        role="img"
        aria-label="Interactive game map"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: displayWidth || "100%",
          height: displayHeight || "100%",
          cursor: isDragging
            ? "grabbing"
            : zoomLevel > 1
              ? hoveredEntityId
                ? "pointer"
                : "grab"
              : hoveredEntityId
                ? "pointer"
                : "default",
        }}
      />

      {/* Hover tooltip */}
      {tooltip && !isDragging && (
        <div
          className="pointer-events-none absolute z-20 min-w-48 max-w-64 rounded-lg border border-white/20 bg-slate-950/95 px-3 py-2 shadow-2xl backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-150"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
              {tooltip.type}
            </span>
            {tooltip.type === "self" && (
              <span className="inline-block size-2 rounded-full bg-white shadow-[0_0_6px_white]" />
            )}
            {tooltip.type === "player" && (
              <span className="inline-block size-2 rounded-full bg-teal-300 shadow-[0_0_6px_rgba(45,212,191,0.8)]" />
            )}
          </div>
          <div className="text-sm font-semibold text-white">
            {tooltip.label}
          </div>
          <div className="mt-1 space-y-0.5">
            {tooltip.details.map((row) => (
              <div
                key={`${tooltip.label}-${row.key}`}
                className="text-xs text-white/80"
              >
                <span className="text-white/55">{row.key}:</span> {row.value}
              </div>
            ))}
          </div>
          <div className="mt-1.5 text-[10px] text-white/30">
            Click to select
          </div>
        </div>
      )}

      {/* Selected entity panel */}
      {selectedEntity && (
        <div className="absolute left-3 top-3 z-20 w-56 rounded-xl border border-white/10 bg-slate-950/90 shadow-2xl backdrop-blur-sm animate-in slide-in-from-left-2 fade-in-0 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <div className="flex items-center gap-2">
              <div
                className={`size-2 rounded-full ${
                  selectedEntity.type === "self"
                    ? "bg-white shadow-[0_0_6px_white]"
                    : selectedEntity.type === "player"
                      ? "bg-teal-300 shadow-[0_0_6px_rgba(45,212,191,0.8)]"
                      : "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]"
                }`}
              />
              <span className="text-xs font-semibold text-white/80">
                {selectedEntity.label}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEntity(null)}
              className="text-white/30 hover:text-white/70 text-xs transition-colors p-1"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="px-3 py-2 space-y-1">
            {selectedEntity.details.map((row) => (
              <div
                key={`sel-${row.key}`}
                className="text-[11px] text-white/70 flex justify-between"
              >
                <span className="text-white/40">{row.key}</span>
                <span className="font-medium">{row.value}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={goToSelected}
              className="mt-2 w-full rounded-lg bg-white/5 px-2 py-1.5 text-[11px] font-medium text-white/60 hover:bg-white/10 hover:text-white/80 transition-all border border-white/10"
            >
              Center on Map
            </button>
          </div>
        </div>
      )}

      {/* Minimalistic controls — bottom-right */}
      <div className="absolute right-3 bottom-3 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={goToPlayer}
          className="h-8 w-8 rounded-lg bg-black/50 border border-white/10 text-white/60 hover:text-white hover:bg-black/70 transition-all backdrop-blur-sm flex items-center justify-center"
          aria-label="Center on player"
          title="Find me"
        >
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx={12} cy={12} r={3} />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>

        <div className="flex items-center rounded-lg bg-black/50 border border-white/10 backdrop-blur-sm overflow-hidden">
          <button
            type="button"
            onClick={zoomOut}
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center text-sm font-bold"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetView}
            className="h-8 px-2 text-[10px] font-mono text-white/50 hover:text-white/80 hover:bg-white/5 transition-all tabular-nums border-x border-white/10"
            aria-label="Reset zoom"
            title="Reset view"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center text-sm font-bold"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
