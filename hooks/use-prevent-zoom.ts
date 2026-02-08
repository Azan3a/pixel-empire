"use client";

import { useEffect } from "react";

export function usePreventZoom() {
  useEffect(() => {
    // Add viewport meta tag to disable pinch/double-tap zoom on mobile
    const viewportMeta = document.createElement("meta");
    viewportMeta.name = "viewport";
    viewportMeta.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no";
    document.head.appendChild(viewportMeta);

    // Prevent Ctrl+wheel zoom
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Prevent Ctrl/Cmd + +/-/= or 0 keyboard zoom
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "0")
      ) {
        e.preventDefault();
      }
    };

    // { passive: false } is required for preventDefault() to work on wheel
    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.head.removeChild(viewportMeta);
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
