// components/game/ui/bottom-panel/JobsTab.tsx
"use client";

import { useWorld } from "@/hooks/use-world";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";

export function JobsTab() {
  const { workJob } = useWorld();

  return (
    <TabsContent value="jobs" className="mt-0">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between border p-4 rounded-lg bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Labor Shift</h3>
              <p className="text-xs text-muted-foreground">
                Manual labor at the docks.
              </p>
            </div>
          </div>
          <Button onClick={() => workJob()} size="sm">
            Work (+$50)
          </Button>
        </div>
        {/* Add more placeholder jobs if you want */}
      </div>
    </TabsContent>
  );
}
