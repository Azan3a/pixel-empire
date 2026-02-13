// app/(protected)/game/features/world/canvas/use-viewport.ts
"use client";

import { useEffect, useState, useMemo } from "react";
import type { GameTimeState } from "@game/features/world/hooks/use-game-time";

function getSafeDimension(value: number, fallback: number) {
  if (Number.isFinite(value) && value > 0) return Math.round(value);
  return fallback;
}

export function useViewport(
  containerRef: React.RefObject<HTMLDivElement | null>,
  ambient: GameTimeState["ambient"],
) {
  const [viewport, setViewport] = useState({
    width:
      typeof window !== "undefined"
        ? getSafeDimension(window.innerWidth, 800)
        : 800,
    height:
      typeof window !== "undefined"
        ? getSafeDimension(window.innerHeight, 600)
        : 600,
  });

  useEffect(() => {
    const current = containerRef.current;
    if (!current) return;

    const updateFromElement = () => {
      setViewport((prev) => ({
        width: getSafeDimension(
          current.clientWidth,
          getSafeDimension(window.innerWidth, prev.width),
        ),
        height: getSafeDimension(
          current.clientHeight,
          getSafeDimension(window.innerHeight, prev.height),
        ),
      }));
    };

    updateFromElement();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewport((prev) => ({
          width: getSafeDimension(
            entry.contentRect.width,
            getSafeDimension(current.clientWidth, prev.width),
          ),
          height: getSafeDimension(
            entry.contentRect.height,
            getSafeDimension(current.clientHeight, prev.height),
          ),
        }));
      }
    });

    observer.observe(current);
    window.addEventListener("resize", updateFromElement);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateFromElement);
    };
  }, [containerRef]);

  const { tintR, tintG, tintB } = ambient;

  const bgColor = useMemo(() => {
    const bgR = Math.round(0x2c * tintR);
    const bgG = Math.round(0x2c * tintG);
    const bgB = Math.round(0x2c * tintB);
    return (bgR << 16) | (bgG << 8) | bgB;
  }, [tintR, tintG, tintB]);

  const bgHex = useMemo(
    () => `#${bgColor.toString(16).padStart(6, "0")}`,
    [bgColor],
  );

  return { ...viewport, bgColor, bgHex };
}
