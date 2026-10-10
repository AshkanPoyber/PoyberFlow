/* ============================================================
   Node Drag Interaction

   Changes in R1:
   - Uses camera.screenDeltaToWorldDelta() so dragging is
     correct at any zoom level.
   - No direct state writes during the drag; only one Command
     is committed on release.
   ============================================================ */

import { MoveNodeCommand } from "../history/commands/move-node-command.js";
import { findNode } from "../graph/graph.js";

export function attachNodeDrag({ workspaceEl, store, history, camera }) {
  let drag = null;

  workspaceEl.addEventListener("pointerdown", (event) => {
    // Ignore when the user is panning with space/middle-mouse.
    if (event.button !== 0) return;
    if (workspaceEl.style.cursor === "grab") return;
    if (workspaceEl.style.cursor === "grabbing") return;

    const nodeEl = event.target.closest("[data-node-id]");
    if (!nodeEl) return;

    const nodeId = nodeEl.dataset.nodeId;
    const node = findNode(store.getState().workflow.nodes, nodeId);
    if (!node) return;

    drag = {
      nodeId,
      nodeEl,
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...node.position },
      moved: false,
      pointerId: event.pointerId,
    };

    nodeEl.style.cursor = "grabbing";
    nodeEl.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  window.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;

    const dxScreen = event.clientX - drag.startX;
    const dyScreen = event.clientY - drag.startY;

    if (!drag.moved && Math.hypot(dxScreen, dyScreen) < 3) return;
    drag.moved = true;

    // Screen delta → world delta via the camera.
    const { dx, dy } = camera.screenDeltaToWorldDelta(dxScreen, dyScreen);

    drag.nodeEl.style.left = `${drag.origin.x + dx}px`;
    drag.nodeEl.style.top = `${drag.origin.y + dy}px`;
  });

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;

    const { nodeEl, nodeId, moved, origin } = drag;
    nodeEl.style.cursor = "grab";

    if (!moved) {
      drag = null;
      return;
    }

    const to = {
      x: parseFloat(nodeEl.style.left),
      y: parseFloat(nodeEl.style.top),
    };

    drag = null;

    if (origin.x === to.x && origin.y === to.y) return;
    history.push(new MoveNodeCommand(nodeId, origin, to));
  }

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
}
