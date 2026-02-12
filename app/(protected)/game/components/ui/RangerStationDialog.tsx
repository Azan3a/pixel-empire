"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AXE_ITEM, WOOD_ITEM } from "@/convex/treeConfig";
import { cn } from "@/lib/utils";

interface RangerStationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerCash: number;
  axeQty: number;
  woodQty: number;
  onBuyAxe: () => Promise<{ success: boolean; error?: string }>;
  onSellWood: (
    quantity: number,
  ) => Promise<{ success: boolean; error?: string }>;
}

export function RangerStationDialog({
  open,
  onOpenChange,
  playerCash,
  axeQty,
  woodQty,
  onBuyAxe,
  onSellWood,
}: RangerStationDialogProps) {
  const hasAxe = axeQty >= 1;
  const canAffordAxe = playerCash >= AXE_ITEM.price;
  const canSellWood = woodQty > 0;
  const sellValue = woodQty * WOOD_ITEM.sellPrice;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🏕️</span>
            Ranger Station
          </DialogTitle>
          <DialogDescription>
            Buy axes and sell wood collected from the forest.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="rounded-lg border bg-card/50 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{AXE_ITEM.emoji}</span>
              <div>
                <div className="font-bold">{AXE_ITEM.name}</div>
                <div className="text-xs text-muted-foreground">
                  Owned: <span className="font-mono font-bold">{axeQty}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={onBuyAxe}
              disabled={!canAffordAxe || hasAxe}
              className={cn(
                (!canAffordAxe || hasAxe) && "opacity-60 cursor-not-allowed",
              )}
            >
              {hasAxe ? "Owned" : `Buy $${AXE_ITEM.price}`}
            </Button>
          </div>

          <div className="rounded-lg border bg-card/50 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{WOOD_ITEM.emoji}</span>
              <div>
                <div className="font-bold">{WOOD_ITEM.name}</div>
                <div className="text-xs text-muted-foreground">
                  You have{" "}
                  <span className="font-mono font-bold">{woodQty}</span> (worth{" "}
                  <span className="font-mono font-bold">${sellValue}</span>)
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => onSellWood(woodQty)}
              disabled={!canSellWood}
              className={cn(!canSellWood && "opacity-60 cursor-not-allowed")}
            >
              Sell All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
