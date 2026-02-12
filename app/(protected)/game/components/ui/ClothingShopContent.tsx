// components/game/ui/ClothingShopContent.tsx
"use client";

import { useClothing } from "@game/hooks/use-clothing";
import {
  CLOTHING_BY_SLOT,
  SLOT_LABELS,
  ClothingSlot,
  ClothingType,
} from "@/convex/clothingConfig";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClothingShopContentProps {
  playerCash: number;
  shopPropertyId: Id<"properties">;
  isOwned: boolean;
}

export function ClothingShopContent({
  playerCash,
  shopPropertyId,
  isOwned,
}: ClothingShopContentProps) {
  const { buyClothing } = useClothing();

  const slots: ClothingSlot[] = ["hat", "shirt", "pants", "shoes"];

  return (
    <div className="space-y-5">
      {slots.map((slot) => {
        const items = CLOTHING_BY_SLOT[slot];
        const { label, emoji } = SLOT_LABELS[slot];

        return (
          <div key={slot}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {emoji} {label}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {items.map((item) => {
                const price = isOwned
                  ? Math.floor(item.price * 0.5)
                  : item.price;
                const canAfford = playerCash >= price;

                return (
                  <div
                    key={item.key}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-colors",
                      canAfford
                        ? "bg-card/50 hover:bg-card/80"
                        : "bg-muted/20 opacity-60",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <span className="font-bold text-sm block">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block size-3 rounded-full border"
                            style={{
                              backgroundColor: `#${item.color.toString(16).padStart(6, "0")}`,
                            }}
                          />
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {slot}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() =>
                        buyClothing(item.key as ClothingType, shopPropertyId)
                      }
                      disabled={!canAfford}
                      className={cn(
                        "flex items-center gap-1.5 text-sm font-bold",
                        canAfford
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed",
                      )}
                    >
                      <ShoppingCart className="size-3.5" />
                      <span className="font-mono">${price}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
