/* ============================================================
   AddNodeCommand — inserts a node at a given position.
   ============================================================ */

import { Command } from "../command.js";
import { addNode, removeNode } from "../../graph/graph.js";

export class AddNodeCommand extends Command {
  label = "Add node";

  constructor(node) {
    super();
    this.node = node;
  }

  do(store) {
    const { workflow } = store.getState();
    const nodes = addNode(workflow.nodes, this.node);
    store.setState({ workflow: { ...workflow, nodes } });
  }

  undo(store) {
    const { workflow } = store.getState();
    const nodes = removeNode(workflow.nodes, this.node.id);
    // Also clear selection if it points at this node
    const { selection } = store.getState();
    if (selection.nodeIds.includes(this.node.id)) {
      store.setState({
        workflow: { ...workflow, nodes },
        selection: {
          ...selection,
          nodeIds: selection.nodeIds.filter((id) => id !== this.node.id),
        },
      });
    } else {
      store.setState({ workflow: { ...workflow, nodes } });
    }
  }
}
