import React from "react";
import { Sunrise, Sun, Sunset, Cloud, Moon } from "lucide-react";
import type { TimePhase } from "@/convex/timeConstants";
import { cn } from "@/lib/utils";

const phaseIcons: Record<TimePhase, React.ReactNode> = {
  DAWN: <Sunrise className="h-3.5 w-3.5 text-orange-400" />,
  MORNING: <Sun className="h-3.5 w-3.5 text-yellow-400" />,
  AFTERNOON: <Sun className="h-3.5 w-3.5 text-yellow-300" />,
  EVENING: <Sunset className="h-3.5 w-3.5 text-orange-500" />,
  DUSK: <Cloud className="h-3.5 w-3.5 text-purple-400" />,
  NIGHT: <Moon className="h-3.5 w-3.5 text-blue-300" />,
};

interface GameStatusProps {
  zoneName: string;
  time: string;
  phase: TimePhase;
  className?: string;
}

export function GameStatus({
  zoneName,
  time,
  phase,
  className,
}: GameStatusProps) {
  return (
    <div className={cn(className, "pointer-events-none")}>
      <div className="px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-white/10 shadow-lg flex items-center gap-3">
        <div className="flex items-center gap-1.5 border-r border-white/10">
          {phaseIcons[phase]}
          <span className="font-mono text-xs font-bold tabular-nums text-foreground">
            {time}
          </span>
        </div>
        <span className="text-xs font-bold text-foreground/80 flex items-center gap-1">
          <span>📍</span>
          {zoneName}
        </span>
      </div>
    </div>
  );
}
