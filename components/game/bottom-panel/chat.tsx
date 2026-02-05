"use client";

import { TabsContent } from "@/components/ui/tabs";

interface ChatTabProps {
  playerName: string;
}

export function ChatTab({ playerName }: ChatTabProps) {
  return (
    <TabsContent value="chat" className="mt-0 h-full">
      <div className="flex flex-col h-full bg-muted/30 rounded-lg p-3">
        <div className="flex-1 text-[11px] font-mono text-muted-foreground">
          <p>[08:42:01] Welcome to Pixel Empire, {playerName}!</p>
          <p>[08:42:05] Use WASD or Arrows to explore the world.</p>
          <p>[08:43:10] Pro tip: Gather Ore for higher profits!</p>
        </div>
        <div className="mt-2 text-[10px] border-t pt-2 italic text-muted-foreground">
          Chat system coming soon in Alpha v0.2...
        </div>
      </div>
    </TabsContent>
  );
}
