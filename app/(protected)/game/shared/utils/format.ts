// app/(protected)/game/shared/utils/format.ts

/** Format distance for the larger 4000px map */
export function formatDistance(d: number): string {
  if (d >= 1000) {
    return `${(d / 1000).toFixed(1)}k`;
  }
  return `${Math.round(d)}`;
}
