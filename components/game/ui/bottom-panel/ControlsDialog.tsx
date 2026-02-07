"use client";

import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ControlsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className="h-8 w-8">
          <HelpCircle className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Controls</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Move</span>
            <span className="font-bold font-mono">WASD / Arrows</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Gather</span>
            <span className="font-bold font-mono">Mouse Click</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Auto-Center</span>
            <span className="font-bold font-mono">N Key</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Tabs</span>
            <span className="font-bold font-mono">I | J | R | L</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
