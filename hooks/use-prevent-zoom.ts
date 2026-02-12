"use client";

import { useEffect } from "react";

export function usePreventZoom() {
  useEffect(() => {
    // ── Viewport meta ──
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

    // ── Keyboard zoom ──
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

    // ── Wheel zoom ──
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    // ── Gesture zoom (Safari) ──
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    // ── Counter-scale: undo menu / unblockable zoom ──
    const counterZoom = () => {
      // devicePixelRatio changes with browser zoom on desktop browsers.
      // Compare to baseline to derive the zoom factor.
      const zoomLevel = Math.round(window.devicePixelRatio * 100) / 100;

      // Assume baseline DPR was captured once (or is 1 on non-HiDPI).
      // You can snapshot it on first load instead:
      if (zoomLevel !== baselineDpr) {
        const scale = baselineDpr / zoomLevel;
        document.documentElement.style.transform = `scale(${scale})`;
        document.documentElement.style.transformOrigin = "0 0";
        document.documentElement.style.width = `${100 / scale}%`;
        document.documentElement.style.height = `${100 / scale}%`;
      } else {
        document.documentElement.style.transform = "";
        document.documentElement.style.transformOrigin = "";
        document.documentElement.style.width = "";
        document.documentElement.style.height = "";
      }
    };

    // Snapshot the "normal" devicePixelRatio at mount time.
    const baselineDpr = Math.round(window.devicePixelRatio * 100) / 100;

    // visualViewport 'resize' fires on zoom changes (including menu zoom).
    window.visualViewport?.addEventListener("resize", counterZoom);
    // Fallback for browsers that don't fire visualViewport resize:
    window.addEventListener("resize", counterZoom);

    const nonPassiveCapture: AddEventListenerOptions = {
      passive: false,
      capture: true,
    };

    window.addEventListener("wheel", handleWheel, nonPassiveCapture);
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("gesturestart", handleGesture, nonPassiveCapture);
    window.addEventListener("gesturechange", handleGesture, nonPassiveCapture);

    return () => {
      // Restore viewport meta
      if (existingViewportMeta) {
        if (previousViewportContent === null) {
          existingViewportMeta.removeAttribute("content");
        } else {
          existingViewportMeta.setAttribute("content", previousViewportContent);
        }
      } else {
        viewportMeta?.remove();
      }

      // Remove counter-scale styles
      document.documentElement.style.transform = "";
      document.documentElement.style.transformOrigin = "";
      document.documentElement.style.width = "";
      document.documentElement.style.height = "";

      window.visualViewport?.removeEventListener("resize", counterZoom);
      window.removeEventListener("resize", counterZoom);
      window.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("gesturestart", handleGesture, true);
      window.removeEventListener("gesturechange", handleGesture, true);
    };
  }, []);
}
