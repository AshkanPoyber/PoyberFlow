/* ============================================================
   MoveNodeCommand — undoable node reposition.

   Uses graph helpers so the mutation stays pure.
   Never touches the DOM.
   ============================================================ */

import { Command } from "../command.js";
import { moveNode } from "../../graph/graph.js";

export class MoveNodeCommand extends Command {
  label = "Move node";

  constructor(nodeId, from, to) {
    super();
    this.nodeId = nodeId;
    this.from = { ...from };
    this.to = { ...to };
  }

  do(store) {
    const { workflow } = store.getState();
    const nodes = moveNode(workflow.nodes, this.nodeId, this.to);
    store.setState({ workflow: { ...workflow, nodes } });
  }

  undo(store) {
    const { workflow } = store.getState();
    const nodes = moveNode(workflow.nodes, this.nodeId, this.from);
    store.setState({ workflow: { ...workflow, nodes } });
  }
}
