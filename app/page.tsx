import { Button } from "@/components/ui/button";
import { Gamepad } from "lucide-react";
import Link from "next/link";

export default function page() {
  return (
    <div>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            // autoPlay
            muted
            // playsInline
            className="w-full h-full object-cover"
            poster="/hero02.webp"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between py-6 px-10">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <div className="bg-white rounded-full p-2">
                  <Gamepad className="text-black size-5" />
                </div>
              </Link>
            </div>

            {/* Right-side Navigation */}
            <div className="flex items-center space-x-8">
              <Link
                className="hidden md:block font-medium text-white text-sm transition-all duration-200 hover:opacity-80"
                href="/login"
              >
                Login
              </Link>
              <button className="flex items-center space-x-2 text-white">
                <span className="text-sm font-medium">Menu</span>
                <div className="space-y-1">
                  <div className="h-0.5 w-5 bg-white"></div>
                  <div className="h-0.5 w-5 bg-white"></div>
                </div>
              </button>
            </div>
          </header>

          {/* Hero Content */}
          <main className="flex-1 flex flex-col md:flex-row items-center justify-between px-10">
            {/* Left side navigation dots */}
            <div className="hidden md:flex flex-col space-y-4">
              {/* <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div> */}
            </div>

            {/* Right side content */}
            <div className="max-w-xl text-left md:text-left space-y-6 md:pr-20">
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]">
                Pixel Empire.
                <br />
                <span className="text-4xl md:text-6xl">The city is yours.</span>
              </h1>

              <p className="text-lg text-white/90 max-w-md font-light">
                A modern multiplayer business simulator. Work jobs, buy
                properties, and build a financial empire in a persistent retro
                world.
              </p>

              <div className="pt-4">
                <Button className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-8 py-6 rounded-full text-base font-medium transition-all">
                  <Link href="/login">Start Building</Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
