"use client";

import { useWorld } from "@game/features/world/state/use-world";
import { usePlayer } from "@game/features/player/hooks/use-player";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  Home,
  Store,
  Factory,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ZONES,
  INCOME_COOLDOWN_MS,
  type PropertyCategory,
} from "@game/shared/contracts/game-config";

const CATEGORY_ICONS: Record<PropertyCategory, React.ReactNode> = {
  residential: <Home className="size-4 text-orange-500" />,
  commercial: <Building2 className="size-4 text-blue-500" />,
  shop: <Store className="size-4 text-purple-500" />,
  service: <Factory className="size-4 text-amber-500" />,
};

function formatCooldown(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "< 1 min";
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${minutes} min`;
}

export function PropertiesTab() {
  const { properties, ownedCount, totalIncomePerCycle } = useWorld();
  const { playerInfo } = usePlayer();

  if (!playerInfo) return null;

  const ownedProperties = properties.filter((p) => p.isOwned);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Building2 className="size-5 text-muted-foreground" />
            My Properties
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your property empire. Income is collected automatically while you
            are active.
          </p>
        </div>
      </div>

      {ownedCount > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 p-3 rounded-xl border bg-card/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Properties
            </span>
            <span className="text-xl font-bold tabular-nums">{ownedCount}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-xl border bg-card/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Income / Cycle
            </span>
            <span className="text-xl font-bold tabular-nums text-emerald-500">
              <span className="flex items-center gap-1">
                <TrendingUp className="size-4" />$
                {totalIncomePerCycle.toLocaleString()}
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-xl border bg-card/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Cycle Time
            </span>
            <span className="text-xl font-bold tabular-nums flex items-center gap-1">
              <Clock className="size-4 text-muted-foreground" />
              {formatCooldown(INCOME_COOLDOWN_MS)}
            </span>
          </div>
        </div>
      )}

      {ownedCount === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <span className="text-4xl block mb-3">🏠</span>
          <p className="text-sm font-medium">
            You don&apos;t own any properties yet.
          </p>
          <p className="text-xs mt-1">
            Click on buildings in the world to purchase them and start earning
            passive income.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ownedProperties.map((prop) => {
            const zoneDef = ZONES[prop.zoneId];

            return (
              <div
                key={prop._id}
                className="border rounded-xl p-4 bg-card/60 hover:bg-card/90 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {CATEGORY_ICONS[prop.category]}
                    <span className="font-bold text-sm">{prop.name}</span>
                  </div>
                  <span className="flex items-center gap-0.5 text-emerald-500 font-mono font-bold text-sm">
                    <DollarSign className="size-3.5" />
                    {prop.income}
                    <span className="text-[10px] text-muted-foreground font-normal">
                      /cycle
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>📍 {zoneDef.name}</span>
                    <span>•</span>
                    <span className="capitalize">{prop.category}</span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-mono",
                      prop.ownerCount > 1
                        ? "text-amber-500"
                        : "text-muted-foreground/50",
                    )}
                  >
                    {prop.ownerCount}/{prop.maxOwners} owners
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
