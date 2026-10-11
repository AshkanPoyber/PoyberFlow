/* ============================================================
   Rectangle Selection Interaction

   Flow:
     pointerdown on empty workspace (left button) → start rect
     pointermove → update rect; live-update selection
     pointerup → commit selection, remove rect overlay

   Rules:
   - Nodes whose bounding box intersects the rect are selected.
   - Edges are selected only if BOTH endpoints are inside.
   - Shift + drag adds to the existing selection.
   - Selection changes do NOT create history commands.
   ============================================================ */

import { el } from "../utils/dom.js";

const NODE_WIDTH = 220;
const NODE_HEIGHT_FALLBACK = 80;

export function attachRectangleSelection({
  workspaceEl,
  viewportEl,
  store,
  camera,
}) {
  let rect = null;
  let overlayEl = null;
  let baseSelection = null;

  workspaceEl.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (workspaceEl.style.cursor === "grab") return;
    if (workspaceEl.style.cursor === "grabbing") return;

    // Only start on empty workspace.
    const onNode = event.target.closest("[data-node-id]");
    const onEdge = event.target.closest("[data-edge-id]");
    const onHandle = event.target.closest(".handle-dot");
    if (onNode || onEdge || onHandle) return;

    const rectBounds = workspaceEl.getBoundingClientRect();
    const startLocal = {
      x: event.clientX - rectBounds.left,
      y: event.clientY - rectBounds.top,
    };

    baseSelection = event.shiftKey
      ? { ...store.getState().selection }
      : { nodeIds: [], edgeIds: [] };

    rect = {
      startLocal,
      pointerId: event.pointerId,
      started: false,
    };

    overlayEl = el("div", { class: "rect-select-overlay" });
    overlayEl.style.left = `${startLocal.x}px`;
    overlayEl.style.top = `${startLocal.y}px`;
    overlayEl.style.width = "0px";
    overlayEl.style.height = "0px";
    workspaceEl.appendChild(overlayEl);

    workspaceEl.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  workspaceEl.addEventListener("pointermove", (event) => {
    if (!rect || event.pointerId !== rect.pointerId) return;

    const bounds = workspaceEl.getBoundingClientRect();
    const currentLocal = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    const dx = currentLocal.x - rect.startLocal.x;
    const dy = currentLocal.y - rect.startLocal.y;

    if (!rect.started && Math.hypot(dx, dy) < 4) return;
    rect.started = true;

    // Draw the overlay in local (workspace) space.
    const left = Math.min(rect.startLocal.x, currentLocal.x);
    const top = Math.min(rect.startLocal.y, currentLocal.y);
    const width = Math.abs(dx);
    const height = Math.abs(dy);

    overlayEl.style.left = `${left}px`;
    overlayEl.style.top = `${top}px`;
    overlayEl.style.width = `${width}px`;
    overlayEl.style.height = `${height}px`;

    // Convert the two local corners into world space.
    const worldA = camera.screenToWorld(
      rect.startLocal.x + bounds.left,
      rect.startLocal.y + bounds.top,
      bounds,
    );
    const worldB = camera.screenToWorld(
      currentLocal.x + bounds.left,
      currentLocal.y + bounds.top,
      bounds,
    );

    const worldRect = {
      minX: Math.min(worldA.x, worldB.x),
      minY: Math.min(worldA.y, worldB.y),
      maxX: Math.max(worldA.x, worldB.x),
      maxY: Math.max(worldA.y, worldB.y),
    };

    updateSelection(store, baseSelection, worldRect);
  });

  function finish(event) {
    if (!rect || event.pointerId !== rect.pointerId) return;

    const started = rect.started;
    rect = null;

    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }

    baseSelection = null;

    if (!started) {
      // Treat as a click → clear selection (unless shift held).
      const current = store.getState().selection;
      if (current.nodeIds.length === 0 && current.edgeIds.length === 0) {
        return;
      }
      store.setState({ selection: { nodeIds: [], edgeIds: [] } });
    }
  }

  workspaceEl.addEventListener("pointerup", finish);
  workspaceEl.addEventListener("pointercancel", finish);
}

/* ---------- Selection math ---------- */

function nodeWorldBox(node, measuredHeight) {
  return {
    minX: node.position.x,
    minY: node.position.y,
    maxX: node.position.x + NODE_WIDTH,
    maxY: node.position.y + (measuredHeight || NODE_HEIGHT_FALLBACK),
  };
}

function boxesIntersect(a, b) {
  return !(
    a.maxX < b.minX ||
    a.minX > b.maxX ||
    a.maxY < b.minY ||
    a.minY > b.maxY
  );
}

function edgeFullyInside(edge, nodes, rect) {
  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);
  if (!source || !target) return false;

  const sourceBox = nodeWorldBox(source);
  const targetBox = nodeWorldBox(target);
  return fullyInside(sourceBox, rect) && fullyInside(targetBox, rect);
}

function fullyInside(box, rect) {
  return (
    box.minX >= rect.minX &&
    box.maxX <= rect.maxX &&
    box.minY >= rect.minY &&
    box.maxY <= rect.maxY
  );
}

function updateSelection(store, baseSelection, worldRect) {
  const { workflow } = store.getState();

  const nodeIds = [...baseSelection.nodeIds];
  for (const node of workflow.nodes) {
    const box = nodeWorldBox(node);
    if (boxesIntersect(box, worldRect) && !nodeIds.includes(node.id)) {
      nodeIds.push(node.id);
    }
  }

  const edgeIds = [...baseSelection.edgeIds];
  for (const edge of workflow.edges) {
    if (
      edgeFullyInside(edge, workflow.nodes, worldRect) &&
      !edgeIds.includes(edge.id)
    ) {
      edgeIds.push(edge.id);
    }
  }

  store.setState({ selection: { nodeIds, edgeIds } });
}
