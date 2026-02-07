// components/game/ui/PropertyPurchaseDialog.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Property } from "@/types/property";
import {
  DollarSign,
  Home,
  Building2,
  MapPin,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SELL_RATE } from "@/convex/gameConstants";

interface PropertyPurchaseDialogProps {
  property: Property | null;
  playerCash: number;
  isOwner: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuy: () => void;
  onSell: () => void;
}

export function PropertyDialog({
  property,
  playerCash,
  isOwner,
  open,
  onOpenChange,
  onBuy,
  onSell,
}: PropertyPurchaseDialogProps) {
  if (!property) return null;

  const canAfford = playerCash >= property.price;
  const isOwned = !!property.ownerId;
  const isOwnedByOther = isOwned && !isOwner;
  const isCommercial = property.type === "commercial";
  const sellPrice = Math.round(property.price * SELL_RATE);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isCommercial ? (
              <Building2 className="size-5 text-blue-500" />
            ) : (
              <Home className="size-5 text-orange-500" />
            )}
            {property.name}
            {isOwner && (
              <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Yours
              </span>
            )}
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Property details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Type
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold capitalize",
                      isCommercial ? "text-blue-600" : "text-orange-600",
                    )}
                  >
                    {property.type}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Size
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {property.width} × {property.height}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {isOwner ? "Value" : "Price"}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <DollarSign className="size-3.5" />
                    {property.price.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Income
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    +${property.income.toLocaleString()}/cycle
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                <span>
                  Position: ({Math.round(property.x)}, {Math.round(property.y)})
                </span>
              </div>

              {/* Context messages */}
              {isOwner ? (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="size-4" />
                    <span className="font-bold">Sell value</span>
                  </div>
                  <span>
                    You can sell this property for{" "}
                    <span className="font-mono font-bold">
                      ${sellPrice.toLocaleString()}
                    </span>{" "}
                    ({Math.round(SELL_RATE * 100)}% of purchase price). Your
                    balance after sale:{" "}
                    <span className="font-mono font-bold">
                      ${(playerCash + sellPrice).toLocaleString()}
                    </span>
                  </span>
                </div>
              ) : isOwnedByOther ? (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
                  This property is owned by another player.
                </div>
              ) : !canAfford ? (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-sm">
                  <span className="font-bold">Insufficient funds.</span> You
                  need{" "}
                  <span className="font-mono font-bold">
                    ${(property.price - playerCash).toLocaleString()}
                  </span>{" "}
                  more.
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm">
                  Your balance after purchase:{" "}
                  <span className="font-mono font-bold">
                    ${(playerCash - property.price).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{isOwner ? "Keep" : "Cancel"}</AlertDialogCancel>

          {isOwner ? (
            <AlertDialogAction
              onClick={onSell}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <TrendingDown className="size-4 mr-1" />
              Sell for ${sellPrice.toLocaleString()}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={onBuy}
              disabled={!canAfford || isOwnedByOther}
              className={cn(
                !canAfford || isOwnedByOther
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700",
              )}
            >
              <DollarSign className="size-4 mr-1" />
              {isOwnedByOther
                ? "Owned by Others"
                : canAfford
                  ? `Buy for $${property.price.toLocaleString()}`
                  : "Can't Afford"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
