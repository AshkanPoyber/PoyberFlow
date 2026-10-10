/* ============================================================
   DeleteNodeCommand — removes a node (and its edges), undoable.
   ============================================================ */

import { Command } from "../command.js";
import { addNode, removeNode } from "../../graph/graph.js";
import { removeEdgesForNode } from "../../graph/edge.js";

export class DeleteNodeCommand extends Command {
  label = "Delete node";

  constructor(node, previousSelection, connectedEdges = []) {
    super();
    this.node = node;
    this.connectedEdges = connectedEdges;
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
    const edges = removeEdgesForNode(workflow.edges, this.node.id);
    store.setState({
      workflow: { ...workflow, nodes, edges },
      selection: {
        nodeIds: selection.nodeIds.filter((id) => id !== this.node.id),
        edgeIds: selection.edgeIds,
      },
    });
  }

  undo(store) {
    const { workflow } = store.getState();
    const nodes = addNode(workflow.nodes, this.node);
    const edges = [...workflow.edges, ...this.connectedEdges];
    store.setState({
      workflow: { ...workflow, nodes, edges },
      selection: this.previousSelection,
    });
  }
}
