// components/game/ui/menu/WardrobeTab.tsx
"use client";

import { useClothing } from "@game/hooks/use-clothing";
import {
  CLOTHING_ITEMS,
  SLOT_LABELS,
  ClothingSlot,
  ClothingType,
} from "@/convex/clothingConfig";
import { cn } from "@/lib/utils";
import { Shirt, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClothingPreview } from "../ClothingPreview";

const SLOTS: ClothingSlot[] = ["hat", "shirt", "pants", "shoes"];

export function WardrobeTab() {
  const {
    equipClothing,
    unequipClothing,
    clothingInventory,
    equippedClothing,
  } = useClothing();

  return (
    <div className="h-full">
      <h3 className="text-lg font-bold mb-1">Wardrobe</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Equip clothing from your inventory to customize your look.
      </p>

      {/* ── Equipped Outfit ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shirt className="size-3.5 text-purple-500" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Current Outfit
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SLOTS.map((slot) => {
            const itemKey = equippedClothing[slot];
            const item = itemKey
              ? CLOTHING_ITEMS[itemKey as ClothingType]
              : null;
            const { label, emoji } = SLOT_LABELS[slot];

            return (
              <div
                key={slot}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl border transition-colors",
                  item
                    ? "bg-purple-500/5 border-purple-500/20"
                    : "bg-muted/20 border-dashed",
                )}
              >
                <div className="size-10 flex items-center justify-center mb-1">
                  {item ? (
                    <ClothingPreview slot={slot} color={item.color} size={32} />
                  ) : (
                    <span className="text-2xl">{emoji}</span>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {label}
                </span>
                {item ? (
                  <>
                    <span className="text-xs font-bold mb-2">{item.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => unequipClothing(slot)}
                    >
                      <X className="size-3 mr-1" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">
                    Empty
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Owned Clothing ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">👕</span>
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Your Clothing
          </h4>
        </div>

        {clothingInventory.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground italic">
            <span className="text-4xl block mb-3">🛍️</span>
            No clothing yet — visit a Clothing Store to buy some!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {clothingInventory.map((item) => {
              const isEquipped = equippedClothing[item.slot] === item.key;

              return (
                <div
                  key={item.key}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-xl border transition-colors",
                    isEquipped
                      ? "bg-purple-500/10 border-purple-500/30"
                      : "bg-card/50 hover:bg-card/80",
                  )}
                >
                  <div className="size-12 flex items-center justify-center mb-1">
                    <ClothingPreview
                      slot={item.slot as ClothingSlot}
                      color={item.color}
                      size={40}
                    />
                  </div>
                  <span className="text-xs font-bold">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground capitalize mb-1">
                    {item.slot}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground mb-2">
                    x{item.quantity}
                  </span>

                  {isEquipped ? (
                    <span className="text-[10px] font-bold text-purple-500 uppercase">
                      Equipped
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => equipClothing(item.key as ClothingType)}
                    >
                      Equip
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
