import { Header } from "@/app/(protected)/game/components/ui/Header";

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
      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col items-center">
        {/* Top HUD: Floating Stats */}
        <div className="pointer-events-auto h-20 w-full flex justify-center pt-4">
          <Header />
        </div>
      </div>
    </div>
  );
}
