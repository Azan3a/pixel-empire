// convex/utils.ts

/**
 * ── Seeded random for deterministic generation ──
 * Used to ensure the city layout and features remain consistent
 * across server restarts and client renders.
 */
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}
