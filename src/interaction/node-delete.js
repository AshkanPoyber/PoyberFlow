/* ============================================================
   Delete Interaction — removes the selected node with
   Delete / Backspace.

   Uses DeleteNodeCommand so the action is undoable.
   ============================================================ */

import { DeleteNodeCommand } from "../history/commands/delete-node-command.js";
import { findNode } from "../graph/graph.js";

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
    if (selection.nodeIds.length === 0) return;

    event.preventDefault();

    // Single-select in R2, but the loop keeps it ready for R4.
    for (const nodeId of selection.nodeIds) {
      const node = findNode(workflow.nodes, nodeId);
      if (!node) continue;
      history.push(new DeleteNodeCommand(node, selection));
    }
  });
}
