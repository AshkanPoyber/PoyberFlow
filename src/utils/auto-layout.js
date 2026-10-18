/* ============================================================
   Auto Layout — arranges nodes based on graph structure.

   Algorithm (BFS layered layout):
   - Find Start node(s) as roots.
   - BFS from roots; assign each node a "depth" (layer).
   - Position nodes in columns by depth, spread vertically
     within each column.
   - Any nodes not reachable from Start go to a separate column
     at the far right so they don't get lost.
   ============================================================ */

import { NODE_TYPES } from "../core/constants.js";

const COLUMN_GAP = 340;
const ROW_GAP = 180;
const START_X = 80;
const START_Y = 100;

export function computeAutoLayout(nodes, edges) {
  if (!nodes || nodes.length === 0) return new Map();

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  // Build adjacency
  const adjacency = new Map();
  for (const n of nodes) adjacency.set(n.id, []);
  for (const e of edges) {
    if (adjacency.has(e.source) && nodeById.has(e.target)) {
      adjacency.get(e.source).push(e.target);
    }
  }

  // BFS from every Start node
  const depth = new Map();
  const queue = [];
  for (const n of nodes) {
    if (n.type === NODE_TYPES.START) {
      depth.set(n.id, 0);
      queue.push(n.id);
    }
  }

  while (queue.length) {
    const id = queue.shift();
    const d = depth.get(id);
    for (const next of adjacency.get(id) || []) {
      if (!depth.has(next) || depth.get(next) < d + 1) {
        depth.set(next, d + 1);
        queue.push(next);
      }
    }
  }

  // Unreachable nodes → put at far right
  const maxReachableDepth = Math.max(0, ...depth.values());
  const unreachableDepth = maxReachableDepth + 1;
  for (const n of nodes) {
    if (!depth.has(n.id)) depth.set(n.id, unreachableDepth);
  }

  // Group by depth
  const columns = new Map();
  for (const [id, d] of depth.entries()) {
    if (!columns.has(d)) columns.set(d, []);
    columns.get(d).push(id);
  }

  // Assign positions
  const positions = new Map();
  const sortedDepths = [...columns.keys()].sort((a, b) => a - b);

  for (const d of sortedDepths) {
    const ids = columns.get(d);
    // Preserve a stable order: sort by original y for consistency
    ids.sort((a, b) => {
      const na = nodeById.get(a);
      const nb = nodeById.get(b);
      return (na?.position?.y ?? 0) - (nb?.position?.y ?? 0);
    });

    const totalHeight = (ids.length - 1) * ROW_GAP;
    const startY = START_Y - totalHeight / 2 + 200; // center in a band

    ids.forEach((id, i) => {
      positions.set(id, {
        x: START_X + d * COLUMN_GAP,
        y: startY + i * ROW_GAP,
      });
    });
  }

  return positions;
}
