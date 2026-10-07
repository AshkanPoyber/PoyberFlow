/* ============================================================
   Node Drag Interaction

   Design:
   - During drag: mutate DOM directly for smoothness (no state writes).
   - On release: emit a single MoveNodeCommand so history stays clean.
   - The Interaction layer never calls store.setState directly.
   ============================================================ */

import { MoveNodeCommand } from "../history/commands/move-node-command.js";
import { findNode } from "../graph/graph.js";

export function attachNodeDrag({ workspaceEl, store, history }) {
  let drag = null;

  workspaceEl.addEventListener("pointerdown", (event) => {
    const nodeEl = event.target.closest("[data-node-id]");
    if (!nodeEl) return;
    if (event.button !== 0) return;

    const nodeId = nodeEl.dataset.nodeId;
    const node = findNode(store.getState().workflow.nodes, nodeId);
    if (!node) return;

    const start = { x: event.clientX, y: event.clientY };
    const origin = { ...node.position };

    drag = {
      nodeId,
      nodeEl,
      start,
      origin,
      moved: false,
    };

    nodeEl.style.cursor = "grabbing";
    nodeEl.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  window.addEventListener("pointermove", (event) => {
    if (!drag) return;

    const dx = event.clientX - drag.start.x;
    const dy = event.clientY - drag.start.y;

    if (!drag.moved && Math.hypot(dx, dy) < 3) return;
    drag.moved = true;

    const nextX = drag.origin.x + dx;
    const nextY = drag.origin.y + dy;

    // Direct DOM update for smoothness.
    drag.nodeEl.style.left = `${nextX}px`;
    drag.nodeEl.style.top = `${nextY}px`;
  });

  window.addEventListener("pointerup", () => {
    if (!drag) return;

    const nodeEl = drag.nodeEl;
    const nodeId = drag.nodeId;

    nodeEl.style.cursor = "grab";

    if (!drag.moved) {
      drag = null;
      return;
    }

    const finalX = parseFloat(nodeEl.style.left);
    const finalY = parseFloat(nodeEl.style.top);

    const from = { ...drag.origin };
    const to = { x: finalX, y: finalY };

    drag = null;

    // Only commit if position actually changed.
    if (from.x === to.x && from.y === to.y) return;

    history.push(new MoveNodeCommand(nodeId, from, to));
  });
}
