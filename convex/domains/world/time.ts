// convex/domains/world/time.ts
import { query } from "../../_generated/server";
import {
  getGameHour,
  getTimePhase,
  formatGameTime,
  TIME_PHASES,
  GAME_DAY_DURATION_MS,
} from "../../config/timeConstants";

/**
 * Returns the current server game time.
 * All clients query this to stay in sync.
 */
export const getGameTime = query({
  args: {},
  handler: async () => {
    const now = Date.now();
    const gameHour = getGameHour(now);
    const phase = getTimePhase(gameHour);

    return {
      gameHour,
      phase,
      phaseLabel: TIME_PHASES[phase].label,
      formatted: formatGameTime(gameHour),
      serverTimestamp: now,
      dayDurationMs: GAME_DAY_DURATION_MS,
    };
  },
});
