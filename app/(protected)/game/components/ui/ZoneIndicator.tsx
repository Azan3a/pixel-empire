import React from "react";

interface ZoneIndicatorProps {
  zoneName: string;
}

export function ZoneIndicator({ zoneName }: ZoneIndicatorProps) {
  return (
    <div className="absolute top-20 left-4 z-30 pointer-events-none">
      <div className="px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-white/10 shadow-lg">
        <span className="text-xs font-bold text-foreground/80">
          📍 {zoneName}
        </span>
      </div>
    </div>
  );
}
