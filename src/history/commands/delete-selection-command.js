/* ============================================================
   DeleteSelectionCommand — deletes a mixed selection of nodes
   and edges as a single undoable action.

   Connected edges of deleted nodes are captured here so they
   can be restored together with their nodes.
   ============================================================ */

import { Command } from "../command.js";
import { addNode, removeNode } from "../../graph/graph.js";
import { addEdge, removeEdge } from "../../graph/edge.js";

export class DeleteSelectionCommand extends Command {
  label = "Delete selection";

  constructor({ nodes, edges, previousSelection }) {
    super();
    this.nodes = nodes;
    this.edges = edges;
    this.previousSelection = previousSelection
      ? {
          nodeIds: [...previousSelection.nodeIds],
          edgeIds: [...previousSelection.edgeIds],
        }
      : { nodeIds: [], edgeIds: [] };
  }

  do(store) {
    const { workflow } = store.getState();

    let nodes = workflow.nodes;
    let edges = workflow.edges;

    for (const n of this.nodes) nodes = removeNode(nodes, n.id);
    for (const e of this.edges) edges = removeEdge(edges, e.id);

    store.setState({
      workflow: { ...workflow, nodes, edges },
      selection: { nodeIds: [], edgeIds: [] },
    });
  }

  undo(store) {
    const { workflow } = store.getState();

    let nodes = workflow.nodes;
    let edges = workflow.edges;

    for (const n of this.nodes) nodes = addNode(nodes, n);
    for (const e of this.edges) edges = addEdge(edges, e);

    store.setState({
      workflow: { ...workflow, nodes, edges },
      selection: this.previousSelection,
    });
  }
}
