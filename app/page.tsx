// app/page.tsx
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Truck,
  TrendingUp,
  Users,
  ChevronRight,
  Gamepad2,
  Crown,
  Zap,
} from "lucide-react";

function PixelDivider() {
  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2"
          style={{
            backgroundColor:
              i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#059669" : "transparent",
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
}

function PixelCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="group relative">
      {/* Pixel border effect */}
      <div className="absolute -inset-px bg-linear-to-b from-white/10 to-transparent rounded-none" />
      <div
        className="relative bg-[#1a1a2e] border-2 border-[#2a2a4a] p-6 
        hover:border-emerald-500/50 transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
        style={{
          clipPath:
            "polygon(0 8px, 8px 8px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px))",
        }}
      >
        <div
          className="w-12 h-12 flex items-center justify-center mb-4 border-2"
          style={{
            borderColor: accent,
            backgroundColor: `${accent}15`,
          }}
        >
          {icon}
        </div>
        <h3 className="font-bold text-white text-lg mb-2 tracking-wide font-mono">
          {title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StepBlock({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start group">
      <div
        className="shrink-0 w-12 h-12 bg-emerald-500/10 border-2 border-emerald-500/30 
        flex items-center justify-center font-mono font-black text-emerald-400 text-lg
        group-hover:bg-emerald-500/20 group-hover:border-emerald-400/50 transition-all"
      >
        {number}
      </div>
      <div>
        <h4 className="font-bold text-white font-mono tracking-wide">
          {title}
        </h4>
        <p className="text-white/40 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="bg-[#0d0d1a] text-white min-h-screen overflow-hidden">
      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <div className="relative min-h-screen w-full">
        {/* Pixel grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-linear(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-linear(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
            imageRendering: "pixelated",
          }}
        />

        {/* linear orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-linear(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
          }}
        />

        {/* ── Header ── */}
        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between py-6 px-6 md:px-10">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              alt="Pixel Empire"
              className="h-10 w-10"
              height={40}
              src="/logo.png"
              width={40}
              style={{ imageRendering: "pixelated" }}
            />
            <span className="font-mono font-black text-lg tracking-wider hidden sm:block">
              PIXEL<span className="text-emerald-400">EMPIRE</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="#features"
              className="hidden md:block text-sm text-white/50 hover:text-white transition-colors font-mono tracking-wide"
            >
              FEATURES
            </Link>
            <Link
              href="#gameplay"
              className="hidden md:block text-sm text-white/50 hover:text-white transition-colors font-mono tracking-wide"
            >
              GAMEPLAY
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-400 
                  hover:bg-emerald-500/20 hover:border-emerald-400 
                  font-mono font-bold tracking-wider rounded-none px-6
                  transition-all duration-200"
              >
                PLAY NOW
              </Button>
            </Link>
          </nav>
        </header>

        {/* ── Hero Content ── */}
        <main className="relative z-10 flex items-center justify-center min-h-screen px-6 md:px-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 mt-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 font-mono text-xs tracking-widest text-emerald-400">
              <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
              MULTIPLAYER • LIVE ECONOMY
            </div>

            {/* Title */}
            <h1 className="font-black tracking-tight leading-[0.95]">
              <span
                className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-mono"
                style={{
                  textShadow:
                    "4px 4px 0px rgba(16,185,129,0.3), -1px -1px 0px rgba(0,0,0,0.5)",
                }}
              >
                PIXEL
              </span>
              <span
                className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-mono text-emerald-400"
                style={{
                  textShadow:
                    "4px 4px 0px rgba(16,185,129,0.15), -1px -1px 0px rgba(0,0,0,0.5)",
                }}
              >
                EMPIRE
              </span>
            </h1>

            {/* Pixel divider */}
            <PixelDivider />

            {/* Subtitle */}
            <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Build your financial empire in a persistent top-down city.
              <br className="hidden md:block" />
              <span className="text-white/70">
                Run deliveries. Buy property. Dominate the economy.
              </span>
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login">
                <Button
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black 
                    text-base tracking-wider rounded-none px-10 py-6
                    shadow-[4px_4px_0px_0px_rgba(16,185,129,0.4)]
                    hover:shadow-[2px_2px_0px_0px_rgba(16,185,129,0.4)]
                    hover:translate-x-0.5 hover:-translate-y-0.5
                    transition-all duration-150"
                >
                  START PLAYING
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="ghost"
                  className="text-white/50 hover:text-white font-mono tracking-wider rounded-none px-8 py-6
                    border-2 border-transparent hover:border-white/10 transition-all"
                >
                  LEARN MORE
                </Button>
              </Link>
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-center gap-8 md:gap-12 pt-4">
              {[
                { label: "PLAYERS", value: "LIVE" },
                { label: "PROPERTIES", value: "100+" },
                { label: "PRICE", value: "FREE" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-emerald-400 font-mono font-black text-lg">
                    {stat.value}
                  </div>
                  <div className="text-white/30 font-mono text-[10px] tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-4 h-4 border-b-2 border-r-2 border-white/20 rotate-45" />
        </div>
      </div>

      {/* ═══════════════ FEATURES SECTION ═══════════════ */}
      <section id="features" className="relative py-32 px-6 md:px-10">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-linear(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-linear(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "16px 16px",
          }}
        />

        <div className="max-w-6xl mx-auto relative">
          {/* Section header */}
          <div className="text-center space-y-4 mb-20">
            <div className="inline-block px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 font-mono text-xs tracking-widest text-emerald-400">
              CORE FEATURES
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-mono tracking-tight">
              YOUR CITY.
              <br />
              <span className="text-emerald-400">YOUR RULES.</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Every block is a potential asset. Every player is competition.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PixelCard
              icon={<Truck className="w-6 h-6 text-yellow-400" />}
              title="DELIVERIES"
              description="Accept delivery jobs across the city. Pick up, drop off, earn cash. Your hustle, your schedule."
              accent="#facc15"
            />
            <PixelCard
              icon={<Building2 className="w-6 h-6 text-emerald-400" />}
              title="REAL ESTATE"
              description="Buy properties, collect income. From houses to malls, every building generates income."
              accent="#10b981"
            />
            <PixelCard
              icon={<Users className="w-6 h-6 text-blue-400" />}
              title="MULTIPLAYER"
              description="A persistent world shared with real players. See others roaming the city in real-time."
              accent="#3b82f6"
            />
            <PixelCard
              icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
              title="ECONOMY"
              description="Dynamic property values, hunger mechanics, and strategic survival in a living economy."
              accent="#a855f7"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════ GAMEPLAY LOOP SECTION ═══════════════ */}
      <section id="gameplay" className="relative py-32 px-6 md:px-10">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-500/2 to-transparent" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — visual */}
            <div className="relative">
              <div
                className="aspect-square max-w-md mx-auto bg-[#1a1a2e] border-2 border-[#2a2a4a] p-8
                  flex items-center justify-center relative overflow-hidden"
                style={{
                  clipPath:
                    "polygon(0 16px, 16px 16px, 16px 0, calc(100% - 16px) 0, calc(100% - 16px) 16px, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 16px calc(100% - 16px), 0 calc(100% - 16px))",
                }}
              >
                {/* Inner pixel art illustration */}
                <div className="grid grid-cols-8 grid-rows-8 gap-1 w-full h-full max-w-70 max-h-70">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const row = Math.floor(i / 8);
                    const col = i % 8;
                    // Create a simple city silhouette pattern
                    const isBuilding =
                      (row >= 4 && col >= 1 && col <= 2) ||
                      (row >= 3 && col >= 3 && col <= 4) ||
                      (row >= 5 && col >= 5 && col <= 6) ||
                      (row >= 2 && col === 4);
                    const isRoad = row === 7;
                    const isSky = row <= 1;
                    const isStar =
                      (row === 0 && col === 1) ||
                      (row === 1 && col === 6) ||
                      (row === 0 && col === 5);
                    const isWindow =
                      isBuilding && (i + row) % 3 === 0 && row > 2;

                    let bg = "bg-[#0d0d1a]";
                    if (isRoad) bg = "bg-[#3a3a3a]";
                    else if (isWindow) bg = "bg-yellow-400/80";
                    else if (isBuilding) bg = "bg-[#2a2a4a]";
                    else if (isStar) bg = "bg-white/60";
                    else if (isSky) bg = "bg-[#0d0d1a]";
                    else bg = "bg-[#111122]";

                    return (
                      <div
                        key={i}
                        className={`${bg} transition-colors duration-1000`}
                        style={{ imageRendering: "pixelated" }}
                      />
                    );
                  })}
                </div>

                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-emerald-500/30" />
                <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-emerald-500/30" />
                <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-emerald-500/30" />
                <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-emerald-500/30" />
              </div>
            </div>

            {/* Right — steps */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 font-mono text-xs tracking-widest text-emerald-400">
                  THE CORE LOOP
                </div>
                <h2 className="text-4xl md:text-5xl font-black font-mono tracking-tight">
                  FROM HUSTLE
                  <br />
                  <span className="text-emerald-400">TO EMPIRE</span>
                </h2>
              </div>

              <div className="space-y-6">
                <StepBlock
                  number="01"
                  title="ACCEPT DELIVERIES"
                  description="Pick up jobs. Navigate the city streets. Deliver on time for cash."
                />
                <StepBlock
                  number="02"
                  title="EARN & SURVIVE"
                  description="Spend wisely, buy food to stay alive, save the rest for investments."
                />
                <StepBlock
                  number="03"
                  title="BUY PROPERTY"
                  description="Purchase buildings. Each one generates passive income over time."
                />
                <StepBlock
                  number="04"
                  title="BUILD YOUR EMPIRE"
                  description="Expand your portfolio. Climb the ranks. Become the wealthiest player."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ DAY/NIGHT SECTION ═══════════════ */}
      <section className="relative py-32 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-1 bg-purple-500/10 border border-purple-500/20 font-mono text-xs tracking-widest text-purple-400">
              LIVING WORLD
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-mono tracking-tight">
              THE CITY
              <br />
              <span className="text-purple-400">NEVER SLEEPS</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              A real-time day/night cycle transforms the city. Watch windows
              light up at dusk, streets glow under lamplight, and the economy
              shift with the hours.
            </p>
          </div>

          {/* Day/Night visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Day card */}
            <div
              className="relative p-8 border-2 border-yellow-500/20 bg-linear-to-br from-sky-900/20 to-yellow-900/10
                overflow-hidden group hover:border-yellow-500/40 transition-all"
            >
              <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.4)]" />
              <div className="space-y-3 relative">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="font-mono font-bold text-yellow-400 text-sm tracking-wider">
                    DAYTIME
                  </span>
                </div>
                <p className="text-white/50 text-sm">
                  Full visibility. Peak delivery hours. Higher foot traffic
                  means more opportunities.
                </p>
              </div>
              {/* Pixel ground */}
              <div className="flex gap-0.5 mt-6">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-3 flex-1"
                    style={{
                      backgroundColor:
                        i % 4 === 0
                          ? "#4a7a4a"
                          : i % 4 === 1
                            ? "#3d6b3d"
                            : i % 4 === 2
                              ? "#4a7a4a"
                              : "#3a3a3a",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Night card */}
            <div
              className="relative p-8 border-2 border-blue-500/20 bg-linear-to-br from-indigo-950/40 to-purple-950/20
                overflow-hidden group hover:border-blue-500/40 transition-all"
            >
              <div className="absolute top-4 right-4 w-6 h-6 bg-blue-200 rounded-full shadow-[0_0_15px_rgba(147,197,253,0.3)]" />
              <div className="absolute top-6 right-14 w-1 h-1 bg-white/40 rounded-full" />
              <div className="absolute top-10 right-8 w-1 h-1 bg-white/20 rounded-full" />
              <div className="space-y-3 relative">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-blue-400" />
                  <span className="font-mono font-bold text-blue-400 text-sm tracking-wider">
                    NIGHTTIME
                  </span>
                </div>
                <p className="text-white/50 text-sm">
                  Windows glow warm. Streets dim. Night-shift jobs unlock with
                  premium payouts.
                </p>
              </div>
              {/* Pixel ground — darker */}
              <div className="flex gap-0.5 mt-6">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-3 flex-1"
                    style={{
                      backgroundColor:
                        i % 4 === 0
                          ? "#1a3a1a"
                          : i % 4 === 1
                            ? "#152915"
                            : i % 4 === 2
                              ? "#1a3a1a"
                              : "#1a1a1a",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="relative py-32 px-6 md:px-10">
        <div className="absolute inset-0 bg-linear-to-t from-emerald-500/3 to-transparent" />

        <div className="max-w-3xl mx-auto text-center relative space-y-8">
          <PixelDivider />

          <Gamepad2 className="w-12 h-12 text-emerald-500/30 mx-auto" />

          <h2 className="text-4xl md:text-6xl font-black font-mono tracking-tight">
            READY TO
            <br />
            <span className="text-emerald-400">BUILD?</span>
          </h2>

          <p className="text-white/40 max-w-md mx-auto">
            Jump into Pixel Empire. No downloads. No installs. Just open your
            browser and start your journey from delivery runner to real estate
            mogul.
          </p>

          <div className="pt-4">
            <Link href="/login">
              <Button
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black 
                  text-lg tracking-wider rounded-none px-14 py-7
                  shadow-[6px_6px_0px_0px_rgba(16,185,129,0.3)]
                  hover:shadow-[3px_3px_0px_0px_rgba(16,185,129,0.3)]
                  hover:translate-x-0.5 hover:-translate-y-0.5
                  transition-all duration-150"
              >
                PLAY FREE NOW
                <ChevronRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
          </div>

          <PixelDivider />
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              alt="Pixel Empire"
              className="h-8 w-8"
              height={32}
              src="/logo.png"
              width={32}
              style={{ imageRendering: "pixelated" }}
            />
            <span className="font-mono font-bold text-sm text-white/30 tracking-wider">
              PIXEL<span className="text-emerald-500/50">EMPIRE</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-white/20 text-xs font-mono">
              © {new Date().getFullYear()} PIXEL EMPIRE
            </span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5"
                  style={{
                    backgroundColor: i % 2 === 0 ? "#10b98133" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
