// app/(protected)/game/features/world/renderers/map-constants.ts

export const CATEGORY_COLORS: Record<
  string,
  { owned: string; unowned: string }
> = {
  residential: { owned: "#f97316", unowned: "rgba(249,115,22,0.5)" },
  commercial: { owned: "#3b82f6", unowned: "rgba(59,130,246,0.5)" },
  shop: { owned: "#a855f7", unowned: "rgba(168,85,247,0.5)" },
  service: { owned: "#d4a017", unowned: "#d4a01780" },
};

export const COLORS = {
  beach: { start: "#d4b483", end: "#f0e4c8" },
  boardwalk: "#8b6b4a",
  boardwalkLines: "#6b4a2a",
  ocean: "#1a6b8a",
  waves: "#2a8aaa",
  asphalt: "#555555",
  parkPath: "#bc9c63",
  pond: "rgba(58, 138, 170, 0.5)",
  player: "#ffffff",
  otherPlayer: "#f87171",
};
