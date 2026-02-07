"use client";

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
    <div className="h-full">
      <h3 className="text-lg font-bold mb-1">Your Inventory</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Items and resources you&apos;ve collected.
      </p>

      <div className="flex flex-wrap gap-4">
        {inventory?.map((item) => (
          <div
            key={item.item}
            className="flex flex-col items-center justify-center p-4 w-28 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors"
          >
            <span className="text-3xl mb-2">{getItemIcon(item.item)}</span>
            <span className="text-xs font-bold uppercase opacity-50">
              {item.item}
            </span>
            <span className="text-lg font-black">{item.quantity}</span>
          </div>
        ))}
        {(!inventory || inventory.length === 0) && (
          <div className="w-full text-center py-16 text-muted-foreground italic">
            <span className="text-4xl block mb-3">🎒</span>
            Your pack is empty — explore the world and gather resources!
          </div>
        )}
      </div>
    </div>
  );
}
