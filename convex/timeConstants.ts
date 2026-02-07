// convex/timeConstants.ts

// One full in-game day lasts 20 real-time minutes (1200 seconds)
export const GAME_DAY_DURATION_MS = 20 * 60 * 1000; // 20 minutes real time

// Time phases (in game hours, 0-24)
export const TIME_PHASES = {
  DAWN: { start: 5, end: 7, label: "Dawn" },
  MORNING: { start: 7, end: 12, label: "Morning" },
  AFTERNOON: { start: 12, end: 17, label: "Afternoon" },
  EVENING: { start: 17, end: 20, label: "Evening" },
  DUSK: { start: 20, end: 21, label: "Dusk" },
  NIGHT: { start: 21, end: 5, label: "Night" },
} as const;

export type TimePhase = keyof typeof TIME_PHASES;

// Server epoch — all clients sync to this
// Set to a fixed reference point so all players share the same time
export const TIME_EPOCH = 1700000000000; // Fixed reference timestamp

/**
 * Get current game hour (0–24) from real timestamp
 */
export function getGameHour(realTimestamp: number = Date.now()): number {
  const elapsed = realTimestamp - TIME_EPOCH;
  const dayProgress = (elapsed % GAME_DAY_DURATION_MS) / GAME_DAY_DURATION_MS;
  return dayProgress * 24;
}

/**
 * Get normalized day progress (0–1)
 */
export function getDayProgress(realTimestamp: number = Date.now()): number {
  const elapsed = realTimestamp - TIME_EPOCH;
  return (elapsed % GAME_DAY_DURATION_MS) / GAME_DAY_DURATION_MS;
}

/**
 * Get current time phase
 */
export function getTimePhase(gameHour: number): TimePhase {
  if (gameHour >= TIME_PHASES.DAWN.start && gameHour < TIME_PHASES.DAWN.end)
    return "DAWN";
  if (
    gameHour >= TIME_PHASES.MORNING.start &&
    gameHour < TIME_PHASES.MORNING.end
  )
    return "MORNING";
  if (
    gameHour >= TIME_PHASES.AFTERNOON.start &&
    gameHour < TIME_PHASES.AFTERNOON.end
  )
    return "AFTERNOON";
  if (
    gameHour >= TIME_PHASES.EVENING.start &&
    gameHour < TIME_PHASES.EVENING.end
  )
    return "EVENING";
  if (gameHour >= TIME_PHASES.DUSK.start && gameHour < TIME_PHASES.DUSK.end)
    return "DUSK";
  return "NIGHT";
}

/**
 * Get the ambient lighting properties for a given game hour.
 * Returns overlay color, alpha, and tint multipliers.
 */
export function getAmbientLighting(gameHour: number): {
  overlayColor: number;
  overlayAlpha: number;
  tintR: number;
  tintG: number;
  tintB: number;
  sunlightIntensity: number; // 0 = full dark, 1 = full bright
  streetLightAlpha: number;
} {
  // Normalize hour to 0-24
  const h = ((gameHour % 24) + 24) % 24;

  // Sunlight intensity curve — peaks at noon, zero at midnight
  let sunlightIntensity: number;
  if (h >= 6 && h <= 12) {
    // Dawn to noon: ramp up
    sunlightIntensity = (h - 6) / 6;
  } else if (h > 12 && h <= 20) {
    // Noon to dusk: ramp down
    sunlightIntensity = 1 - (h - 12) / 8;
  } else if (h > 20 || h < 5) {
    // Night
    sunlightIntensity = 0;
  } else {
    // 5-6: pre-dawn hint
    sunlightIntensity = (h - 5) * 0.05;
  }

  sunlightIntensity = Math.max(0, Math.min(1, sunlightIntensity));

  // Overlay color shifts through the day
  let overlayColor: number;
  let overlayAlpha: number;
  let tintR: number, tintG: number, tintB: number;

  if (h >= 5 && h < 6.5) {
    // Dawn — warm orange/pink tint
    const t = (h - 5) / 1.5;
    overlayColor = lerpColor(0x1a1040, 0xff8844, t);
    overlayAlpha = lerp(0.45, 0.15, t);
    tintR = lerp(0.6, 1.0, t);
    tintG = lerp(0.5, 0.85, t);
    tintB = lerp(0.7, 0.75, t);
  } else if (h >= 6.5 && h < 8) {
    // Early morning — golden hour
    const t = (h - 6.5) / 1.5;
    overlayColor = lerpColor(0xff8844, 0xffcc66, t);
    overlayAlpha = lerp(0.15, 0.05, t);
    tintR = lerp(1.0, 1.0, t);
    tintG = lerp(0.85, 0.95, t);
    tintB = lerp(0.75, 0.9, t);
  } else if (h >= 8 && h < 16) {
    // Daytime — clear
    overlayColor = 0xffffff;
    overlayAlpha = 0;
    tintR = 1.0;
    tintG = 1.0;
    tintB = 1.0;
  } else if (h >= 16 && h < 18) {
    // Late afternoon — warm
    const t = (h - 16) / 2;
    overlayColor = lerpColor(0xffffff, 0xff9955, t);
    overlayAlpha = lerp(0, 0.1, t);
    tintR = 1.0;
    tintG = lerp(1.0, 0.9, t);
    tintB = lerp(1.0, 0.8, t);
  } else if (h >= 18 && h < 20) {
    // Sunset
    const t = (h - 18) / 2;
    overlayColor = lerpColor(0xff9955, 0x553388, t);
    overlayAlpha = lerp(0.1, 0.35, t);
    tintR = lerp(1.0, 0.7, t);
    tintG = lerp(0.9, 0.55, t);
    tintB = lerp(0.8, 0.75, t);
  } else if (h >= 20 && h < 21.5) {
    // Dusk to night transition
    const t = (h - 20) / 1.5;
    overlayColor = lerpColor(0x553388, 0x0a0a2a, t);
    overlayAlpha = lerp(0.35, 0.55, t);
    tintR = lerp(0.7, 0.4, t);
    tintG = lerp(0.55, 0.35, t);
    tintB = lerp(0.75, 0.6, t);
  } else {
    // Night (21.5–5)
    overlayColor = 0x0a0a2a;
    overlayAlpha = 0.55;
    tintR = 0.4;
    tintG = 0.35;
    tintB = 0.6;
  }

  // Street lights: on when dark, off when bright
  const streetLightAlpha =
    sunlightIntensity < 0.3 ? lerp(0.8, 0, sunlightIntensity / 0.3) : 0;

  return {
    overlayColor,
    overlayAlpha,
    tintR,
    tintG,
    tintB,
    sunlightIntensity,
    streetLightAlpha,
  };
}

/** Lerp between two numbers */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/** Lerp between two hex colors */
function lerpColor(c1: number, c2: number, t: number): number {
  const r1 = (c1 >> 16) & 0xff,
    g1 = (c1 >> 8) & 0xff,
    b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff,
    g2 = (c2 >> 8) & 0xff,
    b2 = c2 & 0xff;
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return (r << 16) | (g << 8) | b;
}

/**
 * Format game hour to display string (e.g., "2:30 PM")
 */
export function formatGameTime(gameHour: number): string {
  const h = Math.floor(((gameHour % 24) + 24) % 24);
  const m = Math.floor((gameHour % 1) * 60);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}
