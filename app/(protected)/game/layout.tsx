import { Header } from "@/app/(protected)/game/components/ui/Header";
import { GameMenu } from "@/app/(protected)/game/features/ui-shell/menu/GameMenu";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950 font-sans antialiased">
      {/* The game canvas as full background */}
      <div className="absolute inset-0 z-0 overflow-hidden">{children}</div>

      {/* HUD Overlay - Stays on top but doesn't block mouse on the canvas unless clicking UI */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Top Left HUD: Menu + Stats */}
        <div className="flex items-center gap-3 p-4">
          <GameMenu />
          <Header />
        </div>
      </div>
    </div>
  );
}
