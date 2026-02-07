// These must stay in sync between backend (initCity) and frontend (WorldGrid)
export const MAP_SIZE = 2000;
export const TILE_SIZE = 50;
export const ROAD_SPACING = 250;
export const ROAD_WIDTH = 48;
export const SIDEWALK_W = 10;
export const ROAD_CORRIDOR = ROAD_WIDTH + SIDEWALK_W * 2; // 68
export const HALF_CORRIDOR = ROAD_CORRIDOR / 2; // 34
export const BUILDING_PAD = 20; // min gap from road edge to building
export const SELL_RATE = 0.7;

/** Compute the walkable block edges along one axis */
export function getBlockEdges(
  mapSize: number,
): { start: number; end: number }[] {
  const edges: { start: number; end: number }[] = [];
  let prevEnd = 0;

  for (let r = ROAD_SPACING; r < mapSize; r += ROAD_SPACING) {
    const roadStart = r - HALF_CORRIDOR;
    if (roadStart > prevEnd) {
      edges.push({ start: prevEnd, end: roadStart });
    }
    prevEnd = r + HALF_CORRIDOR;
  }

  if (prevEnd < mapSize) {
    edges.push({ start: prevEnd, end: mapSize });
  }

  return edges;
}

/** Compute all 2D city blocks (the rectangular gaps between roads) */
export function getCityBlocks(mapSize: number) {
  const edges = getBlockEdges(mapSize);
  const blocks: {
    bx: number;
    by: number;
    x: number;
    y: number;
    w: number;
    h: number;
  }[] = [];

  for (let xi = 0; xi < edges.length; xi++) {
    for (let yi = 0; yi < edges.length; yi++) {
      blocks.push({
        bx: xi,
        by: yi,
        x: edges[xi].start,
        y: edges[yi].start,
        w: edges[xi].end - edges[xi].start,
        h: edges[yi].end - edges[yi].start,
      });
    }
  }

  return blocks;
}

/** Find spawn point on the first intersection (safe road position) */
export function getSpawnPoint() {
  return { x: ROAD_SPACING, y: ROAD_SPACING }; // center of first intersection
}
