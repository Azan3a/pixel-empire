"use client";

import { Graphics } from "pixi.js";
import { memo, useCallback } from "react";
import type { Tree } from "@game/types/tree";
import {
  TREE_GROWTH_STAGES,
  type TreeGrowthStage,
} from "@game/shared/contracts/game-config";

interface TreeNodeProps {
  tree: Tree;
  onInteract?: (tree: Tree) => void;
}

function TreeNodeInner({ tree, onInteract }: TreeNodeProps) {
  const drawTree = useCallback(
    (g: Graphics) => {
      g.clear();

      const stage =
        TREE_GROWTH_STAGES[tree.growthStage as TreeGrowthStage] ??
        TREE_GROWTH_STAGES.seedling;

      const size = stage.size;
      const trunkColor = 0x5c3a1a;
      const canopyDark = 0x1a4a1a;
      const canopyMid = 0x225a22;
      const canopyLight = 0x2a6a2a;

      const trunkW = Math.max(2, size * 0.25);
      const trunkH = Math.max(4, size * 0.6);
      g.rect(-trunkW / 2, -trunkH * 0.1, trunkW, trunkH);
      g.fill({ color: trunkColor, alpha: 0.9 });

      const canopyR = Math.max(3, size);
      const canopyY = -size * 0.6;
      g.circle(0, canopyY, canopyR);
      g.fill({ color: canopyDark, alpha: 0.75 });

      g.circle(-canopyR * 0.25, canopyY - canopyR * 0.15, canopyR * 0.75);
      g.fill({ color: canopyMid, alpha: 0.55 });

      g.circle(-canopyR * 0.15, canopyY - canopyR * 0.25, canopyR * 0.5);
      g.fill({ color: canopyLight, alpha: 0.45 });
    },
    [tree.growthStage],
  );

  return (
    <pixiContainer
      x={tree.x}
      y={tree.y}
      eventMode={onInteract ? "static" : "none"}
      cursor={onInteract ? "pointer" : "default"}
      onPointerTap={onInteract ? () => onInteract(tree) : undefined}
    >
      <pixiGraphics draw={drawTree} />
    </pixiContainer>
  );
}

export const TreeNode = memo(TreeNodeInner);
