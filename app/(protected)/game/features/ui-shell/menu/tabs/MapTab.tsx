"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Property } from "@game/types/property";
import { Job } from "@game/types/job";
import {
  MapRenderer,
  type MapPlayerPoint,
} from "@game/features/world/renderers/minimap/map-renderer";
import { Badge } from "@/components/ui/badge";

interface MapTabProps {
  playerX: number;
  playerY: number;
  properties: Property[];
  otherPlayers: MapPlayerPoint[];
  activeJob: Job | null;
}

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
  const pulseRef = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setSize(Math.max(0, Math.min(width, height - 60) - 10));
    };

    updateSize();
    const timer = setTimeout(updateSize, 100);
    window.addEventListener("resize", updateSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || size <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    }

    const renderer = new MapRenderer({
      ctx,
      size,
      playerX,
      playerY,
      properties,
      otherPlayers,
      activeJob,
      pulseValue: pulseRef.current,
    });

    renderer.draw({
      ctx,
      size,
      playerX,
      playerY,
      properties,
      otherPlayers,
      activeJob,
      pulseValue: pulseRef.current,
    });
  }, [size, playerX, playerY, properties, otherPlayers, activeJob]);

  useEffect(() => {
    const loop = () => {
      pulseRef.current += 1;
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-3xl border border-white/5 overflow-hidden">
      <div
        ref={containerRef}
        className="flex-1 min-h-0 p-4 flex items-center justify-center"
      >
        <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-black/20">
          <canvas ref={canvasRef} className="block cursor-crosshair" />
        </div>
      </div>

      <div className="p-4 bg-slate-900/60 border-t border-white/5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
            <div key={cat} className="flex items-center gap-2">
              <Badge variant="outline" className={CATEGORY_BADGE_COLORS[cat]}>
                {label}
              </Badge>
            </div>
          ))}
          <div className="flex items-center gap-2 ml-4">
            <div className="size-2 rounded-full bg-white shadow-[0_0_8px_white]" />
            <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
              You
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
