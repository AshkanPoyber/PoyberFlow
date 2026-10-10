/* ============================================================
   DeleteNodeCommand — removes a node, restorable via undo.

   Also stores the previous selection so undo can restore it.
   ============================================================ */

import { Command } from "../command.js";
import { removeNode, addNode } from "../../graph/graph.js";

export class DeleteNodeCommand extends Command {
  label = "Delete node";

  constructor(node, previousSelection) {
    super();
    this.node = node;
    this.previousSelection = previousSelection
      ? {
          nodeIds: [...previousSelection.nodeIds],
          edgeIds: [...previousSelection.edgeIds],
        }
      : { nodeIds: [], edgeIds: [] };
  }

  do(store) {
    const { workflow, selection } = store.getState();
    const nodes = removeNode(workflow.nodes, this.node.id);
    store.setState({
      workflow: { ...workflow, nodes },
      selection: {
        nodeIds: selection.nodeIds.filter((id) => id !== this.node.id),
        edgeIds: selection.edgeIds,
      },
    });
  }

  undo(store) {
    const { workflow } = store.getState();
    const nodes = addNode(workflow.nodes, this.node);
    store.setState({
      workflow: { ...workflow, nodes },
      selection: this.previousSelection,
    });
  }
}
