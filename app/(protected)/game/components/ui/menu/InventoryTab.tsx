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
import {
  CLOTHING_KEYS,
  CLOTHING_ITEMS,
  ClothingType,
  ClothingSlot,
} from "@/convex/clothingConfig";
import { cn } from "@/lib/utils";
import { UtensilsCrossed, Shirt } from "lucide-react";
import { ClothingPreview } from "../ClothingPreview";

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
    if (FOOD_KEYS.has(name)) {
      return FOOD_ITEMS[name as FoodType].emoji;
    }
    if (CLOTHING_KEYS.has(name)) {
      return CLOTHING_ITEMS[name as ClothingType].emoji;
    }
    switch (name) {
      case "supplies":
        return "📦";
      case "axe":
        return "🪓";
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
    if (CLOTHING_KEYS.has(name)) {
      return CLOTHING_ITEMS[name as ClothingType].name;
    }
    if (name === "axe") return "Axe";
    if (name === "wood") return "Wood";
    return name;
  };

  const foodItems = inventory?.filter((i) => FOOD_KEYS.has(i.item)) ?? [];
  const clothingItems =
    inventory?.filter((i) => CLOTHING_KEYS.has(i.item)) ?? [];
  const otherItems =
    inventory?.filter(
      (i) => !FOOD_KEYS.has(i.item) && !CLOTHING_KEYS.has(i.item),
    ) ?? [];

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

      {/* Clothing items */}
      {clothingItems.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Shirt className="size-3.5 text-purple-500" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Clothing
            </h4>
            <span className="text-[10px] text-muted-foreground ml-auto">
              Equip in Wardrobe tab
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {clothingItems.map((item) => {
              const clothing = CLOTHING_ITEMS[item.item as ClothingType];
              return (
                <div
                  key={item.item}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className="size-12 flex items-center justify-center mb-1">
                    <ClothingPreview
                      slot={clothing.slot as ClothingSlot}
                      color={clothing.color}
                      size={40}
                    />
                  </div>
                  <span className="text-xs font-bold">
                    {getItemLabel(item.item)}
                  </span>
                  <span className="text-lg font-black">x{item.quantity}</span>
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
