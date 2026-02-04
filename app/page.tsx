import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function page() {
  return (
    <div>
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">Pixel Empire</Link>
        </div>

        {/* Navigation */}
        <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center space-x-2">
          <Link
            className="rounded-full px-3 py-2 font-light text-primary-foreground text-xs transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="rounded-full px-3 py-2 font-light text-primary-foreground text-xs transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
            href="#pricing"
          >
            Pricing
          </Link>
          <Link
            className="rounded-full px-3 py-2 font-light text-primary-foreground text-xs transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
            href="#faqs"
          >
            FAQs
          </Link>
        </nav>

        <Button>
          <Link href="/login">Sign In</Link>
        </Button>
      </header>
    </div>
  );
}
