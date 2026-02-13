// app/(protected)/game/shared/utils/error-handling.ts

export function getUserFacingErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : fallback;

  if (!raw) return fallback;

  const uncaughtMatch = raw.match(
    /Uncaught\s+(?:Error|ConvexError):\s*([^\n]+)/i,
  );
  if (uncaughtMatch?.[1]) {
    return uncaughtMatch[1].trim();
  }

  let cleaned = raw
    .replace(/\[CONVEX[^\]]*\]/gi, "")
    .replace(/\[Request ID:[^\]]*\]/gi, "")
    .replace(/^Server Error\s*/i, "")
    .trim();

  cleaned = cleaned
    .split("\nCalled by client")[0]
    .split("\nat handler")[0]
    .trim();

  if (!cleaned) return fallback;
  return cleaned;
}
