// components/game/ui/menu/ShopTab.tsx
"use client";

import { useFood } from "@game/hooks/use-food";
import { usePlayer } from "@game/hooks/use-player";
import { FOOD_LIST } from "@/convex/foodConfig";
import { cn } from "@/lib/utils";
import { ShoppingCart, UtensilsCrossed } from "lucide-react";

export function ShopTab() {
  const { buyFood } = useFood();
  const { playerInfo } = usePlayer();

  if (!playerInfo) return null;

  const cash = playerInfo.cash ?? 0;

  return (
    <div className="h-full">
      <h3 className="text-lg font-bold mb-1">Shop</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Buy food and supplies. Food goes into your inventory — consume it from
        there.
      </p>

      {/* Food section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <UtensilsCrossed className="size-4 text-orange-500" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Food
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FOOD_LIST.map((food) => {
            const canAfford = cash >= food.price;

            return (
              <div
                key={food.key}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-colors",
                  canAfford
                    ? "bg-card/50 hover:bg-card/80"
                    : "bg-muted/20 opacity-60",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{food.emoji}</span>
                  <div>
                    <span className="font-bold block">{food.name}</span>
                    <span className="text-xs text-emerald-600 font-medium">
                      +{food.hunger} hunger when consumed
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => buyFood(food.key)}
                  disabled={!canAfford}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-colors",
                    canAfford
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  <ShoppingCart className="size-3.5" />
                  <span className="font-mono">${food.price}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Placeholder for future shop categories */}
      <div className="border-t pt-6">
        <div className="text-center py-8 text-muted-foreground">
          <span className="text-3xl block mb-3">🏗️</span>
          <p className="text-sm font-medium">More items coming soon</p>
          <p className="text-xs mt-1">
            Tools, vehicles, and supplies will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
