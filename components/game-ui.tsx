/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, Package, BarChart3, Store } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

export function GameUI() {
  const playerInfo = useQuery(api.players.getPlayerInfo);
  const leaderboard = useQuery(api.players.getLeaderboard) || [];
  const sell = useMutation(api.world.sellResource);
  if (!playerInfo) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="pointer-events-auto flex items-center gap-4 rounded-xl bg-white/95 p-4 shadow-xl border border-emerald-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Balance
            </div>
            <div className="text-2xl font-black text-emerald-600">
              ${playerInfo.gold}
            </div>
          </div>
        </div>

        <div className="pointer-events-auto rounded-xl">
          <UserAvatar />
        </div>
      </div>

      {/* Bottom Interface */}
      <div className="flex items-end justify-center gap-6">
        <Card className="pointer-events-auto w-96 shadow-2xl bg-white/98 border-gray-100 overflow-hidden">
          <Tabs defaultValue="inventory" className="w-full">
            <div className="px-4 pt-2">
              <TabsList className="grid w-full grid-cols-3 bg-gray-50">
                <TabsTrigger value="inventory" className="gap-2">
                  <Package className="h-3.5 w-3.5" />
                  Inv
                </TabsTrigger>
                <TabsTrigger value="market" className="gap-2">
                  <Store className="h-3.5 w-3.5" />
                  Shop
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="gap-2">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Ranks
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="inventory" className="h-75 p-0 mt-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-3">
                  {playerInfo.inventory?.map((item: any) => (
                    <div
                      key={item.item}
                      className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center text-lg capitalize font-bold">
                          {item.item[0]}
                        </div>
                        <span className="font-semibold capitalize text-gray-700">
                          {item.item}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                  {(!playerInfo.inventory ||
                    playerInfo.inventory.length === 0) && (
                    <div className="text-center text-gray-400 py-10">
                      Your inventory is empty
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="market" className="h-75 p-4 mt-0">
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  Global Sell Prices
                </div>
                <div className="grid gap-3">
                  {[
                    { name: "wood", price: 5 },
                    { name: "stone", price: 10 },
                    { name: "ore", price: 25 },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-lg border border-emerald-100 bg-emerald-50/30"
                    >
                      <div className="capitalize font-bold text-gray-700">
                        {item.name}{" "}
                        <span className="text-xs font-normal text-gray-400">
                          (${item.price}ea)
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => sell({ item: item.name, amount: 1 })}
                        disabled={
                          (playerInfo.inventory?.find(
                            (i: any) => i.item === item.name,
                          )?.quantity || 0) <= 0
                        }
                      >
                        Sell 1
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="h-75] p-0 mt-0">
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {leaderboard.map((p, idx) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-sm font-bold text-gray-400">
                          #{idx + 1}
                        </span>
                        <span
                          className={`font-semibold ${p._id === playerInfo._id ? "text-emerald-600" : "text-gray-700"}`}
                        >
                          {p.name}
                        </span>
                      </div>
                      <span className="font-black text-gray-900">
                        ${p.gold}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
