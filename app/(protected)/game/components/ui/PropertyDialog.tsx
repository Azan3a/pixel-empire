// components/game/ui/PropertyDialog.tsx
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
import { Property } from "@game/types/property";
import {
  DollarSign,
  Home,
  Building2,
  MapPin,
  TrendingDown,
  Store,
  Landmark,
  Users,
  Factory,
  TreePine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SELL_RATE } from "@/convex/gameConstants";
import { ZONES } from "@/convex/mapZones";
import type { PropertyCategory, ZoneId } from "@/convex/mapZones";

interface PropertyDialogProps {
  property: Property | null;
  playerCash: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuy: () => void;
  onSell: () => void;
}

const CATEGORY_ICONS: Record<PropertyCategory, React.ReactNode> = {
  residential: <Home className="size-5 text-orange-500" />,
  commercial: <Building2 className="size-5 text-blue-500" />,
  shop: <Store className="size-5 text-purple-500" />,
  service: <Landmark className="size-5 text-amber-500" />,
};

const CATEGORY_COLORS: Record<PropertyCategory, string> = {
  residential: "text-orange-600",
  commercial: "text-blue-600",
  shop: "text-purple-600",
  service: "text-amber-600",
};

function getZoneIcon(zoneId: ZoneId): React.ReactNode {
  switch (zoneId) {
    case "downtown":
      return <Building2 className="size-3 text-muted-foreground" />;
    case "industrial":
      return <Factory className="size-3 text-muted-foreground" />;
    case "forest":
      return <TreePine className="size-3 text-muted-foreground" />;
    default:
      return <MapPin className="size-3 text-muted-foreground" />;
  }
}

export function PropertyDialog({
  property,
  playerCash,
  open,
  onOpenChange,
  onBuy,
  onSell,
}: PropertyDialogProps) {
  if (!property) return null;

  const canAfford = playerCash >= property.price;
  const isOwned = property.isOwned;
  const isService = property.category === "service";
  const isFull = property.ownerCount >= property.maxOwners && !isService;
  const sellPrice = Math.round(property.price * SELL_RATE);
  const zoneDef = ZONES[property.zoneId];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {CATEGORY_ICONS[property.category]}
            {property.name}
            {isOwned && (
              <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Yours
              </span>
            )}
            {isService && (
              <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Public
              </span>
            )}
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Property details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Category
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold capitalize",
                      CATEGORY_COLORS[property.category],
                    )}
                  >
                    {property.category}
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

                {!isService && (
                  <>
                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {isOwned ? "Value" : "Price"}
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

                    {isOwned && property.totalEarned !== undefined && (
                      <div className="flex flex-col gap-1 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70">
                          Total Earned
                        </span>
                        <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                          <DollarSign className="size-3.5" />
                          {property.totalEarned.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Ownership info */}
              {!isService && (
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3" />
                    <span>
                      {property.ownerCount} / {property.maxOwners} owners
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {getZoneIcon(property.zoneId)}
                    <span>{zoneDef.name}</span>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                <span>
                  Position: ({Math.round(property.x)}, {Math.round(property.y)})
                </span>
              </div>

              {/* Context messages */}
              {isService ? (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
                  This is a public service building. It cannot be purchased but
                  provides services to all players.
                </div>
              ) : isOwned ? (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="size-4" />
                    <span className="font-bold">Sell value</span>
                  </div>
                  <span>
                    You can sell your ownership for{" "}
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
              ) : isFull ? (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
                  This property has reached the maximum number of owners (
                  {property.maxOwners}).
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
                  {property.ownerCount > 0 && (
                    <span className="block mt-1 text-xs text-muted-foreground">
                      {property.ownerCount}{" "}
                      {property.ownerCount === 1 ? "player" : "players"} already{" "}
                      {property.ownerCount === 1 ? "owns" : "own"} this
                      property. You&apos;ll get your own independent income
                      stream.
                    </span>
                  )}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{isOwned ? "Keep" : "Cancel"}</AlertDialogCancel>

          {isService ? null : isOwned ? (
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
              disabled={!canAfford || isFull}
              className={cn(
                !canAfford || isFull
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700",
              )}
            >
              <DollarSign className="size-4 mr-1" />
              {isFull
                ? "Max Owners Reached"
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
