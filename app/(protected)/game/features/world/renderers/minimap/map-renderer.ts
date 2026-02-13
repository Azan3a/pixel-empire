// app/(protected)/game/features/world/renderers/map-renderer.ts

import { Property } from "@game/types/property";
import { Job } from "@game/types/job";
import {
  MAP_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
  ZONES,
  ZONE_VISUALS,
  WATER_LINE_Y,
  BOARDWALK_Y,
  BOARDWALK_HEIGHT,
  getZoneAt,
} from "@game/shared/contracts/game-config";
import { hexToStr } from "@/lib/utils";
import { COLORS, CATEGORY_COLORS } from "./map-constants";

export interface MapPlayerPoint {
  _id: string;
  x: number;
  y: number;
  name?: string;
}

export interface MapRendererOptions {
  ctx: CanvasRenderingContext2D;
  size: number;
  playerX: number;
  playerY: number;
  properties: Property[];
  otherPlayers: MapPlayerPoint[];
  activeJob: Job | null;
  pulseValue?: number;
}

export class MapRenderer {
  private ctx: CanvasRenderingContext2D;
  private size: number;
  private scale: number;
  private fullSW: number;

  constructor(options: MapRendererOptions) {
    this.ctx = options.ctx;
    this.size = options.size;
    this.scale = options.size / MAP_SIZE;
    this.fullSW = ROAD_WIDTH / 2 + SIDEWALK_W;
  }

  draw(options: MapRendererOptions) {
    this.ctx.clearRect(0, 0, this.size, this.size);

    this.drawTerrain();
    this.drawRoads();
    this.drawProperties(options.properties);
    this.drawJobs(options.activeJob, options.pulseValue || 0);
    this.drawPlayers(options.playerX, options.playerY, options.otherPlayers);
  }

  private drawTerrain() {
    const { ctx, size, scale } = this;

    // Zone-colored background
    const zoneBlockPx = 20;
    for (let bx = 0; bx < size; bx += zoneBlockPx) {
      for (let by = 0; by < size; by += zoneBlockPx) {
        const worldX = (bx + zoneBlockPx / 2) / scale;
        const worldY = (by + zoneBlockPx / 2) / scale;
        const zoneId = getZoneAt(worldX, worldY);
        const vis = ZONE_VISUALS[zoneId];
        ctx.fillStyle = hexToStr(vis.grassColor);
        ctx.fillRect(bx, by, zoneBlockPx, zoneBlockPx);
      }
    }

    // Beach sand
    const beachBounds = ZONES.beach.bounds;
    const waterLinePx = WATER_LINE_Y * scale;
    const sandTopPx = beachBounds.y1 * scale;
    const sandGradient = ctx.createLinearGradient(0, sandTopPx, 0, waterLinePx);
    sandGradient.addColorStop(0, COLORS.beach.start);
    sandGradient.addColorStop(1, COLORS.beach.end);
    ctx.fillStyle = sandGradient;
    ctx.fillRect(0, sandTopPx, size, waterLinePx - sandTopPx);

    // Boardwalk
    const bwTopPx = (BOARDWALK_Y - BOARDWALK_HEIGHT / 2) * scale;
    const bwHPx = BOARDWALK_HEIGHT * scale;
    ctx.fillStyle = COLORS.boardwalk;
    ctx.fillRect(0, bwTopPx, size, bwHPx);

    // Ocean
    ctx.fillStyle = COLORS.ocean;
    ctx.fillRect(0, waterLinePx, size, size - waterLinePx);

    // Park Ponds
    const parkBounds = ZONES.park.bounds;
    const parkCX = (parkBounds.x1 + parkBounds.x2) / 2;
    const parkCY = (parkBounds.y1 + parkBounds.y2) / 2;
    this.drawPond(parkCX + 420, parkCY - 100, 110, 70);
    this.drawPond(parkCX - 380, parkCY + 280, 90, 60);
  }

  private drawPond(px: number, py: number, rw: number, rh: number) {
    const { ctx, scale } = this;
    ctx.beginPath();
    ctx.ellipse(
      px * scale,
      py * scale,
      rw * scale,
      rh * scale,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = COLORS.pond;
    ctx.fill();
  }

  private drawRoads() {
    const { ctx, fullSW } = this;
    ctx.fillStyle = COLORS.asphalt;

    // Horizontal Roads
    for (let ry = ROAD_SPACING; ry < MAP_SIZE; ry += ROAD_SPACING) {
      if (ry - fullSW > WATER_LINE_Y) continue;
      this.drawRoadSegment(0, ry, MAP_SIZE, true);
    }

    // Vertical Roads
    for (let rx = ROAD_SPACING; rx < MAP_SIZE; rx += ROAD_SPACING) {
      this.drawRoadSegment(rx, 0, WATER_LINE_Y, false);
    }
  }

  private drawRoadSegment(
    coord: number,
    fixed: number,
    length: number,
    isHorizontal: boolean,
  ) {
    const { ctx, scale, fullSW } = this;
    if (isHorizontal) {
      ctx.fillRect(
        coord * scale,
        (fixed - fullSW) * scale,
        length * scale,
        (ROAD_WIDTH + SIDEWALK_W * 2) * scale,
      );
    } else {
      ctx.fillRect(
        (coord - fullSW) * scale,
        fixed * scale,
        (ROAD_WIDTH + SIDEWALK_W * 2) * scale,
        length * scale,
      );
    }
  }

  private drawProperties(properties: Property[]) {
    const { ctx, scale } = this;
    properties.forEach((p) => {
      const colors = CATEGORY_COLORS[p.category] || CATEGORY_COLORS.residential;
      ctx.fillStyle = p.isOwned ? colors.owned : colors.unowned;

      const px = p.x * scale;
      const py = p.y * scale;
      const pw = Math.max(2, p.width * scale);
      const ph = Math.max(2, p.height * scale);

      ctx.fillRect(px, py, pw, ph);

      ctx.strokeStyle = "#00000040";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, py, pw, ph);
    });
  }

  private drawJobs(activeJob: Job | null, pulseValue: number) {
    if (!activeJob) return;
    const { scale } = this;
    const pulse = 1 + Math.sin(pulseValue * 0.1) * 0.2;

    if (activeJob.status === "accepted") {
      this.drawMarker(
        activeJob.pickupX * scale,
        activeJob.pickupY * scale,
        "#3b82f6",
        pulse,
      );
    } else if (activeJob.status === "picked_up") {
      this.drawMarker(
        activeJob.dropoffX * scale,
        activeJob.dropoffY * scale,
        "#f97316",
        pulse,
      );
    }
  }

  private drawMarker(x: number, y: number, color: string, pulse: number) {
    const { ctx, scale } = this;
    ctx.beginPath();
    ctx.arc(x, y, 6 * scale * pulse, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawPlayers(
    playerX: number,
    playerY: number,
    otherPlayers: MapPlayerPoint[],
  ) {
    const { ctx, scale } = this;
    const otherPlayerRadius = Math.max(1.75, 3 * scale);
    const localPlayerRadius = Math.max(2.5, 5 * scale);

    // Other players
    ctx.fillStyle = COLORS.otherPlayer;
    otherPlayers.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x * scale, p.y * scale, otherPlayerRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Current player
    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.arc(
      playerX * scale,
      playerY * scale,
      localPlayerRadius,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}
