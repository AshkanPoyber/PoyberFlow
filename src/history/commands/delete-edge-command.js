/* ============================================================
   DeleteEdgeCommand — removes an edge, undoable.
   ============================================================ */

import { Command } from "../command.js";
import { addEdge, removeEdge } from "../../graph/edge.js";

export class DeleteEdgeCommand extends Command {
  label = "Delete edge";

  constructor(edge, previousSelection) {
    super();
    this.edge = edge;
    this.previousSelection = previousSelection
      ? {
          nodeIds: [...previousSelection.nodeIds],
          edgeIds: [...previousSelection.edgeIds],
        }
      : { nodeIds: [], edgeIds: [] };
  }

  do(store) {
    const { workflow, selection } = store.getState();
    const edges = removeEdge(workflow.edges, this.edge.id);
    store.setState({
      workflow: { ...workflow, edges },
      selection: {
        nodeIds: selection.nodeIds,
        edgeIds: selection.edgeIds.filter((id) => id !== this.edge.id),
      },
    });
  }

  undo(store) {
    const { workflow } = store.getState();
    const edges = addEdge(workflow.edges, this.edge);
    store.setState({
      workflow: { ...workflow, edges },
      selection: this.previousSelection,
    });
  }
}
