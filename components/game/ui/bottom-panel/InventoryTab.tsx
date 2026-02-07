// components/game/ui/bottom-panel/InventoryTab.tsx
"use client";

import { TabsContent } from "@/components/ui/tabs";

interface InventoryItem {
  item: string;
  quantity: number;
}

interface InventoryTabProps {
  inventory: InventoryItem[] | undefined;
}

export function InventoryTab({ inventory }: InventoryTabProps) {
  const getItemIcon = (name: string) => {
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

  return (
    <TabsContent value="inventory" className="mt-0">
      <div className="flex flex-wrap gap-4">
        {inventory?.map((item) => (
          <div
            key={item.item}
            className="flex flex-col items-center justify-center p-3 w-24 rounded-lg border bg-card/50"
          >
            <span className="text-2xl mb-1">{getItemIcon(item.item)}</span>
            <span className="text-[10px] font-bold uppercase opacity-50">
              {item.item}
            </span>
            <span className="text-sm font-black">{item.quantity}</span>
          </div>
        ))}
        {(!inventory || inventory.length === 0) && (
          <div className="w-full text-center py-8 text-muted-foreground italic text-sm">
            Your pack is empty...
          </div>
        )}
      </div>
    </TabsContent>
  );
}
