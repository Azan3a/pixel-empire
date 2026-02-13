"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Tree } from "@game/types/tree";
import type { Id } from "@/convex/_generated/dataModel";
import {
  TREE_GROWTH_STAGES,
  TREE_INTERACT_RADIUS,
  type TreeGrowthStage,
} from "@game/shared/contracts/game-config";

interface UseTreesOptions {
  playerPosRef?: RefObject<{ x: number; y: number }>;
  hasAxe?: boolean;
}

export function useTrees({
  playerPosRef,
  hasAxe = false,
}: UseTreesOptions = {}) {
  const queryTrees = useQuery(api.trees.getForestTrees);
  const trees = useMemo(() => (queryTrees as Tree[]) || [], [queryTrees]);

  const initForestTreesMutation = useMutation(api.trees.initForestTrees);
  const chopTreeMutation = useMutation(api.trees.chopTree);
  const buyAxeMutation = useMutation(api.trees.buyAxe);
  const sellWoodMutation = useMutation(api.trees.sellWood);

  const [choppingTreeId, setChoppingTreeId] = useState<Id<"trees"> | null>(
    null,
  );
  const [chopProgress, setChopProgress] = useState(0);
  const chopStartAtRef = useRef<number | null>(null);
  const chopDurationMsRef = useRef<number>(0);

  const initForestTrees = async () => {
    try {
      return await initForestTreesMutation();
    } catch {
      return null;
    }
  };

  const chopTree = useCallback(
    async (treeId: Id<"trees">) => {
      try {
        const res = await chopTreeMutation({ treeId });
        toast.success(`Chopped tree! +${res.woodGained} wood ${res.woodEmoji}`);
        return { success: true };
      } catch (e: unknown) {
        const msg =
          e instanceof ConvexError
            ? (e.data as string)
            : e instanceof Error
              ? e.message
              : "Failed to chop tree";
        toast.error(msg);
        return { success: false, error: msg };
      }
    },
    [chopTreeMutation],
  );

  const cancelChopping = useCallback(() => {
    chopStartAtRef.current = null;
    chopDurationMsRef.current = 0;
    setChoppingTreeId(null);
    setChopProgress(0);
  }, []);

  const startChopping = (treeId: Id<"trees">) => {
    if (choppingTreeId) return;

    if (!hasAxe) {
      toast("You need an axe", {
        description: "Buy one at the Ranger Station.",
      });
      return;
    }

    const tree = trees.find((t) => t._id === treeId);
    if (!tree) return;

    const stage =
      TREE_GROWTH_STAGES[tree.growthStage as TreeGrowthStage] ??
      TREE_GROWTH_STAGES.seedling;

    if (stage.woodYield <= 0) {
      toast("Tree is too small", {
        description: "Let it grow before chopping.",
      });
      return;
    }

    const playerPos = playerPosRef?.current;
    if (playerPos) {
      const dx = tree.x - playerPos.x;
      const dy = tree.y - playerPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > TREE_INTERACT_RADIUS) {
        toast("Walk closer to chop", {
          description: "You need to be near the tree.",
        });
        return;
      }
    }

    chopDurationMsRef.current = stage.chopTimeMs;
    chopStartAtRef.current = Date.now();
    setChoppingTreeId(treeId);
    setChopProgress(0);
  };

  useEffect(() => {
    if (!choppingTreeId) return;

    const interval = setInterval(async () => {
      const startAt = chopStartAtRef.current;
      if (!startAt) return;

      const playerPos = playerPosRef?.current;
      if (playerPos) {
        const tree = trees.find((t) => t._id === choppingTreeId);
        if (!tree) {
          cancelChopping();
          return;
        }
        const dx = tree.x - playerPos.x;
        const dy = tree.y - playerPos.y;
        if (Math.sqrt(dx * dx + dy * dy) > TREE_INTERACT_RADIUS) {
          toast("Chopping cancelled", {
            description: "You walked too far away.",
          });
          cancelChopping();
          return;
        }
      }

      const elapsed = Date.now() - startAt;
      const duration = chopDurationMsRef.current || 1;
      const progress = Math.min(1, elapsed / duration);
      setChopProgress(progress);

      if (progress >= 1) {
        const targetId = choppingTreeId;
        cancelChopping();
        await chopTree(targetId);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [choppingTreeId, playerPosRef, trees, chopTree, cancelChopping]);

  const buyAxe = async () => {
    try {
      await buyAxeMutation({});
      toast.success("Bought an axe! 🪓");
      return { success: true };
    } catch (e: unknown) {
      const msg =
        e instanceof ConvexError
          ? (e.data as string)
          : e instanceof Error
            ? e.message
            : "Failed to buy axe";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const sellWood = async (quantity: number) => {
    try {
      const res = await sellWoodMutation({ quantity });
      toast.success(`Sold ${res.sold} wood for $${res.earned}`);
      return { success: true };
    } catch (e: unknown) {
      const msg =
        e instanceof ConvexError
          ? (e.data as string)
          : e instanceof Error
            ? e.message
            : "Failed to sell wood";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    trees,
    initForestTrees,
    chopTree,
    buyAxe,
    sellWood,
    startChopping,
    cancelChopping,
    choppingTreeId,
    chopProgress,
  };
}
