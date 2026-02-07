const CONTROLS = [
  { action: "Move", key: "WASD / Arrows" },
  { action: "Interact", key: "F" },
  { action: "Toggle Menu", key: "Tab" },
  { action: "Inventory", key: "I" },
  { action: "Shop", key: "B" },
  { action: "Jobs", key: "J" },
  { action: "Rankings", key: "R" },
  { action: "Chat / Log", key: "L" },
  { action: "Controls", key: "H" },
  { action: "Food Menu", key: "E" },
  { action: "Close Menus", key: "Esc" },
];
export function ControlsTab() {
  return (
    <div className="h-full">
      <h3 className="text-lg font-bold mb-1">Keyboard Controls</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Quick reference for all keyboard shortcuts.
      </p>

      <div className="grid gap-2 max-w-lg">
        {CONTROLS.map((c) => (
          <div
            key={c.action}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm">{c.action}</span>
            <div className="flex gap-1.5">
              {c.key.split(" / ").map((k) => (
                <kbd
                  key={k}
                  className="px-2 py-1 bg-muted rounded-md text-xs font-mono font-bold border border-border/50"
                >
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border/50">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Press{" "}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border">
            Tab
          </kbd>{" "}
          anytime to toggle this menu. Use letter shortcuts to jump directly to
          a section.
        </p>
      </div>
    </div>
  );
}
