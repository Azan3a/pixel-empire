// convex/domains/jobs/generation.ts

import { type MutationCtx } from "../../_generated/server";
import { ROAD_SPACING, MAP_SIZE, HALF_CORRIDOR } from "../../gameConstants";
import { getZoneAt, WATER_LINE_Y } from "../../mapZones";
import { dist } from "../../shared/math";
import { getLandmarkName, getJobTitle, hashCoord } from "./naming";

/** All road intersection centers (safe spawn points on roads) */
export function getIntersections(): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let x = ROAD_SPACING; x < MAP_SIZE; x += ROAD_SPACING) {
    for (let y = ROAD_SPACING; y < MAP_SIZE; y += ROAD_SPACING) {
      if (y > WATER_LINE_Y) continue;
      points.push({ x, y });
    }
  }
  return points;
}

/** Points along road edges (sidewalk locations) for variety */
export function getRoadPoints(): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  for (let ry = ROAD_SPACING; ry < MAP_SIZE; ry += ROAD_SPACING) {
    if (ry > WATER_LINE_Y) continue;
    for (let px = 80; px < MAP_SIZE; px += 120) {
      points.push({ x: px, y: ry + HALF_CORRIDOR + 8 });
      points.push({ x: px, y: ry - HALF_CORRIDOR - 8 });
    }
  }

  for (let rx = ROAD_SPACING; rx < MAP_SIZE; rx += ROAD_SPACING) {
    for (let py = 80; py < MAP_SIZE; py += 120) {
      if (py > WATER_LINE_Y) continue;
      points.push({ x: rx + HALF_CORRIDOR + 8, y: py });
      points.push({ x: rx - HALF_CORRIDOR - 8, y: py });
    }
  }

  points.push(...getIntersections());
  return points;
}

export async function spawnJobsInternalLogic(ctx: MutationCtx) {
  const available = await ctx.db
    .query("jobs")
    .withIndex("by_status", (q) => q.eq("status", "available"))
    .take(20);

  if (available.length >= 10) return;

  const roadPoints = getRoadPoints();
  const toSpawn = 12 - available.length;

  for (let i = 0; i < toSpawn; i++) {
    const pickupIdx = Math.floor(Math.random() * roadPoints.length);
    let dropoffIdx = Math.floor(Math.random() * roadPoints.length);

    let attempts = 0;
    while (
      (dropoffIdx === pickupIdx ||
        dist(
          roadPoints[pickupIdx].x,
          roadPoints[pickupIdx].y,
          roadPoints[dropoffIdx].x,
          roadPoints[dropoffIdx].y,
        ) < 300) &&
      attempts < 30
    ) {
      dropoffIdx = Math.floor(Math.random() * roadPoints.length);
      attempts++;
    }

    const pickup = roadPoints[pickupIdx];
    const dropoff = roadPoints[dropoffIdx];

    const distance = dist(pickup.x, pickup.y, dropoff.x, dropoff.y);
    const baseReward = 30 + Math.round(distance * 0.12);

    const pickupZone = getZoneAt(pickup.x, pickup.y);
    const dropoffZone = getZoneAt(dropoff.x, dropoff.y);
    const crossZoneBonus = pickupZone !== dropoffZone ? 20 : 0;

    const variance = Math.floor(Math.random() * 30) - 10;
    const reward = Math.max(25, baseReward + crossZoneBonus + variance);

    const seed = hashCoord(pickup.x, pickup.y, i + Date.now());

    await ctx.db.insert("jobs", {
      type: "delivery",
      status: "available",
      playerId: undefined,
      reward,
      pickupX: pickup.x,
      pickupY: pickup.y,
      dropoffX: dropoff.x,
      dropoffY: dropoff.y,
      pickupName: getLandmarkName(pickup.x, pickup.y),
      dropoffName: getLandmarkName(dropoff.x, dropoff.y),
      title: getJobTitle(seed, pickup.x, pickup.y),
      acceptedAt: undefined,
      pickedUpAt: undefined,
      completedAt: undefined,
    });
  }
}
