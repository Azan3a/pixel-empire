import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import convexPlugin from "@convex-dev/eslint-plugin";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...convexPlugin.configs.recommended,
  {
    files: ["app/(protected)/game/**/*.{ts,tsx}"],
    ignores: ["app/(protected)/game/shared/contracts/game-config.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/convex/gameConstants",
              message:
                "Import from @game/shared/contracts/game-config instead of raw Convex config.",
            },
            {
              name: "@/convex/mapZones",
              message:
                "Import from @game/shared/contracts/game-config instead of raw Convex config.",
            },
            {
              name: "@/convex/treeConfig",
              message:
                "Import from @game/shared/contracts/game-config instead of raw Convex config.",
            },
            {
              name: "@/convex/foodConfig",
              message:
                "Import from @game/shared/contracts/game-config instead of raw Convex config.",
            },
            {
              name: "@/convex/clothingConfig",
              message:
                "Import from @game/shared/contracts/game-config instead of raw Convex config.",
            },
          ],
        },
      ],
    },
  },
]);
