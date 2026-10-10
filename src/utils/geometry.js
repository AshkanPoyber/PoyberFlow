/* ============================================================
   Geometry helpers — pure functions for positioning.

   The DOM knowledge of "where is a handle" lives here. Every
   other module just asks for world coordinates.
   ============================================================ */

/**
 * Compute the world-space position of a handle.
 *
 * A handle is rendered as a child of the node card, and the node
 * itself is positioned at `node.position` in world space.
 *
 * Because the node card can vary in height, we measure it from
 * the DOM the first time. To keep this cheap, callers should
 * pass a fresh measurement when they need precision.
 */
export function getHandleWorldPosition(node, handle, measuredSize) {
  const width = measuredSize?.width ?? 220;
  const height = measuredSize?.height ?? 80;

  // Layout constants must match handles-renderer.js
  const layoutTop = 8;
  const gap = 22;

  const isInput = node.inputs.some((h) => h.id === handle.id);
  const list = isInput ? node.inputs : node.outputs;
  const index = list.findIndex((h) => h.id === handle.id);
  const top = layoutTop + index * gap + gap / 2;

  const x = isInput ? node.position.x : node.position.x + width;
  const y = node.position.y + top;

  return { x, y };
}

/**
 * Bezier path between two world-space points.
 * Horizontal control points → smooth "S" curve.
 */
export function buildBezierPath(x1, y1, x2, y2) {
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  const c1x = x1 + dx;
  const c1y = y1;
  const c2x = x2 - dx;
  const c2y = y2;

  return `M ${x1},${y1} C ${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`;
}

/**
 * Bezier path from one fixed point to a live cursor point.
 */
export function buildLiveBezierPath(x1, y1, x2, y2) {
  return buildBezierPath(x1, y1, x2, y2);
}
