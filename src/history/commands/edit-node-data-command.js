/* ============================================================
   EditNodeDataCommand — changes `node.data` for a single node.

   Values are captured as before/after snapshots of `data`,
   so a single command can carry a full form save.
   ============================================================ */

import { Command } from "../command.js";
import { updateNode } from "../../graph/graph.js";

export class EditNodeDataCommand extends Command {
  label = "Edit node";

  constructor(nodeId, before, after) {
    super();
    this.nodeId = nodeId;
    this.before = { ...before };
    this.after = { ...after };
  }

  do(store) {
    const { workflow } = store.getState();
    const nodes = updateNode(workflow.nodes, this.nodeId, {
      data: { ...this.after },
    });
    store.setState({ workflow: { ...workflow, nodes } });
  }

  undo(store) {
    const { workflow } = store.getState();
    const nodes = updateNode(workflow.nodes, this.nodeId, {
      data: { ...this.before },
    });
    store.setState({ workflow: { ...workflow, nodes } });
  }
}
