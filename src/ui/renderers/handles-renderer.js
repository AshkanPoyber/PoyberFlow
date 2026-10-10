/* ============================================================
   Handles Renderer — draws input/output dots on a node card.

   Rules:
   - Input handles are positioned along the left edge.
   - Output handles are positioned along the right edge.
   - When a node has multiple outputs (like IF), they are
     distributed vertically with a small gap.
   - Handles carry `data-handle-id`, `data-handle-kind`, and
     `data-node-id` so the connection system in R3 can find them.
   ============================================================ */

import { el } from "../../utils/dom.js";

const VARIANT_COLORS = {
  success: "var(--color-success)",
  error: "var(--color-error)",
  default: "var(--color-border-strong)",
};

function handleDot({ nodeId, handle, kind, top }) {
  const color = VARIANT_COLORS[handle.variant] || VARIANT_COLORS.default;

  return el(
    "div",
    {
      class: "handle-dot absolute",
      dataset: {
        nodeId,
        handleId: handle.id,
        handleKind: kind,
      },
      style: {
        top: `${top}px`,
        // Vertical centering: 12px dot, so -6px from top
        // Left/right positioning handled by caller via transform.
        "--handle-color": color,
      },
    },
    [],
  );
}

/**
 * Renders handles into a container (usually the node card).
 * Positions are absolute and the container must be `relative`.
 */
export function renderHandles(node, cardEl) {
  const layoutTop = 8; // where handle cluster starts
  const gap = 22; // vertical gap between handles

  // Inputs — left edge
  node.inputs.forEach((input, index) => {
    const top = layoutTop + index * gap + gap / 2;
    const dot = handleDot({
      nodeId: node.id,
      handle: input,
      kind: "input",
      top,
    });
    dot.style.left = "0";
    dot.style.transform = "translate(-50%, -50%)";
    cardEl.appendChild(dot);
  });

  // Outputs — right edge
  node.outputs.forEach((output, index) => {
    const top = layoutTop + index * gap + gap / 2;
    const dot = handleDot({
      nodeId: node.id,
      handle: output,
      kind: "output",
      top,
    });
    dot.style.right = "0";
    dot.style.transform = "translate(50%, -50%)";
    cardEl.appendChild(dot);
  });
}
