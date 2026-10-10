/* ============================================================
   Delete Interaction — handles Delete / Backspace for both
   nodes and edges.

   Priority: if edges are selected, delete them first.
   Then, if nodes are selected, delete them (with their edges).
   ============================================================ */

import { DeleteNodeCommand } from "../history/commands/delete-node-command.js";
import { DeleteEdgeCommand } from "../history/commands/delete-edge-command.js";
import { findNode } from "../graph/graph.js";
import { findEdge, edgesForNode } from "../graph/edge.js";

export function attachNodeDelete({ store, history }) {
  window.addEventListener("keydown", (event) => {
    if (event.key !== "Delete" && event.key !== "Backspace") return;

    const t = event.target;
    const typing =
      t instanceof HTMLElement &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.isContentEditable);
    if (typing) return;

    const { selection, workflow } = store.getState();
    if (selection.nodeIds.length === 0 && selection.edgeIds.length === 0)
      return;

    event.preventDefault();

    // Delete selected edges first.
    for (const edgeId of selection.edgeIds) {
      const edge = findEdge(workflow.edges, edgeId);
      if (!edge) continue;
      history.push(new DeleteEdgeCommand(edge, selection));
    }

    // Then nodes (each with their connected edges).
    for (const nodeId of selection.nodeIds) {
      const node = findNode(workflow.nodes, nodeId);
      if (!node) continue;
      const connected = edgesForNode(store.getState().workflow.edges, nodeId);
      history.push(new DeleteNodeCommand(node, selection, connected));
    }
  });
}
