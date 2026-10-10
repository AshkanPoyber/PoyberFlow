/* ============================================================
   Connection Drag Interaction

   Flow:
     pointerdown on output handle
       → enter "connecting" mode
     pointermove
       → draw live bezier from source handle to cursor
     pointerup
       → if over a valid input handle, emit AddEdgeCommand
       → else cancel

   Validation rules (R3):
     - Cannot connect output → output
     - Cannot connect input → input
     - Cannot connect to self
     - No duplicate edges
   ============================================================ */

import { el, clear } from "../utils/dom.js";
import { buildLiveBezierPath } from "../utils/geometry.js";
import { createEdge, edgeExists } from "../graph/edge.js";
import { AddEdgeCommand } from "../history/commands/add-edge-command.js";
import { findNode } from "../graph/graph.js";
import { getNodeDefinition } from "../nodes/registry.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    n.setAttribute(k, String(v));
  }
  return n;
}

function getHandleWorldPosition(handleEl, viewportEl, nodeEl) {
  // The handle is positioned absolutely inside the node card.
  // We compute its world-space position from the node's stored
  // position plus the handle's offset within the card.
  const handleRect = handleEl.getBoundingClientRect();
  const viewportRect = viewportEl.getBoundingClientRect();

  // Read the transform from the viewport element.
  const transform = viewportEl.style.transform || "";
  const match =
    /translate3d\(([-\d.]+)px,\s*([-\d.]+)px.*?scale\(([\d.]+)\)/.exec(
      transform,
    );
  const tx = match ? parseFloat(match[1]) : 0;
  const ty = match ? parseFloat(match[2]) : 0;
  const zoom = match ? parseFloat(match[3]) : 1;

  // Handle center in screen space:
  const cx = handleRect.left + handleRect.width / 2;
  const cy = handleRect.top + handleRect.height / 2;

  // Screen → world
  const worldX = (cx - viewportRect.left - tx) / zoom;
  const worldY = (cy - viewportRect.top - ty) / zoom;

  return { x: worldX, y: worldY, _nodeEl: nodeEl };
}

export function attachConnectionDrag({
  workspaceEl,
  viewportEl,
  edgesLayerEl,
  store,
  history,
}) {
  let state = null;

  workspaceEl.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    const handleEl = event.target.closest(".handle-dot");
    if (!handleEl) return;

    const kind = handleEl.dataset.handleKind;
    if (kind !== "output") return;

    const nodeId = handleEl.dataset.nodeId;
    const handleId = handleEl.dataset.handleId;
    const nodeEl = handleEl.closest("[data-node-id]");

    const source = getHandleWorldPosition(handleEl, viewportEl, nodeEl);

    // Create a temporary "live" path.
    const livePath = svgEl("path", {
      class: "edge-live",
      fill: "none",
      stroke: "var(--color-brand)",
      "stroke-width": 2,
      "stroke-dasharray": "6 4",
      "stroke-linecap": "round",
      "pointer-events": "none",
    });
    edgesLayerEl.appendChild(livePath);

    state = {
      sourceNodeId: nodeId,
      sourceHandleId: handleId,
      sourceWorld: { x: source.x, y: source.y },
      livePath,
      pointerId: event.pointerId,
      hoverHandleEl: null,
    };

    workspaceEl.setPointerCapture?.(event.pointerId);
    workspaceEl.style.cursor = "crosshair";
    event.preventDefault();
  });

  workspaceEl.addEventListener("pointermove", (event) => {
    if (!state || event.pointerId !== state.pointerId) return;

    const viewportRect = viewportEl.getBoundingClientRect();
    const transform = viewportEl.style.transform || "";
    const match =
      /translate3d\(([-\d.]+)px,\s*([-\d.]+)px.*?scale\(([\d.]+)\)/.exec(
        transform,
      );
    const tx = match ? parseFloat(match[1]) : 0;
    const ty = match ? parseFloat(match[2]) : 0;
    const zoom = match ? parseFloat(match[3]) : 1;

    const worldX = (event.clientX - viewportRect.left - tx) / zoom;
    const worldY = (event.clientY - viewportRect.top - ty) / zoom;

    const d = buildLiveBezierPath(
      state.sourceWorld.x,
      state.sourceWorld.y,
      worldX,
      worldY,
    );
    state.livePath.setAttribute("d", d);

    // Highlight valid target under the cursor.
    const hovered = document.elementFromPoint(event.clientX, event.clientY);
    const hoverHandle = hovered?.closest?.(".handle-dot");
    const valid =
      hoverHandle &&
      hoverHandle.dataset.handleKind === "input" &&
      hoverHandle.dataset.nodeId !== state.sourceNodeId;

    if (state.hoverHandleEl && state.hoverHandleEl !== hoverHandle) {
      state.hoverHandleEl.classList.remove("is-connect-target");
      state.hoverHandleEl = null;
    }
    if (valid && hoverHandle !== state.hoverHandleEl) {
      hoverHandle.classList.add("is-connect-target");
      state.hoverHandleEl = hoverHandle;
    }
  });

  function endConnection(event) {
    if (!state || event.pointerId !== state.pointerId) return;

    const { sourceNodeId, sourceHandleId, livePath, hoverHandleEl } = state;

    livePath.remove();
    if (hoverHandleEl) hoverHandleEl.classList.remove("is-connect-target");

    workspaceEl.style.cursor = "";
    state = null;

    if (!hoverHandleEl) return;

    const targetNodeId = hoverHandleEl.dataset.nodeId;
    const targetHandleId = hoverHandleEl.dataset.handleId;

    if (targetNodeId === sourceNodeId) return;

    const { workflow } = store.getState();

    // Validate direction
    const targetNode = findNode(workflow.nodes, targetNodeId);
    const targetDef = targetNode && getNodeDefinition(targetNode.type);
    if (!targetDef) return;

    const candidate = {
      source: sourceNodeId,
      sourceHandle: sourceHandleId,
      target: targetNodeId,
      targetHandle: targetHandleId,
    };

    if (edgeExists(workflow.edges, candidate)) return;

    const edge = createEdge(candidate);
    history.push(new AddEdgeCommand(edge));
  }

  workspaceEl.addEventListener("pointerup", endConnection);
  workspaceEl.addEventListener("pointercancel", endConnection);
}
