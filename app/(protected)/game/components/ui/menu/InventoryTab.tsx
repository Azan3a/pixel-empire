// components/game/ui/menu/InventoryTab.tsx
"use client";

import { useFood } from "@game/hooks/use-food";
import { usePlayer } from "@game/hooks/use-player";
import {
  FOOD_ITEMS,
  FOOD_KEYS,
  FoodType,
  MAX_HUNGER,
} from "@/convex/foodConfig";
import { cn } from "@/lib/utils";
import { UtensilsCrossed } from "lucide-react";

interface InventoryItem {
  item: string;
  quantity: number;
}

interface InventoryTabProps {
  inventory: InventoryItem[] | undefined;
}

export function InventoryTab({ inventory }: InventoryTabProps) {
  const { consumeFood } = useFood();
  const { playerInfo } = usePlayer();

  const hunger = playerInfo?.hunger ?? MAX_HUNGER;
  const isFull = hunger >= MAX_HUNGER;

  const getItemIcon = (name: string) => {
    // Check if it's a food item
    if (FOOD_KEYS.has(name)) {
      return FOOD_ITEMS[name as FoodType].emoji;
    }
    switch (name) {
      case "supplies":
        return "📦";
      case "wood":
        return "🪵";
      case "stone":
        return "🪨";
      default:
        return "🥡";
    }
  };

  const getItemLabel = (name: string) => {
    if (FOOD_KEYS.has(name)) {
      return FOOD_ITEMS[name as FoodType].name;
    }
    return name;
  };

  // Split inventory into food and other items
  const foodItems = inventory?.filter((i) => FOOD_KEYS.has(i.item)) ?? [];
  const otherItems = inventory?.filter((i) => !FOOD_KEYS.has(i.item)) ?? [];

  return (
    <div className="h-full">
      <h3 className="text-lg font-bold mb-1">Your Inventory</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Items and resources you&apos;ve collected. Consume food to restore
        hunger.
      </p>

      {/* Food items */}
      {foodItems.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <UtensilsCrossed className="size-3.5 text-orange-500" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Food
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {foodItems.map((item) => {
              const food = FOOD_ITEMS[item.item as FoodType];
              return (
                <div
                  key={item.item}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors group"
                >
                  <span className="text-3xl mb-1">
                    {getItemIcon(item.item)}
                  </span>
                  <span className="text-xs font-bold opacity-60">
                    {getItemLabel(item.item)}
                  </span>
                  <span className="text-lg font-black mb-2">
                    x{item.quantity}
                  </span>

                  <button
                    onClick={() => consumeFood(item.item as FoodType)}
                    disabled={isFull}
                    className={cn(
                      "w-full px-2 py-1.5 rounded-lg text-xs font-bold transition-colors",
                      isFull
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-emerald-600 text-white hover:bg-emerald-700",
                    )}
                  >
                    {isFull ? "Full" : `Eat (+${food.hunger})`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other items */}
      {otherItems.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">📦</span>
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Items
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {otherItems.map((item) => (
              <div
                key={item.item}
                className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors"
              >
                <span className="text-3xl mb-1">{getItemIcon(item.item)}</span>
                <span className="text-xs font-bold uppercase opacity-50">
                  {getItemLabel(item.item)}
                </span>
                <span className="text-lg font-black">{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!inventory || inventory.length === 0) && (
        <div className="w-full text-center py-16 text-muted-foreground italic">
          <span className="text-4xl block mb-3">🎒</span>
          Your pack is empty — visit the Shop to buy food and supplies!
        </div>
      )}
    </div>
  );
}
