"use client";

import { GameCanvas } from "./components/viewport/GameCanvas";
import { usePreventZoom } from "@/hooks/use-prevent-zoom";

export default function GamePage() {
  usePreventZoom();

  return (
    <div className="w-full h-full relative">
      <GameCanvas />
    </div>
  );
}
