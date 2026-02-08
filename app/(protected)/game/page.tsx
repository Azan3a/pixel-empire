"use client";

import { GameCanvas } from "./components/viewport/GameCanvas";

export default function GamePage() {
  return (
    <div className="w-full h-full relative">
      <GameCanvas />
    </div>
  );
}
