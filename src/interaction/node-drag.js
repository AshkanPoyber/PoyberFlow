/* ============================================================
   Node Drag Interaction

   Changes in R4:
   - Dragging a selected node drags the entire selection.
   - Dragging an unselected node selects it first, then drags.
   - Emits a single MoveNodesCommand on release.
   ============================================================ */

import { MoveNodesCommand } from "../history/commands/move-nodes-command.js";
import { findNode } from "../graph/graph.js";

export function attachNodeDrag({ workspaceEl, store, history, camera }) {
  let drag = null;

  workspaceEl.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (workspaceEl.style.cursor === "grab") return;
    if (workspaceEl.style.cursor === "grabbing") return;

    const nodeEl = event.target.closest("[data-node-id]");
    if (!nodeEl) return;

    const nodeId = nodeEl.dataset.nodeId;
    const { selection, workflow } = store.getState();
    const node = findNode(workflow.nodes, nodeId);
    if (!node) return;

    let selectedIds = selection.nodeIds;
    if (!selectedIds.includes(nodeId)) {
      selectedIds = [nodeId];
      store.setState({ selection: { nodeIds: selectedIds, edgeIds: [] } });
    }

    const origins = new Map();
    for (const id of selectedIds) {
      const n = findNode(workflow.nodes, id);
      if (n) origins.set(id, { ...n.position });
    }

    const nodeEls = new Map();
    for (const id of selectedIds) {
      const el = workspaceEl.querySelector(`[data-node-id="${id}"]`);
      if (el) nodeEls.set(id, el);
    }

    drag = {
      primaryId: nodeId,
      selectedIds: [...selectedIds],
      startX: event.clientX,
      startY: event.clientY,
      origins,
      nodeEls,
      moved: false,
      pointerId: event.pointerId,
    };

    for (const el of nodeEls.values()) el.style.cursor = "grabbing";
    nodeEl.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  window.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;

    const dxScreen = event.clientX - drag.startX;
    const dyScreen = event.clientY - drag.startY;

    if (!drag.moved && Math.hypot(dxScreen, dyScreen) < 3) return;
    drag.moved = true;

    const { dx, dy } = camera.screenDeltaToWorldDelta(dxScreen, dyScreen);

    const snapEnabled =
      store.getState().ui.snapToGrid === true && !event.altKey;

    for (const [id, el] of drag.nodeEls) {
      const origin = drag.origins.get(id);
      if (!origin) continue;

      let nextX = origin.x + dx;
      let nextY = origin.y + dy;

      if (snapEnabled) {
        nextX = Math.round(nextX / 24) * 24;
        nextY = Math.round(nextY / 24) * 24;
      }

      el.style.left = `${nextX}px`;
      el.style.top = `${nextY}px`;
    }
  });

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;

    const { nodeEls, moved, origins, selectedIds, primaryId } = drag;

    for (const el of nodeEls.values()) el.style.cursor = "grab";

    if (!moved) {
      // Clicked without dragging:
      // If more than one node was selected and the user clicked
      // on one of them, reduce the selection to just that node.
      if (selectedIds.length > 1) {
        store.setState({
          selection: { nodeIds: [primaryId], edgeIds: [] },
        });
      }
      drag = null;
      return;
    }

    const moves = [];
    for (const [id, el] of nodeEls) {
      const origin = origins.get(id);
      if (!origin) continue;
      const to = {
        x: parseFloat(el.style.left),
        y: parseFloat(el.style.top),
      };
      if (origin.x === to.x && origin.y === to.y) continue;
      moves.push({ id, from: origin, to });
    }

    drag = null;

    if (moves.length === 0) return;
    history.push(new MoveNodesCommand(moves));
  }

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
}
