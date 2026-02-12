"use client";

import { useEffect } from "react";

export function usePreventZoom() {
  useEffect(() => {
    // Ensure viewport disallows browser zoom where supported.
    const viewportContent =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no";
    const existingViewportMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]',
    );

    let viewportMeta = existingViewportMeta;
    const previousViewportContent = existingViewportMeta
      ? existingViewportMeta.getAttribute("content")
      : null;

    if (viewportMeta) {
      viewportMeta.setAttribute("content", viewportContent);
    } else {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      viewportMeta.content = viewportContent;
      document.head.appendChild(viewportMeta);
    }

    // Prevent Ctrl+wheel zoom
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    // Prevent Ctrl/Cmd + +/-/= or 0 keyboard zoom
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZoomKey =
        e.key === "+" ||
        e.key === "=" ||
        e.key === "-" ||
        e.key === "_" ||
        e.key === "0" ||
        e.key === "Add" ||
        e.key === "Subtract" ||
        e.code === "NumpadAdd" ||
        e.code === "NumpadSubtract" ||
        e.code === "Numpad0";

      if ((e.ctrlKey || e.metaKey) && isZoomKey) {
        e.preventDefault();
      }
    };

    // Prevent trackpad pinch zoom (notably Safari gesture events)
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    // Capture phase + passive:false ensures preventDefault works before browser zoom handlers.
    const nonPassiveCapture: AddEventListenerOptions = {
      passive: false,
      capture: true,
    };

    window.addEventListener("wheel", handleWheel, nonPassiveCapture);
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("gesturestart", handleGesture, nonPassiveCapture);
    window.addEventListener("gesturechange", handleGesture, nonPassiveCapture);

    return () => {
      if (existingViewportMeta) {
        if (previousViewportContent === null) {
          existingViewportMeta.removeAttribute("content");
        } else {
          existingViewportMeta.setAttribute("content", previousViewportContent);
        }
      } else {
        viewportMeta?.remove();
      }

      window.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("gesturestart", handleGesture, true);
      window.removeEventListener("gesturechange", handleGesture, true);
    };
  }, []);
}
