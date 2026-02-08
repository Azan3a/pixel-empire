"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Property } from "@game/types/property";
import { useFood } from "@game/hooks/use-food";
import { FOOD_LIST } from "@/convex/foodConfig";
import { Id } from "@/convex/_generated/dataModel";
import { SELL_RATE } from "@/convex/gameConstants";
import { ZONES } from "@/convex/mapZones";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  MapPin,
  UtensilsCrossed,
  Wrench,
  Shirt,
  DollarSign,
  TrendingDown,
  Users,
  Building2,
} from "lucide-react";

interface ShopDialogProps {
  property: Property | null;
  playerCash: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuyProperty: () => void;
  onSellProperty: () => void;
}

const SHOP_CONFIG = {
  food_shop: {
    icon: UtensilsCrossed,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    label: "Food Shop",
    description: "Fresh food to keep your hunger at bay.",
    emoji: "🍔",
  },
  supply_store: {
    icon: Wrench,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Supply Store",
    description: "Tools and supplies for various jobs.",
    emoji: "🔧",
  },
  clothing_store: {
    icon: Shirt,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    label: "Clothing Store",
    description: "Customize your look with new outfits.",
    emoji: "👕",
  },
} as const;

/* ── Sub-components ─────────────────────────────────────────── */

function FoodShopContent({
  playerCash,
  shopPropertyId,
}: {
  playerCash: number;
  shopPropertyId: Id<"properties">;
}) {
  const { buyFood } = useFood();

  return (
    <div className="grid grid-cols-1 gap-3">
      {FOOD_LIST.map((food) => {
        const canAfford = playerCash >= food.price;

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
                  +{food.hunger} hunger
                </span>
              </div>
            </div>

            <button
              onClick={() => buyFood(food.key, shopPropertyId)}
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
  );
}

function ComingSoonContent({ label, emoji }: { label: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-5xl mb-4">{emoji}</span>
      <h4 className="text-lg font-bold mb-2">{label}</h4>
      <p className="text-sm text-muted-foreground max-w-xs">
        This shop is under construction. Check back soon for new items!
      </p>
    </div>
  );
}

function PropertySection({
  property,
  playerCash,
  onBuy,
  onSell,
}: {
  property: Property;
  playerCash: number;
  onBuy: () => void;
  onSell: () => void;
}) {
  const isOwned = property.isOwned;
  const isFull = property.ownerCount >= property.maxOwners;
  const canAfford = playerCash >= property.price;
  const sellPrice = Math.round(property.price * SELL_RATE);

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="size-4 text-muted-foreground" />
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Property
        </h4>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-mono font-bold">
              <DollarSign className="size-3" />
              {property.price.toLocaleString()}
            </span>
            <span className="text-emerald-600 font-medium text-xs">
              +${property.income}/cycle
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3" />
            <span>
              {property.ownerCount} / {property.maxOwners} owners
            </span>
          </div>
        </div>

        {isOwned ? (
          <button
            onClick={onSell}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
          >
            <TrendingDown className="size-3.5" />
            Sell ${sellPrice.toLocaleString()}
          </button>
        ) : (
          <button
            onClick={onBuy}
            disabled={!canAfford || isFull}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-colors",
              canAfford && !isFull
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            <DollarSign className="size-3.5" />
            {isFull
              ? "Full"
              : canAfford
                ? `Buy $${property.price.toLocaleString()}`
                : "Can't Afford"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */

export function ShopDialog({
  property,
  playerCash,
  open,
  onOpenChange,
  onBuyProperty,
  onSellProperty,
}: ShopDialogProps) {
  if (!property) return null;

  const config = SHOP_CONFIG[property.subType as keyof typeof SHOP_CONFIG];
  const zoneDef = ZONES[property.zoneId];

  if (!config) return null;

  const ShopIcon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={cn(
                "size-8 rounded-lg flex items-center justify-center",
                config.bgColor,
              )}
            >
              <ShopIcon className={cn("size-4", config.color)} />
            </div>
            {property.name}
            {property.isOwned && (
              <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Yours
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <MapPin className="size-3" />
            <span>{zoneDef.name}</span>
            <span>·</span>
            <span>{config.description}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Shop inventory — type-specific content */}
        <div className="mt-2">
          <div className="no-scrollbar -mx-4 max-h-[48vh] overflow-y-auto px-4">
            {property.subType === "food_shop" && (
              <FoodShopContent
                playerCash={playerCash}
                shopPropertyId={property._id}
              />
            )}
            {property.subType === "supply_store" && (
              <ComingSoonContent label="Supply Store" emoji="🔧" />
            )}
            {property.subType === "clothing_store" && (
              <ComingSoonContent label="Clothing Store" emoji="👕" />
            )}
          </div>
        </div>

        {/* Property buy/sell section */}
        <PropertySection
          property={property}
          playerCash={playerCash}
          onBuy={onBuyProperty}
          onSell={onSellProperty}
        />
      </DialogContent>
    </Dialog>
  );
}
