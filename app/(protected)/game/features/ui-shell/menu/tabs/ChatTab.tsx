"use client";

interface ChatTabProps {
  playerName: string;
}

export function ChatTab({ playerName }: ChatTabProps) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-bold mb-1">Chat & Activity Log</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Game events and messages.
      </p>

      <div className="flex-1 bg-muted/30 rounded-xl p-4">
        <div className="space-y-2 text-sm font-mono text-muted-foreground">
          <p>
            <span className="text-muted-foreground/50">[08:42:01]</span> Welcome
            to Pixel Empire,{" "}
            <span className="text-foreground font-bold">{playerName}</span>!
          </p>
          <p>
            <span className="text-muted-foreground/50">[08:42:05]</span> Use
            WASD or Arrow keys to explore the world.
          </p>
          <p>
            <span className="text-muted-foreground/50">[08:43:10]</span> Pro
            tip: Gather Ore for higher profits!
          </p>
        </div>
      </div>

      <div className="mt-3 text-xs border-t pt-3 italic text-muted-foreground text-center">
        💬 Full chat system coming soon in Alpha v0.2...
      </div>
    </div>
  );
}
