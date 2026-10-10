/* ============================================================
   AddEdgeCommand — adds an edge to the graph.
   ============================================================ */

import { Command } from "../command.js";
import { addEdge, removeEdge } from "../../graph/edge.js";

export class AddEdgeCommand extends Command {
  label = "Add edge";

  constructor(edge) {
    super();
    this.edge = edge;
  }

  do(store) {
    const { workflow } = store.getState();
    const edges = addEdge(workflow.edges, this.edge);
    store.setState({ workflow: { ...workflow, edges } });
  }

  undo(store) {
    const { workflow, selection } = store.getState();
    const edges = removeEdge(workflow.edges, this.edge.id);
    store.setState({
      workflow: { ...workflow, edges },
      selection: {
        ...selection,
        edgeIds: selection.edgeIds.filter((id) => id !== this.edge.id),
      },
    });
  }
}
