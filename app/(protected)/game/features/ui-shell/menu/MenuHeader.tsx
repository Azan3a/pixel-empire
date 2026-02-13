// app/(protected)/game/features/ui-shell/menu/MenuHeader.tsx
"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NavId } from "./constants";

interface MenuHeaderProps {
  activeNav: NavId;
  setActiveNav: (id: NavId) => void;
}

export function MenuHeader({ activeNav, setActiveNav }: MenuHeaderProps) {
  const currentItem = NAV_ITEMS.find((n) => n.id === activeNav)!;

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <currentItem.icon className="size-4" />
              {currentItem.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1 md:hidden">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={cn(
              "p-2 rounded-lg transition-colors relative",
              activeNav === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <item.icon className="size-4" />
          </button>
        ))}
      </div>
    </header>
  );
}
