"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

interface InventoryItem {
  item: string;
  quantity: number;
}

interface MarketTabProps {
  inventory: InventoryItem[] | undefined;
}

const MARKET_ITEMS = [
  { name: "wood", price: 5, emoji: "🪵" },
  { name: "stone", price: 10, emoji: "🪨" },
  { name: "ore", price: 25, emoji: "⬟" },
];

interface MarketResponse {
  success: boolean;
  error?: string;
}

export function MarketTab({ inventory }: MarketTabProps) {
  const sellResource = useMutation(api.world.sellResource);

  const handleSell = (itemName: string) => {
    sellResource({ item: itemName, amount: 1 }).then((res: MarketResponse) => {
      if (res && "error" in res && res.error) {
        toast.error(res.error);
      }
    });
  };

  return (
    <TabsContent value="market" className="mt-0">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MARKET_ITEMS.map((item) => {
          const quantity =
            inventory?.find((i) => i.item === item.name)?.quantity || 0;
          return (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 rounded-lg border bg-emerald-50/20 border-emerald-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.emoji}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    {item.name}
                  </span>
                  <span className="text-xs font-black text-emerald-600">
                    ${item.price} EA
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] bg-white"
                onClick={() => handleSell(item.name)}
                disabled={quantity <= 0}
              >
                Sell Item
              </Button>
            </div>
          );
        })}
      </div>
    </TabsContent>
  );
}
