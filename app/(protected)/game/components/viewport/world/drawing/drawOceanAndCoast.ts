// components/game/viewport/world/drawing/drawOceanAndCoast.ts
// Draws ocean outside the island coastline, beach sand, boardwalk,
// lake, river, and bridges.

import { Graphics } from "pixi.js";
import { MAP_SIZE } from "@/convex/map/constants";
import {
  COASTLINE_POLYGON,
  SMALL_ISLAND_POLYGON,
  type Point,
} from "@/convex/map/islands";
import { RIVER, LAKE, BRIDGES } from "@/convex/map/water";
import { ZONES, ZONE_VISUALS } from "@/convex/map/zones";
import type { TintFn } from "../utils/tintFactory";

// ── Ocean fill ──

/**
 * Fill the entire map with ocean, then cut out the island shapes.
 * PixiJS draws additive fills, so we draw the ocean rect and then
 * overlay the island interiors on top during drawZoneTerrain.
 * Here we only draw the ocean background + coastline shore effects.
 */
function drawOcean(g: Graphics, t: TintFn): void {
  // Full ocean background
  g.rect(0, 0, MAP_SIZE, MAP_SIZE);
  g.fill({ color: t(0x1a6b8a), alpha: 1 });

  // Subtle deep-water tint in outer 400px band
  g.rect(0, 0, MAP_SIZE, MAP_SIZE);
  g.fill({ color: t(0x0e4a6a), alpha: 0.25 });
}

// ── Coastline shore foam ──

function drawShore(g: Graphics, t: TintFn, polygon: Point[]): void {
  const n = polygon.length;

  // Outer foam ring (wide, faint)
  g.setStrokeStyle({ color: t(0xddeeff), width: 12, alpha: 0.12 });
  g.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < n; i++) g.lineTo(polygon[i].x, polygon[i].y);
  g.closePath();
  g.stroke();

  // Inner foam ring (narrow, brighter)
  g.setStrokeStyle({ color: t(0xeef8ff), width: 5, alpha: 0.18 });
  g.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < n; i++) g.lineTo(polygon[i].x, polygon[i].y);
  g.closePath();
  g.stroke();
}

// ── Beach sand fill ──

function drawBeachSand(g: Graphics, t: TintFn): void {
  const b = ZONES.beach.bounds;
  const vis = ZONE_VISUALS.beach;

  // Sand base
  g.rect(b.x1, b.y1, b.x2 - b.x1, b.y2 - b.y1);
  g.fill({ color: t(vis.grassColor), alpha: 0.8 });

  // Lighter sand near water edge (bottom third)
  const thirdH = (b.y2 - b.y1) / 3;
  g.rect(b.x1, b.y2 - thirdH, b.x2 - b.x1, thirdH);
  g.fill({ color: t(0xf0e4c8), alpha: 0.3 });
}

// ── Boardwalk plank strip ──

function drawBoardwalk(g: Graphics, t: TintFn): void {
  const b = ZONES.boardwalk.bounds;
  const bw = b.x2 - b.x1;
  const bh = b.y2 - b.y1;

  // Wood base
  g.rect(b.x1, b.y1, bw, bh);
  g.fill({ color: t(0x8b6b4a), alpha: 0.85 });

  // Plank lines (vertical grain)
  g.setStrokeStyle({ color: t(0x6b4a2a), width: 1, alpha: 0.2 });
  for (let px = b.x1; px < b.x2; px += 24) {
    g.moveTo(px, b.y1);
    g.lineTo(px, b.y2);
  }
  g.stroke();

  // Top/bottom edge highlights
  g.setStrokeStyle({ color: t(0xaaa080), width: 1.5, alpha: 0.15 });
  g.moveTo(b.x1, b.y1);
  g.lineTo(b.x2, b.y1);
  g.moveTo(b.x1, b.y2);
  g.lineTo(b.x2, b.y2);
  g.stroke();
}

// ── Lake ──

function drawLake(g: Graphics, t: TintFn): void {
  const pts = LAKE.points;
  if (pts.length < 3) return;

  // Lake fill
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.closePath();
  g.fill({ color: t(0x2a7a9a), alpha: 0.85 });

  // Shore edge
  g.setStrokeStyle({ color: t(0x6bc0d0), width: 4, alpha: 0.2 });
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.closePath();
  g.stroke();
}

// ── River ──

function drawRiver(g: Graphics, t: TintFn): void {
  const pts = RIVER.points;
  if (pts.length < 2) return;

  // River body — wide, semi-transparent
  g.setStrokeStyle({ color: t(0x2a7a9a), width: RIVER.width, alpha: 0.8 });
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.stroke();

  // River banks
  g.setStrokeStyle({ color: t(0x5baa80), width: RIVER.width + 8, alpha: 0.15 });
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.stroke();
}

// ── Bridges ──

function drawBridges(g: Graphics, t: TintFn): void {
  for (const br of BRIDGES) {
    const hw = br.width / 2;
    const hh = br.height / 2;

    // Bridge deck
    const deckColor = br.style === "wood" ? 0x8b6b4a : 0x888888;
    g.rect(br.x - hw, br.y - hh, br.width, br.height);
    g.fill({ color: t(deckColor), alpha: 0.9 });

    // Railings
    const railColor = br.style === "wood" ? 0x6b4a2a : 0x666666;
    g.setStrokeStyle({ color: t(railColor), width: 2, alpha: 0.6 });
    g.moveTo(br.x - hw, br.y - hh);
    g.lineTo(br.x + hw, br.y - hh);
    g.moveTo(br.x - hw, br.y + hh);
    g.lineTo(br.x + hw, br.y + hh);
    g.stroke();

    // Plank lines for wood bridges
    if (br.style === "wood") {
      g.setStrokeStyle({ color: t(0x5a3a1a), width: 1, alpha: 0.2 });
      for (let px = br.x - hw + 6; px < br.x + hw; px += 8) {
        g.moveTo(px, br.y - hh);
        g.lineTo(px, br.y + hh);
      }
      g.stroke();
    }
  }
}

// ── Main exports ──

/**
 * Draw ocean background and coastline shore foam.
 * Called BEFORE drawZoneTerrain so ocean is the background layer
 * that zone terrain paints over for land areas.
 */
export function drawOceanAndCoast(g: Graphics, t: TintFn): void {
  drawOcean(g, t);
  drawShore(g, t, COASTLINE_POLYGON);
  drawShore(g, t, SMALL_ISLAND_POLYGON);
  drawBeachSand(g, t);
  drawBoardwalk(g, t);
}

/**
 * Draw inland water features: lake, river, and bridges.
 * Called AFTER drawZoneTerrain so water renders on top of terrain.
 */
export function drawWaterFeatures(g: Graphics, t: TintFn): void {
  drawLake(g, t);
  drawRiver(g, t);
  drawBridges(g, t);
}
